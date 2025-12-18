import type { FormEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../../store/store";
import { login, userActions } from "../../store/user.slice";
import styles from "./LoginPage.module.css";

type LoginForm = {
  email: { value: string };
  password: { value: string };
};

// Вспомогательная функция для проверки блокировки
const checkIfUserLocked = (email: string): string | null => {
  const attempts = localStorage.getItem('login_attempts');
  if (!attempts) return null;
  
  try {
    const attemptsData = JSON.parse(attempts);
    const now = Date.now();
    
    if (attemptsData[email] && attemptsData[email].lockedUntil && attemptsData[email].lockedUntil > now) {
      const remainingTime = Math.ceil((attemptsData[email].lockedUntil - now) / 1000 / 60);
      return `Аккаунт временно заблокирован. Попробуйте через ${remainingTime} минут.`;
    }
  } catch (e) {
    console.error("Ошибка при проверке блокировки:", e);
  }
  
  return null;
};

export default function LoginPage() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { loginErrorMessage, isLoading } = useSelector(
    (state: RootState) => state.user
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    dispatch(userActions.clearLoginError());

    const target = e.target as typeof e.target & LoginForm;
    const email = target.email.value;
    
    // Проверяем блокировку перед отправкой
    const lockMessage = checkIfUserLocked(email);
    if (lockMessage) {
      dispatch(userActions.clearLoginError());
      setTimeout(() => {
        // Устанавливаем сообщение об ошибке через dispatch
        // Вместо этого можно создать новое действие для установки ошибки блокировки
        // Или использовать существующее
      }, 0);
      // Показываем сообщение об ошибке через alert или в UI
      alert(lockMessage);
      return;
    }

    const result = await dispatch(
      login({
        email: email,
        password: target.password.value, 
      })
    );

    if (login.fulfilled.match(result)) {
      navigate("/");
    }
  };

  return (
    <div className={styles["login-page"]}>
      <div className={styles["login-container"]}>
        <div className={styles["login-card"]}>
          <h1>Вход в систему</h1>

          {loginErrorMessage && (
            <div className={styles["error"]}>{loginErrorMessage}</div>
          )}

          <form onSubmit={submit}>
            <input
              name="email"
              type="text"
              placeholder="Email"
              required
            />

            <input
              name="password"
              type="password"
              placeholder="Пароль"
              required
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Вход..." : "Войти"}
            </button>
          </form>
          
          
        </div>
      </div>
    </div>
  );
}