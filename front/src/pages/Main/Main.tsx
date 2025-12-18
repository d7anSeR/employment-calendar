import { format, isToday, isSameDay, addDays, subDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './Main.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { 
  selectCurrentWeek, 
  selectSelectedDate,
  selectDateAndWeek,
  goToToday 
} from '../../store/date.slice';
import useGetTips from '../../hooks/useGetTasksByEmployee';
import { useState, useEffect } from 'react';
import { useEventPositioning } from '../../hooks/useEventPositioning';
import { useWeekGrid } from '../../hooks/useWeekGrid';
import TipModal from './TipModalWindow/TipModalWindow';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MenuUnfoldOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { AppDispatch } from '../../store/store';
import React from 'react';

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
  task_type: 'personal' | 'work';
  employeeId: number;
}

interface OutletContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileLayout: boolean;
}

function WeekSchedule() {
  const dispatch = useDispatch<AppDispatch>();
  const currentWeek = useSelector(selectCurrentWeek);
  const selectedDate = useSelector(selectSelectedDate);
  const navigate = useNavigate();
  
  const { isSidebarOpen, toggleSidebar, isMobileLayout } = useOutletContext<OutletContext>();
  
  const [isMobileDayView, setIsMobileDayView] = useState<boolean>(false);
  
  // Используем хук без параметров - он сам следит за выбранными сотрудниками
  const { tips, isLoading, error } = useGetTips();
  
  const { getPositionedEvents, getEventPosition, getEventHeight, getEventLeft, getEventWidth } = useEventPositioning();
  const { weekDays, dayAbbreviations, weekRange, timeSlots } = useWeekGrid(currentWeek);
  
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobileDayView(window.innerWidth <= 850);
    };
    
    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);
  
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (tip: Tip) => {
    setSelectedTip(tip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTip(null);
  };
  
  const handleDayClick = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    navigate(`/day/${dateString}`);
  };

  const goToNextDay = () => {
    const nextDay = addDays(selectedDate, 1);
    dispatch(selectDateAndWeek(nextDay));
  };

  const goToPrevDay = () => {
    const prevDay = subDays(selectedDate, 1);
    dispatch(selectDateAndWeek(prevDay));
  };

  const handleGoToToday = () => {
    dispatch(goToToday());
  };

  const getEventsForTimeSlot = (day: Date, hour: number) => {
    const eventsInSlot = tips.filter(tip => {
      const tipHour = tip.start_date.getHours();
      return isSameDay(tip.start_date, day) && tipHour === hour;
    });

    return getPositionedEvents(eventsInSlot);
  };

  // Функция для получения текстового представления приоритета
  const getPriorityText = (priority: string): string => {
    const priorityNum = parseInt(priority, 10);
    const priorityMap: Record<number, string> = {
      1: 'низкий',
      2: 'средний',
      3: 'высокий',
    };
    return priorityMap[priorityNum] || 'средний';
  };

  const currentDayName = format(selectedDate, 'EEEE', { locale: ru });
  const currentDate = format(selectedDate, 'd MMMM yyyy', { locale: ru });

  if (error) {
    return (
      <div className={styles["week-schedule"]}>
        <div className={styles["error-message"]}>
          Ошибка загрузки данных: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles["week-schedule"]}>
        <div className={styles["schedule-header"]}>
          <div className={styles["header-content"]}>
            {isMobileLayout && !isSidebarOpen && (
              <button 
                className={styles["header-burger-button"]}
                onClick={toggleSidebar}
                title="Открыть панель"
              >
                <MenuUnfoldOutlined />
              </button>
            )}
            
            {isMobileDayView ? (
              <div className={styles["mobile-day-header"]}>
                <button 
                  className={styles["day-nav-button"]}
                  onClick={goToPrevDay}
                  title="Предыдущий день"
                >
                  <LeftOutlined />
                </button>
                
                <div className={styles["mobile-day-info"]}>
                  <div className={styles["mobile-day-name"]}>
                    {currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1)}
                  </div>
                  <div className={styles["mobile-day-date"]}>
                    {currentDate}
                  </div>
                </div>
                
                <button 
                  className={styles["day-nav-button"]}
                  onClick={goToNextDay}
                  title="Следующий день"
                >
                  <RightOutlined />
                </button>
                
                <button 
                  className={styles["today-button"]}
                  onClick={handleGoToToday}
                  title="Сегодня"
                >
                  Сегодня
                </button>
              </div>
            ) : (
              <span className={styles["week-range"]}>
                {weekRange}
                {isLoading && <span className={styles["loading-indicator"]}> (загрузка...)</span>}
                {!isLoading && tips.length > 0 && (
                  <span className={styles["tasks-count"]}> • Задач: {tips.length}</span>
                )}
              </span>
            )}
          </div>
        </div>

        <div className={`
          ${styles["schedule-grid"]} 
          ${isMobileDayView ? styles["schedule-grid--mobile"] : ""}
        `}>
          {isMobileDayView ? (
            <>
              <div className={styles["corner-cell"]}></div>
              <div 
                className={`${styles["day-header"]} ${isToday(selectedDate) ? styles["today"] : ""}`}
              >
                <div className={styles["day-abbreviation"]}>
                  {format(selectedDate, 'EEEEEE', { locale: ru }).toUpperCase()}
                </div>
                <div className={styles["day-date"]}>
                  {format(selectedDate, 'd', { locale: ru })}
                </div>
              </div>

              {timeSlots.map((slot, index) => (
                <React.Fragment key={slot.hour}>
                  <div 
                    className={styles["time-slot"]}
                    style={{ gridRow: index + 2 }}
                  >
                    {slot.time}
                  </div>
                  
                  <div 
                    className={styles["schedule-cell"]}
                    style={{ gridRow: index + 2 }}
                  >
                    {getEventsForTimeSlot(selectedDate, slot.hourNumber).map(event => (
                      <div
                        key={event.id}
                        className={styles["event"]}
                        style={{
                          top: `${getEventPosition(event.start_date)}%`,
                          height: `${getEventHeight(event.start_date, event.end_date)}%`,
                          left: `${getEventLeft(event.column, event.totalColumns)}%`,
                          width: getEventWidth(event.totalColumns),
                          backgroundColor: getEventColor(event.priority, event.task_type)
                        }}
                        onClick={() => handleEventClick(event)}
                        title={`${event.task_name}\nСотрудник: ${event.employee_name}\n${format(event.start_date, 'HH:mm')}-${format(event.end_date, 'HH:mm')}\nПриоритет: ${getPriorityText(event.priority)}\nТип: ${event.task_type === 'personal' ? 'Личная' : 'Рабочая'}`}
                      >
                        <div className={styles["event-title"]}>
                          {event.task_name}
                        </div>
                        <div className={styles["event-time"]}>
                          {format(event.start_date, 'HH:mm')} - {format(event.end_date, 'HH:mm')}
                        </div>
                        <div className={styles["event-employee"]}>
                          {event.employee_name}
                        </div>
                        <div className={event.task_type === 'personal' ? styles["event-personal-badge"] : styles["event-work-badge"]}>
                          {event.task_type === 'personal' ? 'личная' : 'рабочая'}
                        </div>
                      </div>
                    ))}
                  </div>
                </React.Fragment>
              ))}
            </>
          ) : (
            <>
              <div className={styles["corner-cell"]}></div>
              {weekDays.map((day, index) => (
                <div 
                  key={day.toISOString()} 
                  className={`${styles["day-header"]} ${isToday(day) ? styles["today"] : ""}`}
                  onClick={() => handleDayClick(day)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles["day-abbreviation"]}>
                    {dayAbbreviations[index]}
                  </div>
                  <div className={styles["day-date"]}>
                    {format(day, 'd', { locale: ru })}
                  </div>
                </div>
              ))}

              {timeSlots.map((slot) => (
                <React.Fragment key={slot.hour}>
                  <div className={styles["time-slot"]}>
                    {slot.time}
                  </div>
                  
                  {weekDays.map(day => {
                    const events = getEventsForTimeSlot(day, slot.hourNumber);
                    
                    return (
                      <div 
                        key={`${slot.hour}-${day.toISOString()}`}
                        className={styles["schedule-cell"]}
                      >
                        {events.map(event => (
                          <div
                            key={event.id}
                            className={styles["event"]}
                            style={{
                              top: `${getEventPosition(event.start_date)}%`,
                              height: `${getEventHeight(event.start_date, event.end_date)}%`,
                              left: `${getEventLeft(event.column, event.totalColumns)}%`,
                              width: getEventWidth(event.totalColumns),
                              backgroundColor: getEventColor(event.priority, event.task_type)
                            }}
                            onClick={() => handleEventClick(event)}
                            title={`${event.task_name}\nСотрудник: ${event.employee_name}\n${format(event.start_date, 'HH:mm')}-${format(event.end_date, 'HH:mm')}\nПриоритет: ${getPriorityText(event.priority)}\nТип: ${event.task_type === 'personal' ? 'Личная' : 'Рабочая'}`}
                          >
                            <div className={styles["event-title"]}>
                              {event.task_name}
                            </div>
                            <div className={styles["event-time"]}>
                              {format(event.start_date, 'HH:mm')} - {format(event.end_date, 'HH:mm')}
                            </div>
                            <div className={styles["event-employee"]}>
                              {event.employee_name}
                            </div>
                            <div className={event.task_type === 'personal' ? styles["event-personal-badge"] : styles["event-work-badge"]}>
                              {event.task_type === 'personal' ? 'личная' : 'рабочая'}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
      </div>

      <TipModal
        tip={selectedTip}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

const getEventColor = (
  priority: string,
  task_type: 'personal' | 'work'
): string => {
  const priorityNum = parseInt(priority, 10);
  
  const priorityMap: Record<number, string> = {
    1: 'низкий',
    2: 'средний',
    3: 'высокий',
  };
  
  const priorityLabel = priorityMap[priorityNum] ?? 'средний';

  if (task_type === 'personal') {
    switch (priorityLabel) {
      case 'высокий':
        return '#e66868';
      case 'средний':
        return '#f7a536';
      case 'низкий':
        return '#6bc46d';
      default:
        return '#8b5cf6';
    }
  }

  switch (priorityLabel) {
    case 'высокий':
      return '#f28b82';
    case 'средний':
      return '#fbbc04';
    case 'низкий':
      return '#34a853';
    default:
      return '#4285f4';
  }
};

export default WeekSchedule;