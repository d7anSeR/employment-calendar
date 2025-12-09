import { useEffect, useState } from "react";
import tipsData from "./test_data.json";

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

const useGetTips = () => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const getTips = async () => {
    try {
      setIsLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 500));

      const tipsWithDates = tipsData.map((tip) => ({
        ...tip,
        start_date: new Date(tip.start_date),
        end_date: new Date(tip.end_date),
      }));

      setTips(tipsWithDates);
    } catch (e) {
      console.error(e);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getTips();
  }, []);

  return { tips, error, isLoading };
};

export default useGetTips;
