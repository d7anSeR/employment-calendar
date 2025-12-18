import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from "@reduxjs/toolkit";
import axios from "axios";

const api = axios.create({
  baseURL: "/",
});

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    email: string;
    role: string;
    token: string;
  };
}

interface ApiErrorResponse {
  success: boolean;
  message: string;
  data: null;
}

export interface UserState {
  jwt: string | null;
  userData: {
    id: number;
    name: string;
    email: string;
    role: string;
  } | null;
  isLoading: boolean;
  loginErrorMessage: string | null;
}

// Константы для защиты от брутфорса
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 30 * 60 * 1000; // 30 минут в миллисекундах
const LOGIN_ATTEMPTS_KEY = "login_attempts";

interface LoginAttempts {
  [email: string]: {
    count: number;
    lockedUntil: number | null;
  };
}

// Вспомогательные функции для работы с localStorage
const getLoginAttempts = (): LoginAttempts => {
  const attempts = localStorage.getItem(LOGIN_ATTEMPTS_KEY);
  return attempts ? JSON.parse(attempts) : {};
};

const saveLoginAttempts = (attempts: LoginAttempts) => {
  localStorage.setItem(LOGIN_ATTEMPTS_KEY, JSON.stringify(attempts));
};

const clearLoginAttemptsForEmail = (email: string) => {
  const attempts = getLoginAttempts();
  if (attempts[email]) {
    delete attempts[email];
    saveLoginAttempts(attempts);
  }
};

const incrementLoginAttempt = (email: string): boolean => {
  const attempts = getLoginAttempts();
  const now = Date.now();

  if (!attempts[email]) {
    attempts[email] = {
      count: 1,
      lockedUntil: null,
    };
  } else {
    // Если блокировка истекла, сбрасываем счетчик
    if (attempts[email].lockedUntil && attempts[email].lockedUntil! < now) {
      attempts[email] = {
        count: 1,
        lockedUntil: null,
      };
    } else {
      attempts[email].count += 1;

      // Если превысили лимит попыток, устанавливаем блокировку
      if (attempts[email].count >= MAX_LOGIN_ATTEMPTS) {
        attempts[email].lockedUntil = now + LOCKOUT_DURATION;
      }
    }
  }

  saveLoginAttempts(attempts);

  // Проверяем, заблокирован ли пользователь
  if (attempts[email].lockedUntil && attempts[email].lockedUntil! > now) {
    return false; // Заблокирован
  }

  return true; // Не заблокирован
};

const checkIfLocked = (
  email: string
): { locked: boolean; remainingTime?: number } => {
  const attempts = getLoginAttempts();
  const now = Date.now();

  if (
    attempts[email] &&
    attempts[email].lockedUntil &&
    attempts[email].lockedUntil! > now
  ) {
    const remainingTime = Math.ceil(
      (attempts[email].lockedUntil! - now) / 1000 / 60
    ); // в минутах
    return { locked: true, remainingTime };
  }

  return { locked: false };
};

const initialState: UserState = {
  jwt: localStorage.getItem("token"),
  userData: null,
  isLoading: false,
  loginErrorMessage: null,
};

const savedUserData = localStorage.getItem("userData");
if (savedUserData) {
  try {
    initialState.userData = JSON.parse(savedUserData);
    console.log(
      "📦 Restored userData from localStorage:",
      initialState.userData
    );
  } catch (e) {
    console.error("❌ Error parsing saved userData:", e);
    localStorage.removeItem("userData");
  }
}

export const login = createAsyncThunk<
  LoginResponse["data"],
  LoginPayload,
  { rejectValue: string }
>("user/login", async (payload, { rejectWithValue }) => {
  try {
    console.log("🔄 Отправляю запрос логина с email:", payload.email);

    // Проверяем, не заблокирован ли пользователь
    const lockStatus = checkIfLocked(payload.email);
    if (lockStatus.locked) {
      throw new Error(
        `Аккаунт временно заблокирован. Попробуйте через ${lockStatus.remainingTime} минут.`
      );
    }

    const response = await api.post<LoginResponse>(
      "api/webhook/employee/auth",
      payload
    );

    console.log("✅ Полный ответ от сервера:", response.data);

    if (!response.data.success) {
      // Увеличиваем счетчик неудачных попыток
      incrementLoginAttempt(payload.email);
      throw new Error(response.data.message || "Ошибка авторизации");
    }

    if (!response.data.data) {
      incrementLoginAttempt(payload.email);
      throw new Error("Сервер не вернул данные пользователя");
    }

    // Сбрасываем счетчик попыток при успешном входе
    clearLoginAttemptsForEmail(payload.email);

    return response.data.data;
  } catch (error) {
    console.error("❌ Ошибка при логине:", error);

    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      const errorMessage =
        error.response?.data?.message || "Ошибка авторизации";
      // Увеличиваем счетчик неудачных попыток для axios ошибок
      if (
        error.response?.status === 401 ||
        errorMessage.toLowerCase().includes("неверн")
      ) {
        incrementLoginAttempt(payload.email);
      }
      return rejectWithValue(errorMessage);
    }

    // Проверяем, является ли ошибка блокировкой
    if (error instanceof Error && error.message.includes("заблокирован")) {
      return rejectWithValue(error.message);
    }

    // Для других ошибок также увеличиваем счетчик
    incrementLoginAttempt(payload.email);
    return rejectWithValue("Неизвестная ошибка");
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout(state) {
      state.jwt = null;
      state.userData = null;
      localStorage.removeItem("token");
      localStorage.removeItem("userData");
      console.log("🚪 User logged out");
    },
    clearLoginError(state) {
      state.loginErrorMessage = null;
    },
    // Новый action для сброса блокировки (например, для админки)
    resetLoginAttempts(state, action: PayloadAction<string>) {
      clearLoginAttemptsForEmail(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.loginErrorMessage = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse["data"]>) => {
          state.isLoading = false;
          const token = action.payload.token;
          state.jwt = token;
          localStorage.setItem("token", token);
          console.log("✅ Token saved to localStorage");
          const userData = {
            id: action.payload.id,
            name: action.payload.name,
            email: action.payload.email,
            role: action.payload.role,
          };

          state.userData = userData;
          localStorage.setItem("userData", JSON.stringify(userData));

          console.log("✅ User data saved to localStorage:", userData);
          console.log("✅ User ID:", userData.id);
          console.log("✅ User name:", userData.name);
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.loginErrorMessage = action.payload ?? "Ошибка авторизации";
        console.error("❌ Login rejected:", action.payload);
      });
  },
});

export const userReducer = userSlice.reducer;
export const userActions = userSlice.actions;
