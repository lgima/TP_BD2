import './Styles.css';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
    const navigate = useNavigate();
    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#" className="nav-link" onClick={() => navigate('/home')}>Reserva de Entradas</a>
                <a href="#" className="nav-link" onClick={() => navigate('/reservas')}>Mis Reservas</a>
                <a href="#" className="nav-link" onClick={() => navigate('/datos')}>Mis Datos</a>
                <a href="#" className="nav-link" onClick={() => navigate('/login')}>Salir</a>
            </div>
        </nav>
    );
}