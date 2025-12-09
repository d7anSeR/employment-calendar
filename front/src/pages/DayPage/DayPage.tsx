// DaySchedule.tsx
import { format, parseISO, startOfDay, isToday, isSameDay } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './DayPage.module.css';
import useServerTips from '../../hooks/useGetTips';
import useLocalTips from '../../hooks/useGetTipsLocal';
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import TipModal from '../Main/TipModalWindow/TipModalWindow';
import { useEventPositioning } from '../../hooks/useEventPositioning';

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

function DaySchedule() {
  const { date } = useParams<{ date: string }>();
  
  const { tips: serverTips, isLoading: serverLoading, error: serverError } = useServerTips();
  const { tips: localTips, isLoaded: localLoaded } = useLocalTips();
  
  const { getPositionedEvents, getEventPosition, getEventHeight, getEventLeft, getEventWidth } = useEventPositioning();
  
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Парсим дату из URL или используем сегодняшнюю дату
  const selectedDate = useMemo(() => {
    if (date) {
      return startOfDay(parseISO(date));
    }
    return startOfDay(new Date());
  }, [date]);

  // Объединяем данные с сервера и из LocalStorage
  const allTips = [...serverTips, ...localTips];

  // Фильтруем заметки для выбранного дня
  const dayTips = useMemo(() => {
    return allTips.filter(tip => {
      const tipDate = startOfDay(tip.start_date);
      return tipDate.getTime() === selectedDate.getTime();
    });
  }, [allTips, selectedDate]);

  // Создаем массив с одним днем (для совместимости с useEventPositioning)

  // Генерируем временные слоты
  const timeSlots = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      hourNumber: i
    }));
  }, []);

  // Получаем события для конкретного дня и часа
  const getEventsForTimeSlot = (day: Date, hour: number) => {
    const eventsInSlot = dayTips.filter(tip => {
      const tipHour = tip.start_date.getHours();
      return isSameDay(tip.start_date, day) && tipHour === hour;
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

  // Форматируем дату для заголовка
  const formattedDate = format(selectedDate, 'd MMMM yyyy, EEEE', { locale: ru });
  const isCurrentDay = isToday(selectedDate);
  const dayAbbreviation = format(selectedDate, 'EEEEEE', { locale: ru }).toUpperCase();

  if (serverError && localTips.length === 0) {
    return (
      <div className={styles["day-schedule"]}>
        <div className={styles["error-message"]}>
          Ошибка загрузки данных: {serverError}
        </div>
      </div>
    );
  }

  const isLoading = serverLoading || !localLoaded;

  return (
    <>
      <div className={styles["day-schedule"]}>
        <div className={styles["schedule-header"]}>
          <Link to="/" className={styles["back-button"]}>
            ← Назад к неделе
          </Link>
          <span className={`${styles["day-range"]} ${isCurrentDay ? styles["today"] : ""}`}>
            {formattedDate}
            {isLoading && <span className={styles["loading-indicator"]}> (загрузка...)</span>}
            {serverError && localTips.length > 0 && (
              <span className={styles["warning-indicator"]}> (используются локальные данные)</span>
            )}
          </span>
          <div className={styles["events-count"]}>
            Заметок: {dayTips.length}
          </div>
        </div>

        <div className={styles["schedule-grid"]}>
          {/* Угловая ячейка */}
          <div className={styles["corner-cell"]}></div>
          
          {/* Заголовок дня */}
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

          {/* Временные слоты и ячейки */}
          {timeSlots.map(slot => (
            <React.Fragment key={slot.hour}>
              <div className={styles["time-slot"]}>
                {slot.hour}
              </div>
              
              {/* Ячейка для текущего дня и часа */}
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
    case 'средний':
      return '#fbbc04';
    case 'низкий':
      return '#34a853';
    default:
      return '#4285f4';
  }
};

export default DaySchedule;