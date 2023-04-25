import { useState } from 'react'
import logo from './assets/logo.png'
import './App.css'
import {Routes, Route, useNavigate} from 'react-router-dom';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="http://127.0.0.1:5173/" target="_blank">
          <img src={logo} className="logo" alt="logo" />
        </a>
      </div>
      <h1>Welcome to CulinaryLegacy ٩(◕‿◕｡)۶</h1>
      <div className="card">
        {/* should probably wire this better */}
        <button onClick={event =>  window.location.href='/login'}>
         Login Here!
        </button>
      </div>
    </>
  )
}


export default App
