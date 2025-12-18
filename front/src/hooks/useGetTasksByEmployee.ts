import { useState, useEffect, useCallback, useRef } from "react";

// Тип для задачи из API
interface ScheduleEntry {
  id: number;
  taskName: string;
  taskDescription: string;
  startDate: string;
  endDate: string;
  status: string;
  priority: string;
  employeeId: number;
  viewTask: string;
  counterparty?: string;
}

// Тип для ответа API
interface ApiResponse {
  success: boolean;
  message: string;
  data: ScheduleEntry[];
}

// Тип для Tip в нашем приложении
interface Tip {
  id: number;
  employee_name: string;
  task_name: string;
  task_description: string;
  counterparty: string;
  start_date: Date;
  end_date: Date;
  status: string;
  priority: string;
  task_type: "personal" | "work";
  employeeId: number;
}

interface CacheEntry {
  data: Tip[];
  timestamp: number;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

// Функция для получения имени сотрудника из localStorage
const getEmployeeNameFromStorage = (employeeId: number): string => {
  try {
    const namesStr = localStorage.getItem("employeeNames");
    if (namesStr) {
      const namesArray: [number, string][] = JSON.parse(namesStr);
      const namesMap = new Map<number, string>(namesArray);
      return namesMap.get(employeeId) || `Сотрудник ${employeeId}`;
    }
  } catch (e) {
    console.error("Ошибка получения имени сотрудника:", e);
  }
  return `Сотрудник ${employeeId}`;
};

// Функция для получения текущего пользователя
const getCurrentUserId = (): number => {
  try {
    const userData = localStorage.getItem("userData");
    if (userData) {
      const parsed: { id?: number } = JSON.parse(userData);
      return parsed.id || 0;
    }
  } catch (e) {
    console.error("Ошибка получения userData:", e);
  }
  return 0;
};

const useGetTipsByEmployee = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Кэш для задач каждого сотрудника
  const cache = useRef<Map<number, CacheEntry>>(new Map());
  // Активные запросы для предотвращения дублирования
  const pendingRequests = useRef<Map<number, Promise<Tip[]>>>(new Map());

  // Функция для получения задач одного сотрудника
  const fetchEmployeeTasks = useCallback(
    async (employeeId: number): Promise<Tip[]> => {
      // Проверяем кэш
      const cached = cache.current.get(employeeId);
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        return cached.data;
      }

      // Проверяем активный запрос
      if (pendingRequests.current.has(employeeId)) {
        return pendingRequests.current.get(employeeId)!;
      }

      // Создаем новый запрос
      const requestPromise = (async () => {
        try {
          const token = localStorage.getItem("token");

          if (!token) {
            throw new Error("Требуется авторизация");
          }

          const response = await fetch(`/api/webhook/employee/${employeeId}`, {
            method: "GET",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error("Ошибка авторизации");
            }
            if (response.status === 404) {
              throw new Error("Сотрудник не найден");
            }
            throw new Error(`Ошибка ${response.status}`);
          }

          const result: ApiResponse = await response.json();

          if (result.success) {
            // Преобразуем данные в формат Tip
            const tasks: Tip[] = result.data.map((task: ScheduleEntry) => ({
              id: task.id,
              employee_name: getEmployeeNameFromStorage(employeeId),
              task_name: task.taskName,
              task_description: task.taskDescription,
              counterparty: task.counterparty || "",
              start_date: new Date(task.startDate),
              end_date: new Date(task.endDate),
              status: task.status,
              priority: task.priority,
              task_type: task.viewTask === "личная" ? "personal" : "work",
              employeeId: employeeId,
            }));

            // Сохраняем в кэш
            cache.current.set(employeeId, {
              data: tasks,
              timestamp: Date.now(),
            });

            return tasks;
          } else {
            throw new Error(result.message);
          }
        } catch (err) {
          console.error(
            `Ошибка загрузки задач для сотрудника ${employeeId}:`,
            err
          );
          throw err;
        } finally {
          pendingRequests.current.delete(employeeId);
        }
      })();

      pendingRequests.current.set(employeeId, requestPromise);
      return requestPromise;
    },
    []
  );

  // Получаем выбранные ID сотрудников
  const getSelectedEmployeeIds = useCallback((): number[] => {
    try {
      const idsStr = localStorage.getItem("selectedEmployeeIds");
      if (idsStr) {
        return JSON.parse(idsStr);
      }
    } catch (e) {
      console.error("Ошибка получения selectedEmployeeIds:", e);
    }

    // По умолчанию показываем только текущего пользователя
    const currentUserId = getCurrentUserId();
    return currentUserId ? [currentUserId] : [];
  }, []);

  // Основная функция загрузки задач
  const loadTips = useCallback(async () => {
    const selectedIds = getSelectedEmployeeIds();

    if (selectedIds.length === 0) {
      setTips([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const promises = selectedIds.map((id) => fetchEmployeeTasks(id));
      const results = await Promise.allSettled(promises);

      const allTasks: Tip[] = [];
      const errors: string[] = [];

      results.forEach((result, index) => {
        const employeeId = selectedIds[index];
        if (result.status === "fulfilled") {
          allTasks.push(...result.value);
        } else {
          console.error(
            `Ошибка загрузки задач сотрудника ${employeeId}:`,
            result.reason
          );
          errors.push(
            `Сотрудник ${employeeId}: ${
              result.reason instanceof Error
                ? result.reason.message
                : "Ошибка загрузки"
            }`
          );
        }
      });

      setTips(allTasks);

      if (errors.length > 0) {
        setError(`Ошибки загрузки некоторых задач: ${errors.join("; ")}`);
      }
    } catch (err) {
      console.error("Ошибка загрузки задач:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
      setTips([]);
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmployeeTasks, getSelectedEmployeeIds]);

  // Слушаем изменения в localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      loadTips();
    };

    loadTips(); // Первоначальная загрузка

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [loadTips]);

  // Функция для обновления кэша конкретного сотрудника
  const refreshEmployeeTasks = useCallback(
    async (employeeId: number) => {
      cache.current.delete(employeeId);

      const selectedIds = getSelectedEmployeeIds();
      if (selectedIds.includes(employeeId)) {
        setIsLoading(true);
        try {
          const tasks = await fetchEmployeeTasks(employeeId);

          // Обновляем общий список
          setTips((prevTips) => {
            const otherTasks = prevTips.filter(
              (tip) => tip.employeeId !== employeeId
            );
            return [...otherTasks, ...tasks];
          });
        } catch (err) {
          console.error(
            `Ошибка обновления задач сотрудника ${employeeId}:`,
            err
          );
        } finally {
          setIsLoading(false);
        }
      }
    },
    [fetchEmployeeTasks, getSelectedEmployeeIds]
  );

  // Функция для полного обновления всех выбранных задач
  const refreshAllTasks = useCallback(async () => {
    const selectedIds = getSelectedEmployeeIds();
    selectedIds.forEach((id) => cache.current.delete(id));

    setIsLoading(true);
    setError(null);

    try {
      const promises = selectedIds.map((id) => fetchEmployeeTasks(id));
      const results = await Promise.allSettled(promises);

      const allTasks: Tip[] = [];
      results.forEach((result) => {
        if (result.status === "fulfilled") {
          allTasks.push(...result.value);
        }
      });

      setTips(allTasks);
    } catch (err) {
      console.error("Ошибка обновления задач:", err);
      setError(err instanceof Error ? err.message : "Неизвестная ошибка");
    } finally {
      setIsLoading(false);
    }
  }, [fetchEmployeeTasks, getSelectedEmployeeIds]);

  // Функция для получения задач только одного сотрудника
  const getTipsByEmployeeId = useCallback(
    (employeeId: number): Tip[] => {
      return tips.filter((tip) => tip.employeeId === employeeId);
    },
    [tips]
  );

  return {
    tips,
    error,
    isLoading,
    refreshEmployeeTasks,
    refreshAllTasks,
    getTipsByEmployeeId,
    reload: loadTips,
  };
};

export default useGetTipsByEmployee;
