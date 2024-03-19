import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Popupmessage from './Popupmessage';

export default function Signup() {
   // Initialize useHistory

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    gender: "",
    role: "",
  });
  const [uniqueCode, setUniqueCode] = useState("");

  async function handleSignup(e) {
    e.preventDefault();
    const passInput = document.getElementById("password");
    const cPassInput = document.getElementById("confirmPassword");
    if (passInput.value !== cPassInput.value) {
      alert("Password do not match");
      return;
    }

    if (passInput.value.length < 6) {
      alert("Password too small");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/signup",
        formData
      );
      console.log(response.data);
      // Set the unique code received from the server response
      if (response.data.uniqueCode) {
        // Set the uniqueCode state with the code received from the server
        setUniqueCode(response.data.uniqueCode);
        // Redirect to homepage after successful registration
        
      } else {
        // If no uniqueCode received, display a message or handle accordingly
        console.error("No unique code received");
      }
    } catch (error) {
      console.error("Signup error:", error.response.data);
      // Handle signup error
    }
  }

  // Function to handle form input changes
  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  }

  // useEffect(() => {
  //   if (uniqueCode && window.location.pathname === "/") {
  //     // Use window.location
  //     setTimeout(() => setUniqueCode(""), 10000); // Remove code after 5 sec
  //   }
  //   // eslint-disable-next-line
  // }, []); Empty dependency array to run only once after mount// Empty dependency array to run only once after mount

  return (
    <div className="flex w-auto h-screen opacity-80 justify-center items-center ">
      <div className="bg-gray-200 shadow-md rounded-lg px-4 py-8 w-full max-w-lg">
        {/* Company logo and title */}
        <div className="flex-col justify-center items-center mb-8">
          <img
            className="w-14 h-14 mx-auto rounded-full"
            src="../assets/logo.png"
            alt="Your Company"
          />
          <h1 className="text-3xl font-semibold text-center text-gray-900">
            Sign Up
          </h1>
        </div>

        {/* Login form */}
        <form
          onSubmit={handleSignup}
          className="space-y-6"
          action="#"
          method="POST"
        >
          <div>
            <label
              htmlFor="name"
              className="block text-lg font-medium text-gray-700"
            >
              Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Enter name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          {/* Email input */}
          <div>
            <label
              htmlFor="email"
              className="block text-lg font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Enter email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div className="flex justify-around ">
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Gender
              </label>
              <div className="flex gap-4 w-full rounded-md border border-gray-500 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <label htmlFor="gender" className="inline-flex items-center">
                  <input
                    type="radio"
                    id="male"
                    name="gender"
                    value="male"
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <span className="ml-2">Male</span>
                </label>
                <label htmlFor="gender" className="inline-flex items-center">
                  <input
                    type="radio"
                    id="female"
                    name="gender"
                    value="female"
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <span className="ml-2">Female</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-lg font-medium text-gray-700">
                Signup as
              </label>
              <div className="flex gap-4 w-full rounded-md border border-gray-500 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500">
                <label htmlFor="role" className="inline-flex items-center">
                  <input
                    type="radio"
                    id="doctor"
                    name="role"
                    value="doctor"
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <span className="ml-2">Doctor</span>
                </label>
                <label htmlFor="role" className="inline-flex items-center">
                  <input
                    type="radio"
                    id="patient"
                    name="role"
                    value="patient"
                    onChange={handleChange}
                    className="cursor-pointer"
                  />
                  <span className="ml-2">Patient</span>
                </label>
              </div>
            </div>
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700"
            >
              Password
            </label>
            <div className="flex items-center mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-lg font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <div className="flex items-center mt-1">
              <input
                id="confirmPassword"
                name="Cpassword"
                type="password"
                autoComplete="current-password"
                placeholder="Confirm your password"
                required
                className="w-full rounded-md border mr-2 border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          {uniqueCode && (
             <Popupmessage uniqueCode={uniqueCode}/>
          )}
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 py-2 px-3 text-center text-md font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Register
            </button>
          </div>
        </form>

        {/* Sign-up link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Already a member?{" "}
          <Link to="/user-login" className="text-indigo-600 hover:text-indigo-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
