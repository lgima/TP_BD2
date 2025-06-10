import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Por favor, complete todos los campos");
      return;
    }
    axios
      .post("/api/login", { email, password })
      .then((result) => {
        if (result.data.success) {
          // Guardar datos de usuario en localStorage
          localStorage.setItem("usuario", JSON.stringify(result.data.user));
          navigate("/home");
        } else {
          setError(result.data.error || "Datos incorrectos");
        }
      })
      .catch((err) => setError("Error de conexión"));
  };

  return (
    <div>
      <div className="container mt-5" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4">Iniciar Sesión</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          <button type="submit" className="btn btn-success w-100">
            Iniciar Sesión
          </button>
        </form>
        <div className="text-center mt-3">
          <Link to="/register" className=" w-100">
            ¿No tenés cuenta? Registrarse
          </Link>
        </div>
      </div>
    </div>
  );
}
