import { useEffect, useState } from "react";

interface Employee {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: Employee[];
}

const useGetEmployees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getEmployees = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Требуется авторизация. Войдите в систему.");
      }

      const headers: HeadersInit = {
        Accept: "application/json",
        "Content-Type": "application/json",
      };

      headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch("/api/webhook/employees", {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Ошибка авторизации. Токен недействителен.");
        }
        if (response.status === 403) {
          throw new Error("Доступ запрещен. Недостаточно прав.");
        }
        if (response.status === 404) {
          throw new Error("Эндпоинт не найден. Проверьте URL.");
        }
        throw new Error(`Ошибка сервера: ${response.status}`);
      }

      const result: ApiResponse = await response.json();

      if (result.success) {
        setEmployees(result.data);
      } else {
        throw new Error(result.message || "Ошибка при получении данных");
      }
    } catch (e) {
      console.error("Error fetching employees:", e);
      setError(
        e instanceof Error ? e.message : "Произошла непредвиденная ошибка"
      );
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  const refresh = () => {
    getEmployees();
  };

  useEffect(() => {
    getEmployees();
  }, []);

  return { employees, error, isLoading, refresh };
};

export default useGetEmployees;
