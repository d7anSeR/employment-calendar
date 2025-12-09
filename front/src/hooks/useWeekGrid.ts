import { useMemo } from "react";
import { startOfWeek, eachDayOfInterval, addWeeks, format } from "date-fns";
import { ru } from "date-fns/locale";

export const useWeekGrid = (currentWeek: Date) => {
  const weekData = useMemo(() => {
    const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const weekDays = eachDayOfInterval({
      start: weekStart,
      end: addWeeks(weekStart, 1),
    }).slice(0, 7);

    const dayAbbreviations = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

    const weekRange = `${format(weekDays[0], "d MMM", {
      locale: ru,
    })} - ${format(weekDays[6], "d MMM yyyy", { locale: ru })}`;

    const timeSlots = Array.from({ length: 24 }, (_, i) => {
      const hour = i + 1;
      return {
        hour: hour.toString().padStart(2, "0"),
        time: `${hour}:00`,
        hourNumber: hour,
      };
    });

    return {
      weekStart,
      weekDays,
      dayAbbreviations,
      weekRange,
      timeSlots,
    };
  }, [currentWeek]);

  return weekData;
};
