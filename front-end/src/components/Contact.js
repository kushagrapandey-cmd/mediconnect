import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./Contact.css";
import kpimg from './kpimg.png'
import pImg from "./prajjwal.png";
import princeImg from "./prince.png";
import arunImg from "./arun.png";

const Contact = () => {
  // Replace with your actual team member data
  const teamMembers = [
    {
      name: "Kushagra Pandey",
      role: "Developer",
      email: "kushagrapandey102@gmail.com",
      kpimg,
    },
    {
      name: "Arun Kumar Shukla",
      role: "Database Manager",
      email: "arunkumarshukla6143@gmail.com",
      arunImg,
    },
    {
      name: "Prajjwal Kumar",
      role: "Website Design",
      email: "alice.smith@example.com",
      pImg,
    },
    {
      name: "Prince Kumar Pal",
      role: "Backend Maintenance",
      email: "bob.johnson@example.com",
      princeImg,
    },
   
  ];


  

  const settings = {
    dots: true, 
    infinite: true, 
    slidesToShow: 2, // Change to desired number of cards visible,
    slidesToScroll: 1, // Number of cards to scroll per click,
    arrows: true, // Enable next/previous arrows
    responsive: [
      {
        breakpoint: 768, // Adjust breakpoint as needed
        settings: {
          slidesToShow: 1, // Show only 1 card on smaller screens
        },
      },
    ],
  };

  return (
    <div className="text-black text-center w-3/4 m-auto backdrop-blur">
      <div className="text-white mt-8">
        <h1 className="text-5xl  text-center font-bold">Meet Our Team</h1>
      </div>
      <div className="mt-20 mb-40">
        <Slider {...settings}>
          {teamMembers.map((member) => (
            <div
              key={member.email}
              className="card rounded-lg shadow-md p-6 opacity-75 bg-gray-200 m-8 hover:bg-gray-50" // Increased margins and padding
            >
              <div className="w-40 h-40 m-auto ">
                <img className="w-40 h-40 mb-2 rounded-full " src={member.hasOwnProperty("kpimg") ? member.kpimg : member.hasOwnProperty("arunImg") ? member.arunImg : member.hasOwnProperty("pImg") ? member.pImg : member.princeImg} alt="Img_Not_found" />
              </div>
              {/* Card content with member data */}
              <h2 className="text-2xl font-semibold">{member.name}</h2>
              <p className="text-xl text-gray-600">{member.role}</p>
              <a
                href={`mailto:${member.email}`}
                className="text-blue-500 hover:underline"
              >
                Contact
              </a>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Contact;
