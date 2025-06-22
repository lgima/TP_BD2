import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import Login from './Login'
import Home from './home/Home'
import Datos from './misdatos/datos'
import Reservas from './misreservas/Reservas'
import AdminPeliculas from './admin/AdminPeliculas'
import ProtectedRoute from './components/ProtectedRoute'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {
  return (
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/register' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/home' element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path='/datos' element={
            <ProtectedRoute>
              <Datos />
            </ProtectedRoute>
          } />
          <Route path='/reservas' element={
            <ProtectedRoute>
              <Reservas />
            </ProtectedRoute>
          } />
          <Route path='/admin/peliculas' element={
            <ProtectedRoute requiredRole="admin">
              <AdminPeliculas />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
  )
}

export default App
