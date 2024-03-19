import React from "react";
import About from "./About";
import Contact from "./Contact";
import Footer from "./HomeFooter";

export default function Home() {
    
  return (
    <div className="home">
      <div className="font-semibold tracking-wide text-white m-40">
        <h1 className="text-6xl pb-6">MEDI CONNECT</h1>
        <p className="text-3xl  leading-9">Welcome to Medi-connect!</p>
        <p className="text-3xl  leading-9">
          Your one-stop solution for all <br /> your medical needs.
        </p>
      </div>
      <div className="mt-80 mb-40">
        <About />
      </div>
      <div>
        <Contact />
      </div>
      <div>
        <Footer />
      </div>
    </div>
  );
}
