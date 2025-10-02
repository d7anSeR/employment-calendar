import { Outlet } from "react-router-dom";
import styles from "./MainLayout.module.css"
function MainLayout() {
    return (
    <div className={styles["layout"]}>
        <div className={styles["sidebar"]}>     
        <button>Сегодня</button><br/>
        <button>
            предыдущая неделя
        </button>
        <button>
            следующая неделя
        </button><br/>
        <button>Создать</button><br/>
        
        <div className={styles.calendar}>Календарь</div>
        <div>
            <h3>Календари</h3>
            
        </div>
        </div>
        <div className={styles["content"]}>
			<Outlet />
		</div>
        </div>
    )
}
export default MainLayout