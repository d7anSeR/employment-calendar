
import { useState } from 'react';
import styles from './CalendarList.module.css';
import { DownOutlined } from '@ant-design/icons';
import type { Calendar } from './CalendarList.interface';



function CalendarList () {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [calendars, setCalendars] = useState<Calendar[]>([
    {
      id: '1',
      name: 'Сотрудник №1',
      color: '#4285f4',
      checked: true
    },
    {
      id: '2', 
      name: 'Сотрудник №2',
      color: '#34a853',
      checked: true
    },
    {
      id: '3',
      name: 'Сотрудник №3',
      color: '#fbbc04',
      checked: true
    }
  ]);

  const toggleCalendar = (calendarId: string) => {
    setCalendars(prev => prev.map(calendar => 
      calendar.id === calendarId 
        ? { ...calendar, checked: !calendar.checked }
        : calendar
    ));
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };


  return (
    <div className={styles["calendar-list"]} >
      <div 
        className={styles["calendar-list-header"]}
        onClick={toggleExpand}
      >
        <div className={styles["header-left"]}>
          <DownOutlined className={`${styles["expand-icon"]} ${isExpanded ? styles["expanded"] : ""}`}/>
          <span className={styles["calendar-list-title"]}>
            Мои календари
          </span>
        </div>
      </div>
      {isExpanded && (
        <div className={styles["calendar-list-content"]}>
          {calendars.map(calendar => (
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
                <span 
                  className={styles["checkmark"]}
                  style={{ 
                    backgroundColor: calendar.checked ? calendar.color : 'transparent',
                    borderColor: calendar.color
                  }}
                >
                  {calendar.checked && (
                    <svg 
                      width="12" 
                      height="12" 
                      viewBox="0 0 24 24" 
                      fill="white"
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
          ))}
        </div>
      )}
    </div>
  );
};
export default CalendarList