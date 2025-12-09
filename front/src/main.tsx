import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WeekSchedule from './pages/Main/Main'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from './layout/MainLayout/MainLayout';
import { Provider } from 'react-redux';
import { store } from './store/store';
import DaySchedule from './pages/DayPage/DayPage';
const router = createBrowserRouter([
  {path: "/",
  element: <MainLayout/>,
  children: [
    { path: '/',
      element: <WeekSchedule/>,
    },
      {
        path: '/day/:date', // Добавляем маршрут для страницы дня
        element: <DaySchedule/>,
      }
  ]}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
     <Provider store={store}>
    <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)
