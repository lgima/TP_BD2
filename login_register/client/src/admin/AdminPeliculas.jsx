import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../navbar';
import { useNavigate } from 'react-router-dom';

function AdminPeliculas() {
    const [peliculas, setPeliculas] = useState([]);
    const [nuevaPelicula, setNuevaPelicula] = useState({ 
        nombre: '', 
        sala: '',
        horarios: [''] // Iniciamos con un horario vacío
    });
    const [mensaje, setMensaje] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    // Configuración base de axios
    axios.defaults.baseURL = 'http://localhost:3001';

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/home');
            return;
        }
        cargarPeliculas();
    }, []);

    const cargarPeliculas = async () => {
        try {
            const response = await axios.get('/api/peliculas/detalles');
            setPeliculas(response.data);
            setError(''); // Limpiar errores previos
        } catch (err) {
            console.error('Error al cargar películas:', err);
            setError('Error al cargar películas');
        }
    };

    const agregarHorario = () => {
        setNuevaPelicula({
            ...nuevaPelicula,
            horarios: [...nuevaPelicula.horarios, '']
        });
    };

    const eliminarHorario = (index) => {
        const nuevosHorarios = nuevaPelicula.horarios.filter((_, i) => i !== index);
        setNuevaPelicula({
            ...nuevaPelicula,
            horarios: nuevosHorarios
        });
    };

    const actualizarHorario = (index, valor) => {
        const nuevosHorarios = [...nuevaPelicula.horarios];
        nuevosHorarios[index] = valor;
        setNuevaPelicula({
            ...nuevaPelicula,
            horarios: nuevosHorarios
        });
    };

    const agregarPelicula = async (e) => {
        e.preventDefault();
        const horariosFiltrados = nuevaPelicula.horarios.filter(h => h.trim() !== '');
        
        if (!nuevaPelicula.nombre || !nuevaPelicula.sala || horariosFiltrados.length === 0) {
            setError('Por favor complete todos los campos y agregue al menos un horario');
            return;
        }

        try {
            await axios.post('/api/peliculas', 
                {
                    ...nuevaPelicula,
                    horarios: horariosFiltrados
                },
                { headers: { 'user-id': user.id } }
            );
            setMensaje('Película agregada exitosamente');
            setNuevaPelicula({ nombre: '', sala: '', horarios: [''] });
            cargarPeliculas();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al agregar película');
        }
    };

    const eliminarPelicula = async (nombre) => {
        if (!window.confirm(`¿Estás seguro de eliminar la película "${nombre}"?`)) {
            return;
        }

        setError(''); // Limpiar errores previos
        setMensaje(''); // Limpiar mensajes previos

        try {
            const response = await axios.delete(`/api/peliculas/${nombre}`, {
                headers: {
                    'user-id': user.id,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                setMensaje(response.data.mensaje || 'Película eliminada exitosamente');
                await cargarPeliculas(); // Recargar la lista de películas
            } else {
                setError('Error al eliminar la película');
            }
        } catch (err) {
            console.error('Error al eliminar película:', err);
            setError(err.response?.data?.error || 'Error al eliminar película');
        }
    };

    const actualizarAsientos = async (nombre, horario, totalAsientos) => {
        if (!totalAsientos || isNaN(totalAsientos) || totalAsientos <= 0) {
            setError('Número de asientos inválido');
            return;
        }

        try {
            await axios.put(`/api/peliculas/${nombre}/funcion/${horario}`,
                { totalAsientos },
                { headers: { 'user-id': user.id } }
            );
            setMensaje('Asientos actualizados exitosamente');
            cargarPeliculas();
        } catch (err) {
            setError(err.response?.data?.error || 'Error al actualizar asientos');
        }
    };

    return (
        <div>
            <Navbar />
            <div className="container-fluid px-4">
                <h2 className="mb-4">Gestión de Películas</h2>
                
                {mensaje && <div className="alert alert-success">{mensaje}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                
                <div className="card mb-4">
                    <div className="card-body">
                        <h3 className="card-title mb-4">Agregar Nueva Película</h3>
                        <form onSubmit={agregarPelicula}>
                            <div className="row">
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Nombre</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nuevaPelicula.nombre}
                                        onChange={(e) => setNuevaPelicula({...nuevaPelicula, nombre: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="col-md-6 mb-3">
                                    <label className="form-label">Sala</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={nuevaPelicula.sala}
                                        onChange={(e) => setNuevaPelicula({...nuevaPelicula, sala: e.target.value})}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="mb-3">
                                <label className="form-label">Horarios</label>
                                {nuevaPelicula.horarios.map((horario, index) => (
                                    <div key={index} className="input-group mb-2">
                                        <input
                                            type="time"
                                            className="form-control"
                                            value={horario}
                                            onChange={(e) => actualizarHorario(index, e.target.value)}
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-danger"
                                            onClick={() => eliminarHorario(index)}
                                            disabled={nuevaPelicula.horarios.length === 1}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                ))}
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={agregarHorario}
                                >
                                    Agregar Horario
                                </button>
                            </div>
                            <button type="submit" className="btn btn-primary">Agregar Película</button>
                        </form>
                    </div>
                </div>

                <h3 className="mb-4">Películas Existentes</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {peliculas.map((pelicula) => (
                        <div key={pelicula.nombre} className="card">
                            <div className="card-body py-2">
                                <div className="row align-items-center">
                                    <div className="col-2">
                                        <h5 className="mb-1">{pelicula.nombre}</h5>
                                        <p className="mb-2">
                                            <strong>Sala:</strong> {pelicula.sala}
                                        </p>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => eliminarPelicula(pelicula.nombre)}
                                        >
                                            Eliminar
                                        </button>
                                    </div>
                                    
                                    <div className="col-10">
                                        <div style={{ 
                                            display: 'flex',
                                            flexWrap: 'wrap',
                                            gap: '0.5rem'
                                        }}>
                                            {pelicula.horarios.map((funcion, index) => (
                                                <div key={index} style={{
                                                    border: '1px solid #dee2e6',
                                                    borderRadius: '4px',
                                                    padding: '0.5rem',
                                                    minWidth: '300px',
                                                    flex: '1'
                                                }}>
                                                    <div className="d-flex align-items-center gap-2">
                                                        <strong style={{ minWidth: '60px' }}>
                                                            {funcion.horario}
                                                        </strong>
                                                        <div className="input-group input-group-sm">
                                                            <input
                                                                type="number"
                                                                className="form-control"
                                                                placeholder={`Asientos: ${funcion.total}`}
                                                                min={funcion.reservados}
                                                            />
                                                            <button
                                                                className="btn btn-outline-primary"
                                                                onClick={(e) => {
                                                                    const input = e.target.previousSibling;
                                                                    const value = parseInt(input.value);
                                                                    if (value && value >= funcion.reservados) {
                                                                        actualizarAsientos(pelicula.nombre, funcion.horario, value);
                                                                        input.value = '';
                                                                    }
                                                                }}
                                                            >
                                                                Actualizar
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <small className="text-muted d-block mt-1">
                                                        Reservados: {funcion.reservados}
                                                    </small>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default AdminPeliculas;