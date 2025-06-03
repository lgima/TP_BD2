import React from "react";
import "./home.css";
import ReservaForm from "./ReservaForm";
import Navbar from "../navbar";

export default function Home() {
  return (
    <div>
      <Navbar />
      
      <div className="container">
        <h2>Reserva tu Entrada</h2>
        <ReservaForm />
      </div>
    </div>
  );
}
