import React, { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from "axios";

export default function Signup({ onSwitchToLogin }) {
  const [name, setName] = useState();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [role, setRole] = useState("user");
  const [warning, setWarning] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setWarning("");
    axios
      .post("http://localhost:3001/register", { name, email, password, role })
      .then((result) => {
        if (result.data && result.data.error) {
          setWarning("Ya existe un usuario con este mail registrado");
        } else {
          navigate("/login");
        }
      })
      .catch((err) => {
        if (err.response && err.response.status === 400 && err.response.data && err.response.data.error) {
          setWarning("Ya existe un usuario con este mail registrado");
        } else {
          setWarning("Error al registrar usuario");
        }
      });
  };

  return (
    <div className="register-bg">
      <div className="container mt-5" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4">Registro</h2>
        {warning && (
          <div
            style={{
              background: "#fff3cd",
              color: "#856404",
              border: "1.5px solid #ffeeba",
              borderRadius: 8,
              padding: "10px 16px",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 700,
              fontSize: 16,
              boxShadow: "0 2px 8px #ffeeba88",
            }}
          >
            {warning}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              className="form-control"
              name="name"
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              name="email"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Rol</label>
            <select
              name="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
          <button type="submit" className="btn btn-success w-100">
            Registrarse
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/login" className=" w-100">
            ¿Ya tenés una cuenta? Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
