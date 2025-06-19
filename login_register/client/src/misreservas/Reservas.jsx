import React, { useEffect, useState } from "react";
import Navbar from "../navbar";
import axios from "axios";

export default function Reservas() {
  const [reservas, setReservas] = useState([]);
  const [mensaje, setMensaje] = useState("");

  const usuario = JSON.parse(localStorage.getItem("usuario"));

  useEffect(() => {
    if (usuario && usuario.id) {
      axios.get(`/api/usuario/${usuario.id}`)
        .then(res => {
          setReservas(res.data.reservas || []);
        });
    }
  }, [usuario]);

  const cancelarReserva = (pelicula) => {
    if (!window.confirm(`¿Seguro que deseas cancelar la reserva de '${pelicula}'?`)) return;
    axios.post(`/api/peliculas/${pelicula}/cancelar`, { userId: usuario.id })
      .then(res => {
        setMensaje(res.data.mensaje || "Reserva cancelada");
        // Actualizar reservas en pantalla
        setReservas(reservas.filter(r => r.pelicula !== pelicula));
      })
      .catch(err => {
        setMensaje(err.response?.data?.error || "Error al cancelar la reserva");
      });
  };

  return (
    <div>
      <Navbar />
      <div className="container mt-5">
        <h2>Mis Reservas</h2>
        {mensaje && (
          <div className="alert alert-info" style={{marginBottom: 16}}>{mensaje}</div>
        )}
        {reservas.length === 0 ? (
          <div>No tenés reservas registradas.</div>
        ) : (
          <ul className="list-group mt-4">
            {reservas.map((r, i) => (
              <li key={i} className="list-group-item d-flex justify-content-between align-items-center">
                <span><strong>Película:</strong> {r.pelicula}</span>
                <span><strong>Entradas:</strong> {r.cantidad}</span>
                <button className="btn btn-danger btn-sm" onClick={() => cancelarReserva(r.pelicula)}>
                  Cancelar
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
