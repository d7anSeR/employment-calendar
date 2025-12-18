import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import WeekSchedule from './pages/Main/Main'
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import MainLayout from './layout/MainLayout/MainLayout'
import { Provider } from 'react-redux'
import { store } from './store/store'
import DaySchedule from './pages/DayPage/DayPage'
import { AuthLayout } from './layout/AuthLayout/AuthLayout'
import LoginPage from './pages/LoginPage/LoginPage'

const router = createBrowserRouter([
  {
    path: "/",
    element: (() => {
      const jwt = store.getState().user.jwt
      return jwt ? <MainLayout /> : <Navigate to="/auth/login" replace />
    })(),
    children: [
      { 
        path: '/',
        element: <WeekSchedule/>,
      },
      {
        path: '/day/:date',
        element: <DaySchedule/>,
      }
    ],
  }, 
  {
    path: '/auth',
    element: <AuthLayout/>,
    children: [
      { 
        path: '/auth/login',
        element: <LoginPage/>,
      }
    ]
  }
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router}/>
    </Provider>
  </StrictMode>,
)