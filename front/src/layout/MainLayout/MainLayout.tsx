import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css";
import { 
  LeftOutlined, 
  PlusOutlined, 
  RightOutlined, 
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined 
} from "@ant-design/icons";
import CalendarWidget from "./CalendarWidget/CalendarWidget";
import { useDispatch } from "react-redux";
import { goToToday, goToNextWeek, goToPrevWeek } from "../../store/date.slice";
import CalendarList from "./CalendarList/CalendarList";
import CreateTipModal from "./CreateTipModal/CreateTipModal";
import { useState, useEffect } from "react";
import type { AppDispatch } from "../../store/store";
import { useMediaQuery } from "react-responsive";

function MainLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  
  const isMobileLayout = useMediaQuery({ maxWidth: 1400 });
  
  useEffect(() => {
    if (isMobileLayout) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobileLayout]);

  const handleTodayClick = (): void => {
    dispatch(goToToday());
  };

  const handleNextWeek = (): void => {
    dispatch(goToNextWeek());
  };

  const handlePrevWeek = (): void => {
    dispatch(goToPrevWeek());
  };

  const handleCreateClick = (): void => {
    setIsCreateModalOpen(true);
  };

  const handleCloseCreateModal = (): void => {
    setIsCreateModalOpen(false);
  };

  const handleTipCreated = (): void => {
    setRefreshTrigger(prev => prev + 1);
  };

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={styles["layout"]}>
      <div className={`
        ${styles["sidebar"]} 
        ${isSidebarOpen ? styles["sidebar--open"] : styles["sidebar--closed"]}
        ${isMobileLayout ? styles["sidebar--mobile"] : ""}
      `}>
        {/* Контейнер для двух кнопок в одной строке */}
        <div className={styles["sidebar-header"]}>
          <button className={styles["auth_button"]}>
            <UserOutlined />
          </button>
          
          {isMobileLayout && (
            <button 
              className={styles["sidebar-burger-button"]}
              onClick={toggleSidebar}
              title={isSidebarOpen ? "Скрыть панель" : "Показать панель"}
            >
              {isSidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
            </button>
          )}
        </div>
        
        <div className={styles["sidebar__date"]}>
          <button 
            className={styles["button-with-image"]} 
            onClick={handlePrevWeek}
            title="Предыдущая неделя"
          >
            <LeftOutlined />
          </button>
          
          <button onClick={handleTodayClick} className={styles["button"]}>
            Сегодня
          </button>
          
          <button 
            className={styles["button-with-image"]} 
            onClick={handleNextWeek}
            title="Следующая неделя"
          >
            <RightOutlined />
          </button>
        </div>
        
        <button className={styles["button"]} onClick={handleCreateClick}>
          <PlusOutlined /> Создать
        </button>
        
        <div className={styles.calendar}>
          <CalendarWidget/>
        </div>
        
        <CalendarList/>
      </div>
      
      <div className={`
        ${styles["content"]} 
        ${!isSidebarOpen && isMobileLayout ? styles["content--full"] : ""}
      `}>
        <Outlet 
          key={refreshTrigger}
          context={{ isSidebarOpen, toggleSidebar, isMobileLayout }}
        />
      </div>

      <CreateTipModal
        isOpen={isCreateModalOpen}
        onClose={handleCloseCreateModal}
        onTipCreated={handleTipCreated}
      />
    </div>
  );
}

export default MainLayout;