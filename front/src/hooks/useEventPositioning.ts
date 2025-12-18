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

interface PositionedTip extends Tip {
  column: number;
  totalColumns: number;
}

export const useEventPositioning = () => {
  const eventsOverlap = (eventA: Tip, eventB: Tip): boolean => {
    return (
      eventA.start_date < eventB.end_date && eventB.start_date < eventA.end_date
    );
  };

  const getPositionedEvents = (events: Tip[]): PositionedTip[] => {
    if (events.length === 0) return [];

    const sortedEvents = [...events].sort(
      (a, b) => a.start_date.getTime() - b.start_date.getTime()
    );

    const groups: Tip[][] = [];
    const positionedEvents: PositionedTip[] = [];

    sortedEvents.forEach((event) => {
      let groupFound = false;

      for (const group of groups) {
        const overlapsWithGroup = group.some((groupEvent) =>
          eventsOverlap(event, groupEvent)
        );

        if (overlapsWithGroup) {
          group.push(event);
          groupFound = true;
          break;
        }
      }

      if (!groupFound) {
        groups.push([event]);
      }
    });

    groups.forEach((group) => {
      if (group.length === 1) {
        positionedEvents.push({
          ...group[0],
          column: 0,
          totalColumns: 1,
        });
      } else {
        const columns: Tip[][] = [];
        const sortedGroup = [...group].sort(
          (a, b) => a.start_date.getTime() - b.start_date.getTime()
        );

        sortedGroup.forEach((event) => {
          let columnIndex = 0;
          let placed = false;

          while (columnIndex < columns.length && !placed) {
            const column = columns[columnIndex];
            const lastEventInColumn = column[column.length - 1];

            if (!eventsOverlap(event, lastEventInColumn)) {
              column.push(event);
              positionedEvents.push({
                ...event,
                column: columnIndex,
                totalColumns: columns.length,
              });
              placed = true;
            }
            columnIndex++;
          }

          if (!placed) {
            columns.push([event]);
            positionedEvents.push({
              ...event,
              column: columns.length - 1,
              totalColumns: columns.length,
            });
          }
        });
      }
    });

    return positionedEvents;
  };

  const getEventPosition = (startDate: Date): number => {
    const minutes = startDate.getMinutes();
    return (minutes / 60) * 100;
  };

  const getEventHeight = (startDate: Date, endDate: Date): number => {
    const duration = (endDate.getTime() - startDate.getTime()) / (1000 * 60);
    return (duration / 60) * 100;
  };

  const getEventLeft = (column: number, totalColumns: number): number => {
    if (totalColumns === 1) return 2;
    const availableWidth = 100 - 4;
    const columnWidth = availableWidth / totalColumns;
    return 2 + column * columnWidth;
  };

  const getEventWidth = (totalColumns: number): string => {
    if (totalColumns === 1) return "calc(100% - 4px)";
    const availableWidth = 100 - 4;
    const columnWidth = availableWidth / totalColumns;
    return `calc(${columnWidth}% - 2px)`;
  };

  return {
    getPositionedEvents,
    getEventPosition,
    getEventHeight,
    getEventLeft,
    getEventWidth,
  };
};
