import React, { useEffect, useState } from "react";

export default function ReservaEntradas() {
  const [peliculas, setPeliculas] = useState([]);

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

  return (
    <div className="container" style={{ maxWidth: 400, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px #ccc" }}>
      <label htmlFor="pelicula">Película:</label>
      <select
        id="pelicula"
        name="pelicula"
        required
        onChange={e => setPelicula(e.target.value)}
      >
        <option value="">Selecciona una película</option>
        {peliculas.map(p => (
          <option key={p} value={p}>{p}</option>
        ))}
      </select>
    </div>
  );
}
