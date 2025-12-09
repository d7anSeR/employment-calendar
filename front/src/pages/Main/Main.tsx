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
import useServerTips from '../../hooks/useGetTips';
import useLocalTips from '../../hooks/useGetTipsLocal';
import React, { useState, useEffect } from 'react';
import { useEventPositioning } from '../../hooks/useEventPositioning';
import { useWeekGrid } from '../../hooks/useWeekGrid';
import TipModal from './TipModalWindow/TipModalWindow';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { MenuUnfoldOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { AppDispatch } from '../../store/store';

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
  
  // Получаем контекст из MainLayout
  const { isSidebarOpen, toggleSidebar, isMobileLayout } = useOutletContext<OutletContext>();
  
  // Состояние для мобильного режима (один день)
  const [isMobileDayView, setIsMobileDayView] = useState<boolean>(false);
  
  // Используем оба хука
  const { tips: serverTips, isLoading: serverLoading, error: serverError } = useServerTips();
  const { tips: localTips, isLoaded: localLoaded } = useLocalTips();
  
  const { getPositionedEvents, getEventPosition, getEventHeight, getEventLeft, getEventWidth } = useEventPositioning();
  const { weekDays, dayAbbreviations, weekRange, timeSlots } = useWeekGrid(currentWeek);
  
  // Проверяем ширину экрана для мобильного режима
  useEffect(() => {
    const checkScreenWidth = () => {
      setIsMobileDayView(window.innerWidth <= 850);
    };
    
    checkScreenWidth();
    window.addEventListener('resize', checkScreenWidth);
    
    return () => window.removeEventListener('resize', checkScreenWidth);
  }, []);
  
  // Объединяем данные с сервера и из LocalStorage
  const allTips = [...serverTips, ...localTips];
  
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEventClick = (tip: Tip) => {
    console.log('Event clicked:', tip);
    setSelectedTip(tip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setSelectedTip(null);
  };
  
  const handleDayClick = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    navigate(`/day/${dateString}`);
  };

  // Навигация по дням через Redux
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

  // Функция для получения событий для конкретного дня и часа
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    const eventsInSlot = allTips.filter(tip => {
      const tipHour = tip.start_date.getHours();
      return isSameDay(tip.start_date, day) && tipHour === hour;
    });

    return getPositionedEvents(eventsInSlot);
  };

  // Находим индекс выбранного дня в текущей неделе для отображения

  const currentDayName = format(selectedDate, 'EEEE', { locale: ru });
  const currentDate = format(selectedDate, 'd MMMM yyyy', { locale: ru });

  // Показываем ошибку только если есть ошибка сервера И локальные данные не загружены
  if (serverError && localTips.length === 0) {
    return (
      <div className={styles["week-schedule"]}>
        <div className={styles["error-message"]}>
          Ошибка загрузки данных: {serverError}
        </div>
      </div>
    );
  }

  // Общий индикатор загрузки
  const isLoading = serverLoading || !localLoaded;

  return (
    <>
      <div className={styles["week-schedule"]}>
        <div className={styles["schedule-header"]}>
          <div className={styles["header-content"]}>
            {/* Кнопка для открытия сайдбара - показываем только на мобильных и когда сайдбар закрыт */}
            {isMobileLayout && !isSidebarOpen && (
              <button 
                className={styles["header-burger-button"]}
                onClick={toggleSidebar}
                title="Открыть панель"
              >
                <MenuUnfoldOutlined />
              </button>
            )}
            
            {/* Заголовок для недельного и дневного режима */}
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
                {serverError && localTips.length > 0 && (
                  <span className={styles["warning-indicator"]}> (используются локальные данные)</span>
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
  // Мобильный режим - один день (выбранная дата)
  <>
    <div className={styles["corner-cell"]}></div>
    
    {/* ЗАГОЛОВОК ТАБЛИЦЫ НЕ ПОКАЗЫВАЕМ - скрываем эту колонку */}
    <div className={styles["time-slot-corner"]}></div>

    {timeSlots.map(slot => (
      <React.Fragment key={slot.hour}>
        <div className={styles["time-slot"]}>
          {slot.time}
        </div>
        
        <div 
          key={`${slot.hour}-${selectedDate.toISOString()}`}
          className={styles["schedule-cell"]}
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
                backgroundColor: getEventColor(event.priority)
              }}
              onClick={() => handleEventClick(event)}
              title={`${event.task_name} - ${event.employee_name}\n${format(event.start_date, 'HH:mm')}-${format(event.end_date, 'HH:mm')}\nПриоритет: ${event.priority}\n${event.id > 1000000 ? 'Локальная задача' : 'Серверная задача'}`}
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
              {event.id > 1000000 && (
                <div className={styles["event-local-badge"]}>
                  локальная
                </div>
              )}
            </div>
          ))}
        </div>
      </React.Fragment>
    ))}
  </>
) : (
  // Десктопный режим - вся неделя (без изменений)
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

    {timeSlots.map(slot => (
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
                    backgroundColor: getEventColor(event.priority)
                  }}
                  onClick={() => handleEventClick(event)}
                  title={`${event.task_name} - ${event.employee_name}\n${format(event.start_date, 'HH:mm')}-${format(event.end_date, 'HH:mm')}\nПриоритет: ${event.priority}\n${event.id > 1000000 ? 'Локальная задача' : 'Серверная задача'}`}
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
                  {event.id > 1000000 && (
                    <div className={styles["event-local-badge"]}>
                      локальная
                    </div>
                  )}
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

const getEventColor = (priority: string): string => {
  switch (priority.toLowerCase()) {
    case 'высокий':
      return '#f28b82';
    case 'средный':
      return '#fbbc04';
    case 'низкий':
      return '#34a853';
    default:
      return '#4285f4';
  }
};

export default WeekSchedule;