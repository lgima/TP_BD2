import React, { useEffect, useState } from "react";
import Navbar from "../navbar";
import axios from "axios";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const usuario = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    if (usuario && usuario.id) {
      axios.get(`/api/usuario/${usuario.id}`)
        .then(res => {
          setReservas(res.data.reservas || []);
        });
    }
  }, [usuario]);

  const cancelarReserva = (pelicula, horario) => {
    if (!window.confirm(`¿Seguro que deseas cancelar la reserva de '${pelicula}' para el horario ${horario}?`)) return;
    axios.post(`/api/peliculas/${pelicula}/cancelar`, { userId: usuario.id })
      .then(res => {
        setMensaje(res.data.mensaje || "Reserva cancelada");
        setReservas(reservas.filter(r => !(r.pelicula === pelicula && r.horario === horario)));
      })
      .catch(err => {
        setMensaje(err.response?.data?.error || "Error al cancelar la reserva");
      });
  };

  return (
    <div>
      <Navbar />
      <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 15px' }}>
        <div className="card">
          <div className="card-body">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px', textAlign: 'center' }}>Mis Reservas</h2>
            
            {mensaje && (
              <div className="alert alert-info" style={{ marginBottom: '20px' }}>{mensaje}</div>
            )}
            
            {reservas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <p className="text-muted">No tenés reservas registradas</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table" style={{ margin: 0 }}>
                  <thead>
                    <tr>
                      <th style={{ borderTop: 'none' }}>Película</th>
                      <th style={{ borderTop: 'none' }}>Sala</th>
                      <th style={{ borderTop: 'none' }}>Horario</th>
                      <th style={{ borderTop: 'none' }}>Entradas</th>
                      <th style={{ borderTop: 'none' }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservas.map((r, i) => (
                      <tr key={i}>
                        <td>{r.pelicula}</td>
                        <td>{r.sala}</td>
                        <td>{r.horario}</td>
                        <td>{r.cantidad}</td>
                        <td>
                          <button 
                            className="btn btn-danger btn-sm"
                            style={{ fontSize: '0.8rem', padding: '0.25rem 0.5rem' }}
                            onClick={() => cancelarReserva(r.pelicula, r.horario)}
                          >
                            Cancelar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
