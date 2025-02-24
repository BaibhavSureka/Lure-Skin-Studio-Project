import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate, useLocation } from "react-router-dom";
import "./input.css";
import Admin from "./components/admin.jsx";
import Navbar from "./components/Navbar.jsx";
import Arrivals from "./components/Arrivals.jsx";
import BestSelling from "./components/BestSelling.jsx";
import Hero from "./components/Hero.jsx";
import Insta from "./components/Insta.jsx";
import Footer from "./components/Footer.jsx";
import Extra from "./components/Extra.jsx";
import Products from "./components/products.jsx";
import Blog from "./components/blog.jsx";
import Policy from "./components/policy.jsx";
import CartPage from "./components/Cart.jsx";
import Login from "./components/Login.jsx";
import Register from "./components/Register.jsx";
import Profile from "./components/Profile.jsx";

function PopupRedirect() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showPopup, setShowPopup] = useState(false);
  const isLoggedIn = localStorage.getItem("token");

  useEffect(() => {
    if (!isLoggedIn && location.pathname === "/") {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, isLoggedIn]);

  const handleLoginRedirect = () => {
    setShowPopup(false);
    navigate("/login");
  };

  return (
    showPopup && (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <p className="text-lg font-semibold">You need to be logged in to continue.</p>
          <button
            onClick={handleLoginRedirect}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  );
}

function App() {
  useEffect(() => {
    const loadingScreen = document.querySelector(".loading");

    const handleAnimationEnd = () => {
      document.body.style.overflow = "auto";
      loadingScreen.style.display = "none";
    };

    loadingScreen.addEventListener("animationend", handleAnimationEnd);

    return () => {
      loadingScreen.removeEventListener("animationend", handleAnimationEnd);
    };
  }, []);

  const [cartItems, setCartItems] = useState(
    JSON.parse(localStorage.getItem("cartItems")) || []
  );

  return (
    <Router>
      <div
        className="App overflow-x-hidden relative"
        style={{ background: "#F6E7E5" }}
      >
        <div className="loading"></div>

        <Navbar />
        <PopupRedirect />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Hero /><Arrivals /><BestSelling /><Extra /><Insta /></>} />
          <Route path="/products" element={<Products />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/policy" element={<Policy />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/cart" element={<CartPage cartItems={cartItems} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>

        <Footer />
      </div>
    </Router>
  );
}

export default App;