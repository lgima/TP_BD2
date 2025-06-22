import './Styles.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#" className="nav-link" onClick={() => navigate('/home')}>Reserva de Entradas</a>
                <a href="#" className="nav-link" onClick={() => navigate('/reservas')}>Mis Reservas</a>
                <a href="#" className="nav-link" onClick={() => navigate('/datos')}>Mis Datos</a>
                {isAdmin && (
                    <a href="#" className="nav-link" onClick={() => navigate('/admin/peliculas')}>Gestionar Películas</a>
                )}
                <a href="#" className="nav-link" onClick={() => {
                    localStorage.removeItem('user');
                    navigate('/login');
                }}>Salir</a>
            </div>
        </nav>
    );
}