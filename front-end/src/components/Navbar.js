/* eslint-disable react/jsx-no-undef */

import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const featuresRef = useRef(null); // Create a ref for the Features section

  const features = (
    <ul
      ref={featuresRef}
      className="absolute top-full left-0 bg-zinc-900 p-2 shadow-xl rounded-md overflow-hidden"
    >
      <li className="whitespace-nowrap pb-2 hover:bg-slate-700 rounded p-2">
        <Link to="/tracker" className=" ">
          Medi Tracker
        </Link>
      </li>
      <li className="whitespace-nowrap pb-2 hover:bg-slate-700 rounded p-2">
        <Link to="/assistant">Virtual Assistant</Link>
      </li>
      <li className="whitespace-nowrap pb-2 hover:bg-slate-700 rounded p-2">
        <Link to="/hospitals">Nearest Hospital</Link>
      </li>
    </ul>
  );

  const [isOpen, setIsOpen] = useState(false);

  const handleFeatures = () => {
    setIsOpen(!isOpen); // Toggle state on click
  };

  useEffect(() => {
    // Function to close Features section when clicking outside
    const handleClickOutside = (event) => {
      if (featuresRef.current && !featuresRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Add event listener to the window
    window.addEventListener("click", handleClickOutside);

    // Remove event listener on component unmount
    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []); // Empty dependency array ensures this effect runs only once

  // Function to scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Smooth scroll animation
    });
  };

  return (
    <div className="navbar sticky top-0 z-10 flex justify-between bg-zinc-900   text-white">
      <div className="flex">
        <div className="p-4">
          {" "}
          <Link to="/">
            <img
              className="h-12  rounded-full"
              onClick={scrollToTop}
              src="/assets/logo.png"
              alt="Mediconnect logo"
            />
          </Link>
        </div>
        <div className="flex items-center gap-x-4 text-xl font-semibold">
          <ul className="flex ml-4 gap-4">
            <li className="hover:bg-slate-700  rounded p-3">
              <Link to="/" onClick={scrollToTop}>
                Home
              </Link>
            </li>
            <li className="hover:bg-slate-700 rounded p-3">
              <Link to="/about">About</Link>
            </li>
            <li className="hover:bg-slate-700 rounded p-3">
              <Link to="/contact">Contact</Link>
            </li>
            <li className="relative">
              <button
                className="hover:bg-slate-700 rounded p-3 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation(); // Stop event propagation
                  handleFeatures(); // Toggle Features section
                }}
              >
                Features
              </button>
              {isOpen && features}
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-center gap-x-4 text-xl font-semibold">
        <button
          className="bg-blue-500 p-2 rounded hover:bg-sky-400"
          type="button"
        >
          <Link to="/registration">Get Started</Link>
        </button>
        <button className="mr-6" type="button">
          <Link to="/user-login">Login</Link>
        </button>
      </div>
    </div>
  );
};

export default Navbar;
