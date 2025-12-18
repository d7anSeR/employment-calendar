import React, { useState, useEffect } from 'react';
import styles from './CreateTipModal.module.css';

export interface TipFormData {
  task_name: string;
  task_description: string;
  start_date: string;
  start_time: string;
  end_date: string;
  end_time: string;
  priority: string;
  status: string; // Строка для UI, но будет преобразована в число
}

export interface CreateTipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTipCreated: () => void;
}

// Интерфейс для данных пользователя из localStorage
interface UserData {
  id: number;
  name: string;
  email: string;
}

// Маппинг статусов: строковые значения UI -> числовые значения для бэкенда
const STATUS_MAPPING = {
  'pending': 2,      // Запланировано -> 2
  'in_progress': 1,  // В работе -> 1
  'completed': 3     // Завершено -> 3
} as const;


// Функция для генерации уникального ID задачи
const generateTaskId = (): number => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 9000) + 1000;
  
  const counterKey = 'taskIdCounter';
  let counter = parseInt(sessionStorage.getItem(counterKey) || '0', 10);
  counter = (counter + 1) % 1000;
  sessionStorage.setItem(counterKey, counter.toString().padStart(3, '0'));
  
  const idString = `${timestamp}${random}${counter.toString().padStart(3, '0')}`;
  const safeId = parseInt(idString.slice(-9), 10);
  
  return Math.abs(safeId);
};

const CreateTipModal: React.FC<CreateTipModalProps> = ({
  isOpen,
  onClose,
  onTipCreated
}) => {
  const [formData, setFormData] = useState<TipFormData>({
    task_name: '',
    task_description: '',
    start_date: '',
    start_time: '',
    end_date: '',
    end_time: '',
    priority: '0', // По умолчанию 0
    status: 'pending' // По умолчанию "Запланировано"
  });

  const [userData, setUserData] = useState<UserData | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      // Загружаем данные текущего пользователя
      const loadUserData = () => {
        try {
          const userDataStr = localStorage.getItem('userData');
          if (userDataStr) {
            const parsedData: UserData = JSON.parse(userDataStr);
            setUserData(parsedData);
          }
        } catch (error) {
          console.error('Ошибка загрузки данных пользователя:', error);
        }
      };

      loadUserData();

      // Устанавливаем текущую дату и время по умолчанию
      const now = new Date();
      const defaultDate = now.toISOString().split('T')[0];
      const defaultTime = now.toTimeString().slice(0, 5);
      
      // Устанавливаем время окончания на 1 час позже
      const endTimeDate = new Date(now.getTime() + 60 * 60 * 1000);
      const endTime = endTimeDate.toTimeString().slice(0, 5);

      setFormData(prev => ({
        ...prev,
        start_date: defaultDate,
        start_time: defaultTime,
        end_date: defaultDate,
        end_time: endTime
      }));
      
      // Сбросить ошибки при открытии
      setErrors({});
      setSubmitError('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.task_name.trim()) {
      newErrors.task_name = 'Название задачи обязательно';
    } else if (formData.task_name.trim().length < 2) {
      newErrors.task_name = 'Название задачи должно быть не менее 2 символов';
    }
    
    if (!formData.start_date) {
      newErrors.start_date = 'Дата начала обязательна';
    }
    
    if (!formData.end_date) {
      newErrors.end_date = 'Дата окончания обязательна';
    }

    // Проверка времени
    if (formData.start_date && formData.start_time && formData.end_date && formData.end_time) {
      const start = new Date(`${formData.start_date}T${formData.start_time}`);
      const end = new Date(`${formData.end_date}T${formData.end_time}`);

      if (end <= start) {
        newErrors.end_date = 'Время окончания должно быть позже времени начала';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Требуется авторизация. Пожалуйста, войдите заново.");
      }

      // Проверяем, что у нас есть данные пользователя
      if (!userData) {
        throw new Error("Не удалось получить данные пользователя. Пожалуйста, обновите страницу.");
      }

      // Генерируем уникальный ID для задачи
      const taskId = generateTaskId();
      console.log('Сгенерирован ID задачи:', taskId);

      // Форматируем дату и время для бэкенда
      const startDateTime = `${formData.start_date}T${formData.start_time}:00`;
      const endDateTime = `${formData.end_date}T${formData.end_time}:00`;

      // Преобразуем статус из строки в число
      const statusValue = STATUS_MAPPING[formData.status as keyof typeof STATUS_MAPPING] || 2;

      // Создаем объект задачи для отправки на бэкенд
      const taskData = {
        id: taskId,
        taskName: formData.task_name.trim(),
        taskDescription: formData.task_description.trim() || '',
        startDate: startDateTime,
        endDate: endDateTime,
        priority: parseInt(formData.priority) || 0, // Преобразуем в число
        status: statusValue, // Числовой статус
        viewTask: 'личная', // Личная задача
        counterparty: '', // Пустая строка для контрагента
        employeeId: userData.id // ID текущего пользователя
      };

      console.log('Отправка задачи на сервер:', taskData);

      const response = await fetch('/api/webhook/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: JSON.stringify(taskData)
      });

      console.log('Статус ответа:', response.status, response.statusText);

      // Пробуем получить ответ как текст сначала
      const responseText = await response.text();
      console.log('Ответ сервера (текст):', responseText);

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Ошибка парсинга JSON ответа:', parseError);
        throw new Error(`Неверный формат ответа сервера: ${responseText.substring(0, 100)}`);
      }

      if (!response.ok) {
        // Проверяем, не связано ли с дубликатом ID
        if (response.status === 400 && result.message && result.message.includes('уже существует')) {
          // Пробуем с другим ID
          console.warn('ID задачи уже существует, пробуем другой ID...');
          return handleSubmit(e); // Рекурсивно вызываем с новым ID
        }
        
        throw new Error(result.message || `Ошибка ${response.status}: ${response.statusText}`);
      }

      if (result.success) {
        // Успешно создано
        console.log('Задача успешно создана:', result);
        
        // Вызываем callback для обновления списка задач
        onTipCreated();
        
        // Закрываем модальное окно
        onClose();
        
        // Показываем уведомление об успехе
        setTimeout(() => {
          alert('✅ Задача успешно создана!');
        }, 100);
      } else {
        throw new Error(result.message || 'Ошибка при создании задачи');
      }
    } catch (err) {
      console.error('Ошибка создания задачи:', err);
      
      let errorMessage = 'Неизвестная ошибка при создании задачи';
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Проверяем, не связано ли с авторизацией
        if (errorMessage.includes('авторизация') || errorMessage.includes('авторизации')) {
          errorMessage = 'Ошибка авторизации. Пожалуйста, войдите заново.';
        }
        
        // Проверяем, не связано ли с сетью
        if (errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch')) {
          errorMessage = 'Ошибка сети. Проверьте подключение к интернету.';
        }
      }
      
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
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

  const handleTodayClick = () => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    
    const endTimeDate = new Date(now.getTime() + 60 * 60 * 1000);
    const endTime = endTimeDate.toTimeString().slice(0, 5);

    setFormData(prev => ({
      ...prev,
      start_date: today,
      start_time: currentTime,
      end_date: today,
      end_time: endTime
    }));
  };

  const handleTomorrowClick = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split('T')[0];
    const defaultTime = '09:00';
    const endTime = '10:00';

    setFormData(prev => ({
      ...prev,
      start_date: tomorrowDate,
      start_time: defaultTime,
      end_date: tomorrowDate,
      end_time: endTime
    }));
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Создать личную задачу</h2>
          <button 
            className={styles.closeButton} 
            onClick={onClose} 
            type="button"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>

        <div className={styles.modalContent}>
          <form onSubmit={handleSubmit}>
            {submitError && (
              <div className={styles.errorMessage}>
                <strong>Ошибка:</strong> {submitError}
              </div>
            )}

            {userData && (
              <div className={styles.userInfo}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Исполнитель:</span>
                  <span className={styles.infoValue}>
                    <strong>{userData.name}</strong>
                  </span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Тип задачи:</span>
                  <span className={styles.infoValue}>
                    <span className={styles.personalBadge}>Личная</span>
                  </span>
                </div>
              </div>
            )}

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
                    placeholder="Введите название задачи"
                    disabled={isSubmitting}
                    maxLength={100}
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
                    placeholder="Введите описание задачи (необязательно)"
                    disabled={isSubmitting}
                    maxLength={500}
                  />
                  <div className={styles.charCounter}>
                    {formData.task_description.length}/500 символов
                  </div>
                </label>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Приоритет *
                    <select
                      className={styles.select}
                      value={formData.priority}
                      onChange={e => handleInputChange('priority', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="0">Не установлен</option>
                      <option value="1">Низкий</option>
                      <option value="2">Средний</option>
                      <option value="3">Высокий</option>
                    </select>
                  </label>
                  <div className={styles.helperText}>
                    Приоритет 0 = не установлен
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Статус *
                    <select
                      className={styles.select}
                      value={formData.status}
                      onChange={e => handleInputChange('status', e.target.value)}
                      disabled={isSubmitting}
                    >
                      <option value="pending">Запланировано</option>
                      <option value="in_progress">В работе</option>
                      <option value="completed">Завершено</option>
                    </select>
                  </label>
                  <div className={styles.helperText}>
                    {formData.status === 'pending' && 'Запланировано → статус 2'}
                    {formData.status === 'in_progress' && 'В работе → статус 1'}
                    {formData.status === 'completed' && 'Завершено → статус 3'}
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Время выполнения</h3>
                <div className={styles.timePresets}>
                  <button 
                    type="button" 
                    className={styles.presetButton}
                    onClick={handleTodayClick}
                    disabled={isSubmitting}
                  >
                    Сегодня
                  </button>
                  <button 
                    type="button" 
                    className={styles.presetButton}
                    onClick={handleTomorrowClick}
                    disabled={isSubmitting}
                  >
                    Завтра
                  </button>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label className={styles.label}>
                    Дата начала *
                    <input
                      type="date"
                      className={`${styles.input} ${errors.start_date ? styles.error : ''}`}
                      value={formData.start_date}
                      onChange={e => handleInputChange('start_date', e.target.value)}
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
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
                      disabled={isSubmitting}
                      min={formData.start_date}
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
                      disabled={isSubmitting}
                    />
                  </label>
                </div>
              </div>
              
              <div className={styles.durationInfo}>
                {formData.start_date && formData.start_time && formData.end_date && formData.end_time && (
                  (() => {
                    const start = new Date(`${formData.start_date}T${formData.start_time}`);
                    const end = new Date(`${formData.end_date}T${formData.end_time}`);
                    const durationMs = end.getTime() - start.getTime();
                    const durationHours = Math.floor(durationMs / (1000 * 60 * 60));
                    const durationMinutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
                    
                    return (
                      <div className={durationMs > 0 ? styles.validDuration : styles.invalidDuration}>
                        Продолжительность: {durationHours} ч {durationMinutes} мин
                      </div>
                    );
                  })()
                )}
              </div>
            </div>

            <div className={styles.footer}>
              <button 
                type="button" 
                className={styles.cancelButton} 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Отмена
              </button>
              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner}></span>
                    Создание...
                  </>
                ) : (
                  'Создать задачу'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateTipModal;