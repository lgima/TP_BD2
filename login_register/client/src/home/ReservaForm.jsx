import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ReservaForm() {
  return (
    <div>
        <form>
          <label htmlFor="pelicula">Película:</label>
          <select id="pelicula" name="pelicula" required>
            <option value="">Selecciona una película</option>
          </select>

          <label htmlFor="disponibles">Asientos disponibles:</label>
          <input
            type="number"
            id="disponibles"
            name="disponibles"
            readOnly
            style={{ background: "#eee" }}
          />

          <label htmlFor="asientos">Cantidad de Entradas:</label>
          <input
            type="number"
            id="asientos"
            name="asientos"
            min="1"
            max="10"
            required
          />

          <button type="submit">Reservar</button>
        </form>
      </div>
  );
}
