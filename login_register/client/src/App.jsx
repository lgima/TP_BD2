import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import Login from './Login'
import Home from './home/Home'
import Datos from './misdatos/datos'
import Reservas from './misreservas/Reservas'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Signup />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/home' element={<Home />}></Route>
          <Route path='/datos' element={<Datos />}></Route>
          <Route path='/reservas' element={<Reservas />}></Route>
          
        </Routes>
      </BrowserRouter>
  )
}

export default App
