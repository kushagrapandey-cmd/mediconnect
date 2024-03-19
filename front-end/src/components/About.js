import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about relative  overflow-hidden bg-slate backdrop-blur pb-20 pt-15 max-h-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
       {/* Ensured initial top-0 placement for scrolling */}
        <div className="flex top-0 flex-col justify-center items-center">
          <h1 className="text-5xl font-bold text-white mt-10">About Medi-Connect</h1>
          <p className="text-lg text-gray-300 text-center m-8 max-w-2xl">
            Medi-Connect is a pioneering healthcare initiative committed to revolutionizing medical services accessibility and efficiency through an integrated platform.
          </p>
          <div className="flex text-2xl  mt-8 justify-center items-center">
            <div className="w-full m-5 md:w-1/2 lg:w-1/3 p-4 rounded-lg opacity-50  bg-white">
              <h3 className="text-3xl font-semibold text-center mb-2">Vision</h3>
              <p className="text-gray-500 text-center">
                Our vision is to create a seamless healthcare experience, ensuring every individual has access to comprehensive medical services and personalized health advice.
              </p>
            </div>
            <div className="w-full m-5 md:w-1/2 lg:w-1/3 p-4 rounded-lg opacity-50 bg-white ">
              <h3 className="text-3xl font-semibold text-center mb-2">Mission</h3>
              <p className="text-gray-500 text-center">
                Our mission is to consolidate regional medical information, facilitate interoperability, and empower users with a secure and unified health interface. All medical information and resources should be available at one place.
              </p>
            </div>
            <div className="w-full m-5 md:w-1/2 lg:w-1/3 p-4 rounded-lg opacity-50 bg-white">
              <h3 className="text-3xl font-semibold text-center mb-2">Values</h3>
              <ul className="list-disc list-inside text-gray-500 ml-4">
                <li className='m-2'>Innovation</li>
                <li className='m-2'>Accessibility</li>
                <li className='m-2'>Collaboration</li>
                <li className='m-2'>Empowerment</li>
                <li className='m-2'>Continuous Improvement</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
