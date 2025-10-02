import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import Main from './pages/Main/Main'
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from './layout/MainLayout/MainLayout';
const router = createBrowserRouter([
  {path: "/",
  element: <MainLayout/>,
  children: [
    { path: '/',
      element: <Main/>,
    }
  ]}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router}/>
  </StrictMode>,
)
