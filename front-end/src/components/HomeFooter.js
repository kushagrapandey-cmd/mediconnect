import React from "react";
import {Link} from "react-router-dom";

export default function HomeFooter() {
  return (
    <footer className="bg-zinc-900">
      <div className="mx-auto w-full max-w-screen-xl p-4 py-6 lg:py-8">
        <div className="md:flex md:justify-between">
          <div className="mb-6 md:mb-0">
            <Link to="https://axiscolleges.org/" className="flex items-center">
              <img src="https://axiscolleges.org/wp-content/uploads/2020/04/axislogo-1.png" className="h-8 me-3" alt="Axis colleges Logo" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap text-white dark:text-black">Axis Institute of Technology and Management</span>
            </Link>
          </div>
          
           
            <div>
              <h2 className="mb-6 text-sm font-semibold text-white uppercase dark:text-white">Follow us</h2>
              <ul className="text-gray-500 dark:text-gray-400 font-medium">
                <li className="mb-4">
                  <Link to="https://github.com/kushagrapandey-cmd" className="hover:underline ">Github</Link>
                </li>
                <li>
                  <Link to="https://www.linkedin.com/in/kushagra-pandey-353b71175?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base_contact_details%3BwLviyHGaSK67hW5fOXdQXw%3D%3D" className="hover:underline">LinkedIn</Link>
                </li>
              </ul>
            </div>
            
          
        </div>
        <hr className="my-6 border-gray-200 sm:mx-auto dark:border-gray-700 lg:my-8" />
        <div className="sm:flex sm:items-center sm:justify-between">
          <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">© 2024 All Rights Reserved.</span>
          
        </div>
      </div>
    </footer>
  );
}
