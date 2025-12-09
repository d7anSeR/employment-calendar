import React, { useState, useEffect } from 'react';
import styles from './CreateTipModal.module.css';

export interface Tip {
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

export interface TipFormData {
  task_name: string;
  task_description: string;
  employee_name: string;
  counterparty: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  priority: string;
  status: string;
}

export interface StoredTip {
  id: number;
  employee_name: string;
  task_name: string;
  task_description: string;
  counterparty: string;
  start_date: string;
  end_date: string;
  status: string;
  priority: string;
}

export interface CreateTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTipCreated: (tip: Tip) => void;
}

const CreateTipModal: React.FC<CreateTipModalProps> = ({
  isOpen,
  onClose,
  onTipCreated
}) => {
  const [formData, setFormData] = useState<TipFormData>({
    task_name: '',
    task_description: '',
    employee_name: '',
    counterparty: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    priority: 'средний',
    status: 'pending'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const now = new Date();
      const defaultDate = now.toISOString().split('T')[0];
      const defaultTime = now.toTimeString().slice(0, 5);
      const endTime = new Date(now.getTime() + 60 * 60 * 1000)
        .toTimeString()
        .slice(0, 5);

      setFormData(prev => ({
        ...prev,
        start_date: defaultDate,
        start_time: defaultTime,
        end_date: defaultDate,
        end_time: endTime
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.task_name.trim()) newErrors.task_name = 'Название задачи обязательно';
    if (!formData.employee_name.trim()) newErrors.employee_name = 'Имя сотрудника обязательно';
    if (!formData.start_date) newErrors.start_date = 'Дата начала обязательна';
    if (!formData.end_date) newErrors.end_date = 'Дата окончания обязательна';

    if (
      formData.start_date &&
      formData.start_time &&
      formData.end_date &&
      formData.end_time
    ) {
      const start = new Date(`${formData.start_date}T${formData.start_time}`);
      const end = new Date(`${formData.end_date}T${formData.end_time}`);

      if (end <= start) newErrors.end_date = 'Время окончания должно быть позже времени начала';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveTipToLocalStorage = (tip: Tip) => {
    try {
      const json = localStorage.getItem('localTips');
      let arr: Tip[] = [];

      if (json) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          arr = parsed.map((t: StoredTip) => ({
            ...t,
            start_date: new Date(t.start_date),
            end_date: new Date(t.end_date)
          }));
        }
      }

      const updated = [...arr, tip];
      const toStore: StoredTip[] = updated.map(t => ({
        ...t,
        start_date: t.start_date.toISOString(),
        end_date: t.end_date.toISOString()
      }));

      localStorage.setItem('localTips', JSON.stringify(toStore));
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const newTip: Tip = {
      id: Date.now(),
      task_name: formData.task_name,
      task_description: formData.task_description,
      employee_name: formData.employee_name,
      counterparty: formData.counterparty,
      start_date: new Date(`${formData.start_date}T${formData.start_time}`),
      end_date: new Date(`${formData.end_date}T${formData.end_time}`),
      priority: formData.priority,
      status: formData.status
    };

    saveTipToLocalStorage(newTip);
    onTipCreated(newTip);
    onClose();
  };

  const handleInputChange = (field: keyof TipFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Создать новую задачу</h2>
          <button className={styles.closeButton} onClick={onClose} type="button">
            ×
          </button>
        </div>

        <div className={styles.content}>
          <form onSubmit={handleSubmit}>
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Основная информация</h3>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Название задачи *
                  <input
                    type="text"
                    className={`${styles.input} ${errors.task_name ? styles.error : ''}`}
                    value={formData.task_name}
                    onChange={e => handleInputChange('task_name', e.target.value)}
                  />
                </label>
                {errors.task_name && <span className={styles.errorText}>{errors.task_name}</span>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Описание задачи
                  <textarea
                    className={styles.textarea}
                    value={formData.task_description}
                    onChange={e => handleInputChange('task_description', e.target.value)}
                    rows={3}
                  />
                </label>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Сотрудник *
                    <input
                      type="text"
                      className={`${styles.input} ${errors.employee_name ? styles.error : ''}`}
                      value={formData.employee_name}
                      onChange={e => handleInputChange('employee_name', e.target.value)}
                    />
                  </label>
                  {errors.employee_name && (
                    <span className={styles.errorText}>{errors.employee_name}</span>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Контрагент
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.counterparty}
                      onChange={e => handleInputChange('counterparty', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>Время выполнения</h3>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Дата начала *
                    <input
                      type="date"
                      className={`${styles.input} ${errors.start_date ? styles.error : ''}`}
                      value={formData.start_date}
                      onChange={e => handleInputChange('start_date', e.target.value)}
                    />
                  </label>
                  {errors.start_date && <span className={styles.errorText}>{errors.start_date}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Время начала *
                    <input
                      type="time"
                      className={styles.input}
                      value={formData.start_time}
                      onChange={e => handleInputChange('start_time', e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Дата окончания *
                    <input
                      type="date"
                      className={`${styles.input} ${errors.end_date ? styles.error : ''}`}
                      value={formData.end_date}
                      onChange={e => handleInputChange('end_date', e.target.value)}
                    />
                  </label>
                  {errors.end_date && <span className={styles.errorText}>{errors.end_date}</span>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Время окончания *
                    <input
                      type="time"
                      className={styles.input}
                      value={formData.end_time}
                      onChange={e => handleInputChange('end_time', e.target.value)}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className={styles.footer}>
              <button type="button" className={styles.cancelButton} onClick={onClose}>
                Отмена
              </button>
              <button type="submit" className={styles.submitButton}>
                Создать задачу
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTipModal;