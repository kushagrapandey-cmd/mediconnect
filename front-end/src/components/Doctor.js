import React, { useContext , useState} from 'react';
import AuthContext from "./AuthContext";
import { MdArrowForwardIos } from "react-icons/md";
import Records from './Records'
import Upload from './Upload'

const Doctor = () => {
  const { name } = useContext(AuthContext); // Access context
  const [showRecords, setShowRecords] = useState(false);
  const [uploads, setUploads] = useState(false);

  const handleRecords = () => {
    setShowRecords(true);
    setUploads(false);
  }
  const handleUpload = () => {
    setUploads(true);
    setShowRecords(false);
  }

  return (
    <div>
      <div className="flex flex-col justify-center items-center p-5">
        <h1 className="text-center p-5 text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 hover:bg-gradient-to-l">Welcome {name}</h1>
        <div className="p-5 mt-28  w-1/2">
          <div onClick={handleUpload} className="bg-gray-300 w-full p-5 mb-10 rounded-lg text-center font-bold text-2xl cursor-pointer text-nowrap hover:scale-110 transition duration-500 flex justify-between items-center"> {/* Modified div */}
            <span>Want to upload your documents?</span> {/* Text */}
            <div><MdArrowForwardIos /></div> {/* Icon */}
          </div>
          <div onClick={handleRecords} className="bg-gray-300 w-full p-5 mb-10 rounded-lg text-center font-bold text-2xl cursor-pointer hover:scale-110 transition duration-500 flex justify-between items-center"> {/* Modified div */}
            <span>Want to access Patient's records?</span> {/* Text */}
            <MdArrowForwardIos /> {/* Icon */}
          </div>
          {
            showRecords && <Records />
          }
          {
            uploads && <Upload />
          }
        </div>
      </div>
    </div>
  )
}

export default Doctor;
