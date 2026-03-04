import './App.css'
import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";
import Home from "./frontend/Home";
import Login from "./frontend/Login";
import SignUp from "./frontend/SignUp";
import Payment from "./frontend/Payment";
import Dashboard from './frontend/Dashboard';
import FoodItems from "./frontend/FoodItems";
import MaskWorkshop from "./frontend/MaskWorkshop";
import About from './frontend/About';

// Your original components (preserved)
import YourHome from './assets/frontend/Home'
import YourPayment from './assets/frontend/Payment'

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/food" element={<FoodItems />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<FoodItems />} />
        <Route path="/mask-workshop" element={<MaskWorkshop />} />
        <Route path="/about" element={<About />} />
        
        {/* Your original routes preserved with /my prefix */}
        <Route path="/my-home" element={<YourHome />} />
        <Route path="/my-payment" element={<YourPayment />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
