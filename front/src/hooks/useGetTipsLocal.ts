import { useState, useEffect, useCallback } from "react";

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
}
interface StoredTip {
  id: number;
  employee_name: string;
  task_name: string;
  task_description: string;
  counterparty: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
}

const useLocalTips = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  const loadTips = useCallback((): void => {
    try {
      const stored = localStorage.getItem("localTips");
      if (stored) {
        const storedTips: StoredTip[] = JSON.parse(stored);
        const tipsWithDates: Tip[] = storedTips.map((tip) => ({
          ...tip,
          start_date: new Date(tip.start_date),
          end_date: new Date(tip.end_date),
        }));
        setTips(tipsWithDates);
      } else {
        setTips([]);
      }
      setIsLoaded(true);
    } catch (error) {
      console.error("Ошибка загрузки из LocalStorage:", error);
      setTips([]);
      setIsLoaded(true);
    }
  }, []);

  const saveTips = useCallback((newTips: Tip[]): void => {
    try {
      const tipsToSave: StoredTip[] = newTips.map((tip) => ({
        ...tip,
        start_date: tip.start_date.toISOString(),
        end_date: tip.end_date.toISOString(),
      }));

      localStorage.setItem("localTips", JSON.stringify(tipsToSave));
      setTips(newTips);
    } catch (error) {
      console.error("Ошибка сохранения в LocalStorage:", error);
    }
  }, []);

  const addTip = useCallback(
    (newTip: Tip): void => {
      const updatedTips = [...tips, newTip];
      saveTips(updatedTips);
    },
    [tips, saveTips]
  );

  const updateTip = useCallback(
    (updatedTip: Tip): void => {
      const updatedTips = tips.map((tip) =>
        tip.id === updatedTip.id ? updatedTip : tip
      );
      saveTips(updatedTips);
    },
    [tips, saveTips]
  );

  const deleteTip = useCallback(
    (tipId: number): void => {
      const updatedTips = tips.filter((tip) => tip.id !== tipId);
      saveTips(updatedTips);
    },
    [tips, saveTips]
  );

  const clearAllTips = useCallback((): void => {
    localStorage.removeItem("localTips");
    setTips([]);
  }, []);

  useEffect(() => {
    loadTips();
  }, [loadTips]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent): void => {
      if (event.key === "localTips") {
        console.log("LocalStorage changed, reloading...");
        loadTips();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [loadTips]);

  return {
    tips,
    isLoaded,
    addTip,
    updateTip,
    deleteTip,
    clearAllTips,
    refreshTips: loadTips,
  };
};

export default useLocalTips;
