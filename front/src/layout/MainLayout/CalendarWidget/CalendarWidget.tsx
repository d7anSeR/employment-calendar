import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay,
  eachDayOfInterval
} from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './CalendarWidget.module.css';
import { useDispatch, useSelector } from "react-redux";
import { 
  selectSelectedDate, 
  selectCurrentDate,
  selectDateAndWeek,
  goToNextMonth,     
  goToPrevMonth
} from '../../../store/date.slice';
import { useLocation, useNavigate } from 'react-router-dom';

interface CalendarWidgetProps {
  onDateSelect?: (date: Date) => void;
}

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({ onDateSelect }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  
  const selectedDate = useSelector(selectSelectedDate);
  const currentDate = useSelector(selectCurrentDate); 

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({
    start: calendarStart,
    end: calendarEnd,
  });

  const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const onPrevMonth = () => {
    dispatch(goToPrevMonth());
  };

  const onNextMonth = () => {
    dispatch(goToNextMonth()); 
  };

  const handleDateSelect = (date: Date) => {
    if (!isSameMonth(date, currentDate)) {
      return;
    }

    if (onDateSelect) {
      onDateSelect(date);
      return;
    }

    const isOnDayPage = location.pathname.startsWith('/day/');
    
    if (isOnDayPage) {
      const dateString = format(date, 'yyyy-MM-dd');
      navigate(`/day/${dateString}`);
    } else {
      dispatch(selectDateAndWeek(date));
    }
  };

  return (
    <div className={styles["calendar-widget"]}>
      <div className={styles["calendar-header"]}>
        <button 
          onClick={onPrevMonth} 
          className={styles["nav-button"]}
          aria-label="Предыдущий месяц"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
          </svg>
        </button>
        
        <span className={styles["current-month"]}>
          {format(currentDate, 'LLLL yyyy', { locale: ru })
            .replace(/^\w/, (c) => c.toUpperCase())}
        </span>
        
        <button 
          onClick={onNextMonth} 
          className={styles["nav-button"]}
          aria-label="Следующий месяц"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
          </svg>
        </button>
      </div>

      <div className={styles["calendar-grid"]}>
        {weekDays.map(day => (
          <div key={day} className={styles["day-header"]}>
            {day}
          </div>
        ))}
        
        {days.map(day => {
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());
          
          const dayCellClasses = [
            styles["day-cell"],
            !isCurrentMonth && styles["other-month"],
            isSelected && styles["selected"],
            isToday && styles["today"]
          ].filter(Boolean).join(' ');

          return (
            <div
              key={day.toISOString()}
              className={dayCellClasses}
              onClick={() => handleDateSelect(day)}
              data-date={format(day, 'yyyy-MM-dd')}
              title={format(day, 'd MMMM yyyy', { locale: ru })}
            >
              <span className={styles["day-number"]}>
                {format(day, 'd')}
              </span>
            </div>
          );
        })}
      </div>
      
     
    </div>
  );
};

export default CalendarWidget;