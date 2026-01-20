import { Routes, Route } from "react-router-dom";
import Navbar from "./frontend/Navbar";
import Footer from "./frontend/Footer";

import Home from "./frontend/Home";
import FoodItems from "./frontend/FoodItems";
import Login from "./frontend/Login";
import Signup from "./frontend/Signup";

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/food" element={<FoodItems />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>

      <Footer />
    </>
  );
}

export default App;
