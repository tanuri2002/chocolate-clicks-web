import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";
import Home from "./frontend/Home";
import Login from "./frontend/Login";
import Signup from "./frontend/Signup";
import Payment from "./frontend/Payment";
import Dashboard from './frontend/Dashboard';
import FoodItems from "./frontend/FoodItems";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/food" element={<FoodItems />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<FoodItems />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
