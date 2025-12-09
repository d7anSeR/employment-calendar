import React from 'react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import styles from './TipModal.module.css';

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

interface TipModalProps {
  tip: Tip | null;
  isOpen: boolean;
  onClose: () => void;
}

const TipModal: React.FC<TipModalProps> = ({ tip, isOpen, onClose }) => {
  if (!isOpen || !tip) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
      case 'высокий': return '#f28b82';
      case 'средний': return '#fbbc04';
      case 'низкий': return '#34a853';
      default: return '#4285f4';
    }
  };

  const getStatusText = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed': return 'Завершено';
      case 'in_progress': return 'В работе';
      case 'pending': return 'Ожидание';
      default: return status;
    }
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick} tabIndex={0}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>{tip.task_name}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Основная информация</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Сотрудник:</span>
                <span className={styles.value}>{tip.employee_name}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Контрагент:</span>
                <span className={styles.value}>{tip.counterparty}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Приоритет:</span>
                <span
                  className={styles.priority}
                  style={{ backgroundColor: getPriorityColor(tip.priority) }}
                >
                  {tip.priority}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Статус:</span>
                <span className={styles.status}>{getStatusText(tip.status)}</span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Время выполнения</h3>
            <div className={styles.grid}>
              <div className={styles.field}>
                <span className={styles.label}>Начало:</span>
                <span className={styles.value}>
                  {format(tip.start_date, 'd MMMM yyyy, HH:mm', { locale: ru })}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Окончание:</span>
                <span className={styles.value}>
                  {format(tip.end_date, 'd MMMM yyyy, HH:mm', { locale: ru })}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Длительность:</span>
                <span className={styles.value}>
                  {Math.round((tip.end_date.getTime() - tip.start_date.getTime()) / 60000)} минут
                </span>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Описание задачи</h3>
            <div className={styles.description}>
              {tip.task_description || 'Описание отсутствует'}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button className={styles.closeActionButton} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default TipModal;
