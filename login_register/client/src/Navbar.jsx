import './Styles.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="nav-container">
                <a href="#" className="nav-link">Reserva de Entradas</a>
                <a href="#" className="nav-link">Mis Reservas</a>
                <a href="#" className="nav-link">Salir</a>
            </div>
        </nav>
    );
}