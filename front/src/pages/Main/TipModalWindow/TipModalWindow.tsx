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
  task_type: 'personal' | 'work';
  employeeId: number;
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
    // Приводим priority к строке и обрабатываем разные форматы
    const priorityStr = String(priority).trim();
    
    // Если это число
    if (/^\d+$/.test(priorityStr)) {
      const num = parseInt(priorityStr, 10);
      switch (num) {
        case 3: return '#f28b82';
        case 2: return '#fbbc04';
        case 1: return '#34a853';
        default: return '#4285f4';
      }
    }
    
    // Если это текст
    const priorityLower = priorityStr.toLowerCase();
    switch (priorityLower) {
      case '3':
      case 'высокий':
      case 'high':
        return '#f28b82';
      case '2':
      case 'средний':
      case 'medium':
        return '#fbbc04';
      case '1':
      case 'низкий':
      case 'low':
        return '#34a853';
      default:
        return '#4285f4';
    }
  };

  const getPriorityText = (priority: string): string => {
    const priorityStr = String(priority).trim();
    
    if (/^\d+$/.test(priorityStr)) {
      const num = parseInt(priorityStr, 10);
      switch (num) {
        case 3: return 'высокий';
        case 2: return 'средний';
        case 1: return 'низкий';
        default: return `уровень ${num}`;
      }
    }
    
    const priorityLower = priorityStr.toLowerCase();
    if (priorityLower === '3' || priorityLower === 'высокий' || priorityLower === 'high') {
      return 'высокий';
    } else if (priorityLower === '2' || priorityLower === 'средний' || priorityLower === 'medium') {
      return 'средний';
    } else if (priorityLower === '1' || priorityLower === 'низкий' || priorityLower === 'low') {
      return 'низкий';
    } else {
      return priorityStr;
    }
  };

  const getStatusText = (status: string): string => {
    const statusStr = String(status).toLowerCase();
    
    switch (statusStr) {
      case 'completed':
      case 'завершено':
        return 'Завершено';
      case 'in_progress':
      case 'в работе':
        return 'В работе';
      case 'pending':
      case 'ожидание':
        return 'Ожидание';
      default:
        return status;
    }
  };

  
  const getTaskTypeText = (task_type: string): string => {
    return task_type === 'personal' ? 'Личная' : 'Рабочая';
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
                <span className={styles.value}>{tip.counterparty || 'Не указан'}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Приоритет:</span>
                <span
                  className={styles.priority}
                  style={{ backgroundColor: getPriorityColor(tip.priority) }}
                >
                  {getPriorityText(tip.priority)}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Статус:</span>
                <span className={styles.status}>{getStatusText(tip.status)}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.label}>Тип задачи:</span>
                <span
                  className={styles.taskType}
                 
                >
                  {getTaskTypeText(tip.task_type)}
                </span>
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