import React, { useState } from "react";
import Navbar from "./components/Navbar";
import About from "./components/About";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Contact from "./components/Contact";
import Home from "./components/Home";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Doctor from "./components/Doctor";
import Patient from "./components/Patient";
import AuthContext from "./components/AuthContext";


export default function Hello() {
  const [name, setName] = useState("");
  const [isLoggedin, setIsLoggedIn] = useState(false);
  const [userId, setUserId ] = useState("");
 

  return (
    <AuthContext.Provider value={{ name, setName, isLoggedin, setIsLoggedIn, userId, setUserId }}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/registration" element={<Signup />} />
          <Route path="/user-login" element={<Login />} />
          <Route
            path='/doctor-dashboard'
            element={isLoggedin ? <Doctor /> : <Login />}
          />
          <Route
            path='/patient-dashboard'
            element={isLoggedin ? <Patient /> : <Login />}
          />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
