import React, { useEffect, useState } from "react";

export default function ReservaForm() {
  const [peliculas, setPeliculas] = useState([]);
  const [pelicula, setPelicula] = useState("");
  const [horario, setHorario] = useState("");
  const [peliculaSeleccionada, setPeliculaSeleccionada] = useState(null);
  const [asientosDisponibles, setAsientosDisponibles] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPeliculas() {
      try {
        const response = await fetch("/api/peliculas/detalles");
        if (response.ok) {
          const data = await response.json();
          setPeliculas(data);
        }
      } catch (err) {
        console.error('Error al cargar películas:', err);
      }
    }
    fetchPeliculas();
  }, []);

  useEffect(() => {
    if (!pelicula) {
      setPeliculaSeleccionada(null);
      setHorario("");
      return;
    }
    const peliculaEncontrada = peliculas.find(p => p.nombre === pelicula);
    setPeliculaSeleccionada(peliculaEncontrada);
    setHorario("");
  }, [pelicula, peliculas]);

  useEffect(() => {
    if (!peliculaSeleccionada || !horario) {
      setAsientosDisponibles(0);
      return;
    }

    const funcion = peliculaSeleccionada.horarios.find(f => f.horario === horario);
    if (funcion) {
      setAsientosDisponibles(funcion.total - funcion.reservados);
    }
  }, [peliculaSeleccionada, horario]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje("");
    
    if (!pelicula) {
      setMensaje("Seleccioná una película");
      return;
    }
    
    if (!horario) {
      setMensaje("Seleccioná un horario");
      return;
    }
    
    if (!asientosDisponibles || asientosDisponibles <= 0) {
      setMensaje("No hay asientos disponibles para esta función");
      return;
    }
    
    if (parseInt(cantidad) > asientosDisponibles) {
      setMensaje("No hay suficientes asientos disponibles para la cantidad solicitada");
      return;
    }

    setLoading(true);
    try {
      const usuario = JSON.parse(localStorage.getItem("user"));
      const response = await fetch(`/api/peliculas/${pelicula}/reservar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cantidad: parseInt(cantidad), 
          userId: usuario?.id,
          horario: horario
        })
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        setMensaje(data.mensaje);
        // Actualizar información de la película
        const responseDetalles = await fetch("/api/peliculas/detalles");
        if (responseDetalles.ok) {
          const peliculasActualizadas = await responseDetalles.json();
          setPeliculas(peliculasActualizadas);
          const peliculaActualizada = peliculasActualizadas.find(p => p.nombre === pelicula);
          setPeliculaSeleccionada(peliculaActualizada);
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
          className="form-control mb-3"
          value={pelicula}
          onChange={e => setPelicula(e.target.value)}
          required
        >
          <option value="">Selecciona una película</option>
          {peliculas.map(p => (
            <option key={p.nombre} value={p.nombre}>{p.nombre}</option>
          ))}
        </select>

        {peliculaSeleccionada && (
          <>
            <div className="mb-3">
              <strong>Sala:</strong> {peliculaSeleccionada.sala}
            </div>

            <label htmlFor="horario">Horario:</label>
            <select
              id="horario"
              className="form-control mb-3"
              value={horario}
              onChange={e => setHorario(e.target.value)}
              required
            >
              <option value="">Selecciona un horario</option>
              {peliculaSeleccionada.horarios.map(f => (
                <option key={f.horario} value={f.horario}>
                  {f.horario} - {f.total - f.reservados} asientos disponibles
                </option>
              ))}
            </select>
          </>
        )}

        {horario && (
          <>
            <div className="mb-3">
              <strong>Asientos disponibles:</strong> {asientosDisponibles}
            </div>

            <label htmlFor="cantidad">Cantidad de Entradas:</label>
            <input
              type="number"
              id="cantidad"
              className="form-control mb-3"
              min="1"
              max={asientosDisponibles}
              value={cantidad}
              onChange={e => setCantidad(parseInt(e.target.value) || 1)}
              required
            />
          </>
        )}

        <button 
          type="submit" 
          className="btn btn-primary w-100"
          disabled={loading || !asientosDisponibles}
        >
          {loading ? "Procesando..." : "Reservar"}
        </button>

        {mensaje && (
          <div className={`alert ${mensaje.includes("exitosa") ? "alert-success" : "alert-danger"} mt-3`}>
            {mensaje}
          </div>
        )}
      </form>
    </div>
  );
}
