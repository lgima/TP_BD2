import React, { useEffect, useState } from "react";
import Navbar from "../navbar";

export default function DatosUsuario() {
  // Placeholder para los datos del usuario
  const usuario = {
    nombre: "Nombre Apellido",
    email: "usuario@email.com",
    // Otros datos que quieras mostrar
  };

  const handleModificar = () => {
    // Lógica para modificar los datos (abrir formulario, etc.)
    // Por ahora solo placeholder
    alert("Funcionalidad de modificar próximamente");
  };

  return (
    <div>
      <Navbar />

    <div className="container" style={{maxWidth: 400, margin: "40px auto", background: "#fff", padding: 24, borderRadius: 8, boxShadow: "0 2px 8px #ccc",}}>

      <h2>Mis Datos</h2>
      <div style={{ marginBottom: 16 }}>
        <strong>Nombre:</strong> {usuario.nombre}
      </div>
      <div style={{ marginBottom: 16 }}>
        <strong>Email:</strong> {usuario.email}
      </div>
      {/* Otros datos aquí */}
      <button className="btn btn-primary" onClick={handleModificar}>
        Modificar
      </button>
    </div>
    </div>
  );
}
