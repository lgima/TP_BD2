import { useState } from 'react'
import 'bootstrap/dist/css/bootstrap.min.css'
import Signup from './Signup'
import Login from './Login'
import Home from './home/Home'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

function App() {

  return (
      <BrowserRouter>
        <Routes>
          <Route path='/register' element={<Signup />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/home' element={<Home />}></Route>
          
        </Routes>
      </BrowserRouter>
  )
}

export default App
