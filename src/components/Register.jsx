import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post("https://lure-skin-studio.onrender.com/user/register", {
        name,
        email,
        address,
        phone,
        password,
      });

      if (response.status === 201) {
        const { token } = response.data;

        localStorage.setItem("token", token);

        alert("Registration successful!");
        navigate("/products");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Error registering user");
    }
  };

  return (
    <div className="register-container">
      <section className="container mx-auto px-6 py-12">
        <div className="flex justify-center items-center flex-wrap h-full text-gray-800">
          {/* Image Section */}
          <div className="md:w-8/12 lg:w-6/12 mb-12 md:mb-0">
            <img
              src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-login-form/draw2.svg"
              className="w-full"
              alt="Registration"
            />
          </div>

          {/* Form Section */}
          <div className="md:w-8/12 lg:w-5/12 lg:ml-20">
            <form onSubmit={handleSubmit}>
              {/* Error Message */}
              {error && (
                <div className="text-center border-2 border-red-600 p-2 mb-4 rounded-md bg-red-100 shadow-md">
                  {error}
                </div>
              )}

              {/* Input Fields */}
              <div className="mb-6">
                <input
                  type="text"
                  name="name"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="email"
                  name="email"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  name="address"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="text"
                  name="phone"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Phone Number: Add +91 before your contact number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  name="password"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-6">
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-control block w-full px-4 py-2 text-xl font-normal text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="inline-block w-full px-7 py-3 text-white bg-blue-600 font-medium text-sm uppercase rounded shadow-md hover:bg-blue-700 transition duration-150 ease-in-out"
              >
                Register
              </button>
              <p className="text-sm font-semibold mt-2 pt-1 mb-0">
                                  Already have an account?{' '}
                                  <Link
                                    to="/login"
                                    className="text-red-600 hover:text-red-700 focus:text-red-700 transition duration-200 ease-in-out"
                                  >
                                    Login
                                  </Link>
                                </p>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Register;
