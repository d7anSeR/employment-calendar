// DaySchedule.tsx
import { format, parseISO, startOfDay, isToday } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './DayPage.module.css';
import { useDispatch } from 'react-redux';
import { selectDateAndWeek } from '../../store/date.slice';
import useGetTips from '../../hooks/useGetTips';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import TipModal from '../Main/TipModalWindow/TipModalWindow';
import { useEventPositioning } from '../../hooks/useEventPositioning';
import { MenuUnfoldOutlined } from '@ant-design/icons';
import { addDays } from 'date-fns';

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
}

interface OutletContext {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  isMobileLayout: boolean;
}

function DaySchedule() {
  const { date } = useParams<{ date: string }>();
  const dispatch = useDispatch();
  
  const { isSidebarOpen, toggleSidebar, isMobileLayout } = useOutletContext<OutletContext>();
  
  const { tips, isLoading, error } = useGetTips();
  
  const { getPositionedEvents, getEventPosition, getEventHeight, getEventLeft, getEventWidth } = useEventPositioning();
  
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (date) {
      const parsedDate = parseISO(date);
      dispatch(selectDateAndWeek(parsedDate));
    }
  }, [date, dispatch]);

  const selectedDate = useMemo(() => {
    if (date) {
      return startOfDay(parseISO(date));
    }
    return startOfDay(new Date());
  }, [date]);

  const timeSlots = useMemo(() => {
    const slots = [];
    
    for (let i = 0; i < 24; i++) {
      slots.push({
        hour: `${i.toString().padStart(2, '0')}:00`,
        hourNumber: i,
        time: `${i.toString().padStart(2, '0')}:00`
      });
    }
    
    slots.push({
      hour: '24:00',
      hourNumber: 24,
      time: '24:00'
    });
    
    return slots;
  }, []);

  const dayTips = useMemo(() => {
    return tips.filter(tip => {
      const tipDate = startOfDay(tip.start_date);
      return tipDate.getTime() === selectedDate.getTime();
    });
  }, [tips, selectedDate]);

  const getEventsForTimeSlot = (hour: number) => {
    const eventsInSlot = dayTips.filter(tip => {
      const tipHour = tip.start_date.getHours();
      if (hour === 24) {
        const nextDay = addDays(selectedDate, 1);
        return tip.end_date.getHours() === 0 && 
               tip.end_date.getMinutes() === 0 &&
               startOfDay(tip.end_date).getTime() === nextDay.getTime();
      }
      return tipHour === hour;
    });

    return getPositionedEvents(eventsInSlot);
  };

  const handleEventClick = (tip: Tip) => {
    setSelectedTip(tip);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTip(null);
  };


  const isCurrentDay = isToday(selectedDate);
  const dayAbbreviation = format(selectedDate, 'EEEEEE', { locale: ru }).toUpperCase();
  const currentDayName = format(selectedDate, 'EEEE', { locale: ru });
  const currentDate = format(selectedDate, 'd MMMM yyyy', { locale: ru });

  if (error) {
    return (
      <div className={styles["day-schedule"]}>
        <div className={styles["error-message"]}>
          Ошибка загрузки данных: {error}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles["day-schedule"]}>
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
            
            <Link to="/" className={styles["back-button"]}>
              ← Назад к неделе
            </Link>
            
            <div className={styles["center-content"]}>
              <div className={styles["mobile-day-info"]}>
                <div className={styles["mobile-day-name"]}>
                  {currentDayName.charAt(0).toUpperCase() + currentDayName.slice(1)}
                </div>
                <div className={styles["mobile-day-date"]}>
                  {currentDate}
                </div>
              </div>
            </div>

            <div className={styles["events-count"]}>
              Заметок: {dayTips.length}
              {isLoading && <span className={styles["loading-indicator"]}> (загрузка...)</span>}
            </div>
          </div>
        </div>

        <div className={styles["schedule-grid"]}>
          <div className={styles["corner-cell"]}></div>
          <div 
            className={`${styles["day-header"]} ${isCurrentDay ? styles["today"] : ""}`}
          >
            <div className={styles["day-abbreviation"]}>
              {dayAbbreviation}
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
                {getEventsForTimeSlot(slot.hourNumber).map(event => (
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
                    title={`${event.task_name} - ${event.employee_name}\n${format(event.start_date, 'HH:mm')}-${format(event.end_date, 'HH:mm')}\nПриоритет: ${event.priority}\nТип: ${event.task_type === 'personal' ? 'Личная' : 'Рабочая'}`}
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

const getEventColor = (priority: string, task_type: 'personal' | 'work'): string => {
  if (task_type === 'personal') {
    switch (priority.toLowerCase()) {
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
  
  switch (priority.toLowerCase()) {
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

export default DaySchedule;