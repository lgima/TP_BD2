import React, { useEffect, useState } from "react";

export default function ReservaEntradas() {
  const [peliculas, setPeliculas] = useState([]);
  const [pelicula, setPelicula] = useState("");
  const [asientosDisponibles, setAsientosDisponibles] = useState("");
  const [sinDisponibilidad, setSinDisponibilidad] = useState(false);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPeliculas() {
      try {
        const response = await fetch("/api/peliculas");
        if (response.ok) {
          const data = await response.json();
          setPeliculas(data);
        }
      } catch (err) {
        // Manejo de error opcional
      }
    }
    fetchPeliculas();
  }, []);

  useEffect(() => {
    if (!pelicula) {
      setAsientosDisponibles("");
      setSinDisponibilidad(false);
      return;
    }
    async function fetchDisponibles() {
      try {
        const response = await fetch(`/api/peliculas/${pelicula}/disponibles`);
        if (response.ok) {
          const data = await response.json();
          setAsientosDisponibles(data.disponibles);
          setSinDisponibilidad(data.disponibles <= 0);
        } else {
          setAsientosDisponibles("");
          setSinDisponibilidad(true);
        }
      } catch (err) {
        setAsientosDisponibles("");
        setSinDisponibilidad(true);
      }
    }
    fetchDisponibles();
  }, [pelicula]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    if (!pelicula) {
      setMensaje("Seleccioná una película");
      return;
    }
    if (!asientosDisponibles || asientosDisponibles <= 0) {
      setMensaje("No hay asientos disponibles para esta película");
      return;
    }
    if (parseInt(cantidad) > parseInt(asientosDisponibles)) {
      setMensaje("No hay suficientes asientos disponibles para la cantidad solicitada");
      return;
    }
    setLoading(true);
    try {
      const usuario = JSON.parse(localStorage.getItem("usuario"));
      const response = await fetch(`/api/peliculas/${pelicula}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cantidad: parseInt(cantidad), userId: usuario?.id })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje(data.mensaje);
        // Refrescar asientos disponibles
        const dispRes = await fetch(`/api/peliculas/${pelicula}/disponibles`);
        if (dispRes.ok) {
          const dispData = await dispRes.json();
          setAsientosDisponibles(dispData.disponibles);
          setSinDisponibilidad(dispData.disponibles <= 0);
        }
      } else {
        setMensaje(data.error || "Error al reservar");
      }
    } catch (err) {
      setMensaje("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px #ccc" }}>
      <form onSubmit={handleSubmit}>
        <label htmlFor="pelicula">Película:</label>
        <select
          id="pelicula"
          name="pelicula"
          required
          value={pelicula}
          onChange={e => setPelicula(e.target.value)}
        >
          <option value="">Selecciona una película</option>
          {peliculas.map(p => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        <label htmlFor="asientosDisponibles">Asientos disponibles:</label>
        <input
          type="text"
          id="asientosDisponibles"
          value={asientosDisponibles}
          readOnly
          style={{ backgroundColor: "#eee" }}
        />
        {sinDisponibilidad && (
          <div
            id="sinDisponibilidad"
            style={{
              color: "red",
              textAlign: "center",
              marginTop: 8,
            }}
          >
            No hay asientos disponibles
          </div>
        )}

        <label htmlFor="asientos">Cantidad de Entradas:</label>
        <input
          type="number"
          id="asientos"
          name="asientos"
          min="1"
          max="10"
          required
          value={cantidad}
          onChange={e => setCantidad(e.target.value)}
        />

        <button type="submit" disabled={loading}>Reservar</button>
        {mensaje && (
          <div style={{ marginTop: 12, color: mensaje.startsWith("Reserva exitosa") ? "green" : "red", textAlign: "center" }}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
}
