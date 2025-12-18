import { useState, useEffect, useCallback } from 'react';
import styles from './CalendarList.module.css';
import { DownOutlined } from '@ant-design/icons';
import useGetEmployees from '../../../hooks/useGetEmployeesList';

export interface Calendar {
  id: string;
  name: string;
  checked: boolean;
  employeeId: number;
}

function CalendarList() {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  
  const { employees, error, isLoading } = useGetEmployees();

  const getCurrentUserId = useCallback((): number => {
    try {
      const userData = localStorage.getItem('userData');
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.id || 0;
      }
    } catch (e) {
      console.error('Ошибка получения userData:', e);
    }
    return 0;
  }, []);

  useEffect(() => {
    if (employees.length > 0) {
      const currentUserId = getCurrentUserId();
      
      const selectedIdsStr = localStorage.getItem('selectedEmployeeIds');
      const savedSelectedIds: number[] = selectedIdsStr 
        ? JSON.parse(selectedIdsStr) 
        : [currentUserId];
      
      const employeeCalendars: Calendar[] = employees.map(employee => ({
        id: employee.id.toString(),
        name: employee.name,
        checked: savedSelectedIds.includes(employee.id),
        employeeId: employee.id
      }));
      
      setCalendars(employeeCalendars);
      
      // Сохраняем маппинг ID -> имя для хука useGetTips
      const nameMap = new Map(employees.map(emp => [emp.id, emp.name]));
      localStorage.setItem('employeeNames', JSON.stringify(Array.from(nameMap.entries())));
    }
  }, [employees, getCurrentUserId]);

  const saveSelectedEmployeeIds = useCallback((ids: number[]) => {
    localStorage.setItem('selectedEmployeeIds', JSON.stringify(ids));
    // Триггерим событие для обновления задач
    window.dispatchEvent(new Event('storage'));
  }, []);

  const toggleCalendar = useCallback((calendarId: string) => {
    const updatedCalendars = calendars.map(calendar => 
      calendar.id === calendarId 
        ? { ...calendar, checked: !calendar.checked }
        : calendar
    );
    
    setCalendars(updatedCalendars);

    const selectedIds = updatedCalendars
      .filter(calendar => calendar.checked)
      .map(calendar => calendar.employeeId);
    
    saveSelectedEmployeeIds(selectedIds);
  }, [calendars, saveSelectedEmployeeIds]);

  const toggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  if (isLoading) {
    return (
      <div className={styles["calendar-list"]}>
        <div className={styles["calendar-list-header"]}>
          <div className={styles["header-left"]}>
            <DownOutlined className={styles["expand-icon"]} />
            <span className={styles["calendar-list-title"]}>
              Сотрудники
            </span>
          </div>
        </div>
        <div className={styles["calendar-list-content"]}>
          <div className={styles["loading-state"]}>
            Загрузка сотрудников...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles["calendar-list"]}>
        <div className={styles["calendar-list-header"]}>
          <div className={styles["header-left"]}>
            <DownOutlined className={styles["expand-icon"]} />
            <span className={styles["calendar-list-title"]}>
              Сотрудники
            </span>
          </div>
        </div>
        <div className={styles["calendar-list-content"]}>
          <div className={styles["error-state"]}>
            Ошибка загрузки сотрудников: {error}
          </div>
        </div>
      </div>
    );
  }

  const selectedCount = calendars.filter(c => c.checked).length;

  return (
    <div className={styles["calendar-list"]}>
      <div 
        className={styles["calendar-list-header"]}
        onClick={toggleExpand}
      >
        <div className={styles["header-left"]}>
          <DownOutlined className={`${styles["expand-icon"]} ${isExpanded ? styles["expanded"] : ""}`} />
          <span className={styles["calendar-list-title"]}>
            Сотрудники ({selectedCount}/{calendars.length})
          </span>
        </div>
      </div>
      
      {isExpanded && (
        <div className={styles["calendar-list-content"]}>
          {calendars.length === 0 ? (
            <div className={styles["empty-state"]}>
              Нет сотрудников
            </div>
          ) : (
            calendars.map(calendar => (
              <label 
                key={calendar.id}
                className={styles["calendar-item"]}
              >
                <div className={styles["checkbox-container"]}>
                  <input
                    type="checkbox"
                    checked={calendar.checked}
                    onChange={() => toggleCalendar(calendar.id)}
                    className={styles["checkbox"]}
                  />
                  <span className={styles["checkmark"]}>
                    {calendar.checked && (
                      <svg 
                        width="12" 
                        height="12" 
                        viewBox="0 0 24 24" 
                        fill="#4285f4"
                      >
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                      </svg>
                    )}
                  </span>
                </div>
                <span className={styles["calendar-name"]}>
                  {calendar.name}
                </span>
              </label>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default CalendarList;