import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "./MainLayout.module.css";
import { 
  LeftOutlined, 
  PlusOutlined, 
  RightOutlined, 
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined
} from "@ant-design/icons";
import CalendarWidget from "./CalendarWidget/CalendarWidget";
import { goToToday, goToNextDay, goToPrevDay, goToNextWeek, goToPrevWeek } from "../../store/date.slice";
import CalendarList from "./CalendarList/CalendarList";
import CreateTipModal from "./CreateTipModal/CreateTipModal";
import { useState, useEffect } from "react";
import type { AppDispatch, RootState } from "../../store/store";
import { useMediaQuery } from "react-responsive";
import { useLocation, useNavigate } from "react-router-dom";
import { addDays, subDays, format } from "date-fns";
import { userActions } from "../../store/user.slice";

function MainLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { userData } = useSelector((state: RootState) => state.user);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  
  const isMobileLayout = useMediaQuery({ maxWidth: 1400 });
  
  useEffect(() => {
    if (isMobileLayout) {
      setIsSidebarOpen(false);
    } else {
      setIsSidebarOpen(true);
    }
  }, [isMobileLayout]);

  const isDayPage = location.pathname.includes('/day/');

  const handleTodayClick = (): void => {
    dispatch(goToToday());
    
    if (isDayPage) {
      const today = new Date();
      const todayFormatted = format(today, 'yyyy-MM-dd');
      navigate(`/day/${todayFormatted}`);
    }
  };

  const handleNextClick = (): void => {
    if (isDayPage) {
      const dateFromUrl = location.pathname.split('/day/')[1];
      if (dateFromUrl) {
        const currentDate = new Date(dateFromUrl);
        const nextDate = addDays(currentDate, 1);
        const nextDateFormatted = format(nextDate, 'yyyy-MM-dd');
        
        dispatch(goToNextDay());
        navigate(`/day/${nextDateFormatted}`);
      }
    } else {
      dispatch(goToNextWeek());
    }
  };

  const handlePrevClick = (): void => {
    if (isDayPage) {
      const dateFromUrl = location.pathname.split('/day/')[1];
      if (dateFromUrl) {
        const currentDate = new Date(dateFromUrl);
        const prevDate = subDays(currentDate, 1);
        const prevDateFormatted = format(prevDate, 'yyyy-MM-dd');
        
        dispatch(goToPrevDay());
        navigate(`/day/${prevDateFormatted}`);
      }
    } else {
      dispatch(goToPrevWeek());
    }
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

  const toggleUserMenu = (): void => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleLogout = (): void => {
    dispatch(userActions.logout());
    setIsUserMenuOpen(false);
    navigate('/auth/login');
  };

  const formatUserName = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles["layout"]}>
      <div className={`
        ${styles["sidebar"]} 
        ${isSidebarOpen ? styles["sidebar--open"] : styles["sidebar--closed"]}
        ${isMobileLayout ? styles["sidebar--mobile"] : ""}
      `}>
        <div className={styles["sidebar-header"]}>
          {userData ? (
            <div className={styles["user-container"]}>
              <button 
                className={styles["user-button"]}
                onClick={toggleUserMenu}
              >
                <div className={styles["user-info"]}>
                  <div className={styles["user-initials"]}>
                    {getUserInitials(userData.name)}
                  </div>
                  <div className={styles["user-name"]}>
                    {formatUserName(userData.name)}
                  </div>
                </div>
              </button>
              
              {isUserMenuOpen && (
                <div className={styles["user-dropdown"]}>
                  <div className={styles["dropdown-header"]}>
                    <div className={styles["dropdown-name"]}>
                      {formatUserName(userData.name)}
                    </div>
                    <div className={styles["dropdown-email"]}>
                      {userData.email}
                    </div>
                  </div>
                  
                  <div className={styles["dropdown-divider"]}></div>
                  
                  <button 
                    className={styles["dropdown-item"]}
                    onClick={handleLogout}
                  >
                    <LogoutOutlined />
                    <span>Выход</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button 
              className={styles["auth_button"]} 
              onClick={() => navigate('/auth/login')}
            >
              <UserOutlined />
            </button>
          )}
          
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
            onClick={handlePrevClick}
            title={isDayPage ? "Предыдущий день" : "Предыдущая неделя"}
          >
            <LeftOutlined />
          </button>
          
          <button onClick={handleTodayClick} className={styles["button"]}>
            Сегодня
          </button>
          
          <button 
            className={styles["button-with-image"]} 
            onClick={handleNextClick}
            title={isDayPage ? "Следующий день" : "Следующая неделя"}
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