import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './assets/frontend/Home'
import Payment from './assets/frontend/Payment'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
    </Router>
  )
}

export default App
