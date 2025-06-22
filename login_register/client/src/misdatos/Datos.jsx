import React, { useEffect, useState } from "react";
import Navbar from "../navbar";
import axios from "axios";

export default function DatosUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });

  useEffect(() => {
    // Obtener usuario de localStorage
    const usuarioGuardado = localStorage.getItem("user"); // Cambiado de "usuario" a "user"
    if (usuarioGuardado) {
      const userObj = JSON.parse(usuarioGuardado);
      // Obtener datos actualizados desde el backend
      axios
        .get(`/api/usuario/${userObj.id}`)
        .then((res) => {
          setUsuario(res.data);
          setForm({ name: res.data.name, email: res.data.email });
        })
        .catch(() => {
          setUsuario(userObj);
          setForm({ name: userObj.name, email: userObj.email });
        });
    }
  }, []);

  const handleModificar = () => {
    setEditando(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGuardar = async () => {
    try {
      const res = await axios.put(`/api/usuario/${usuario._id || usuario.id}`, form);
      setUsuario(res.data);
      localStorage.setItem("user", JSON.stringify({ // Cambiado de "usuario" a "user"
        id: res.data._id,
        name: res.data.name,
        email: res.data.email,
        role: res.data.role // Aseguramos que el rol se mantenga
      }));
      setEditando(false);
    } catch (err) {
      alert("Error al actualizar los datos");
    }
  };

  if (!usuario) {
    return (
      <div>
        <Navbar />
        <div
          className="container"
          style={{
            maxWidth: 400,
            margin: "40px auto",
            background: "#fff",
            padding: 24,
            borderRadius: 8,
            boxShadow: "0 2px 8px #ccc",
          }}
        >
          <h2>Mis Datos</h2>
          <div>Cargando datos...</div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div
        className="container"
        style={{
          maxWidth: 400,
          margin: "40px auto",
          background: "#fff",
          padding: 24,
          borderRadius: 8,
          boxShadow: "0 2px 8px #ccc",
        }}
      >
        <h2>Mis Datos</h2>
        {editando ? (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Nombre:</strong>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="form-control"
                style={{ marginTop: 4 }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Email:</strong>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="form-control"
                style={{ marginTop: 4 }}
              />
            </div>
            <button className="btn btn-success" onClick={handleGuardar} style={{ marginRight: 8 }}>
              Guardar
            </button>
            <button className="btn btn-secondary" onClick={() => setEditando(false)}>
              Cancelar
            </button>
          </>
        ) : (
          <>
            <div style={{ marginBottom: 16 }}>
              <strong>Nombre:</strong> {usuario.name}
            </div>
            <div style={{ marginBottom: 16 }}>
              <strong>Email:</strong> {usuario.email}
            </div>
            <button className="btn btn-primary" onClick={handleModificar}>
              Modificar
            </button>
          </>
        )}
      </div>
    </div>
  );
}
