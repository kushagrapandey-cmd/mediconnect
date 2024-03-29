import React, { useState } from "react";
import { MdSearch } from "react-icons/md";
import axios from "axios";

const Records = () => {
  const [uniqueCode, setUniqueCode] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/auth/uploadedFile/${uniqueCode}`
      );
      setFiles(response.data.files);
      setError(null);
    } catch (error) {
      console.error("Error fetching uploaded files:", error);
      setError("User not found");
      setFiles([]);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center p-5">
      <div className="p-5 mt-5">
        <div className="bg-gray-300 w-full p-5 mb-10 rounded-lg text-center font-bold text-2xl cursor-pointer text-nowrap hover:scale-110 transition duration-500 flex justify-between items-center">
          <input
            type="text"
            placeholder="Enter Unique Code"
            value={uniqueCode}
            onChange={(e) => setUniqueCode(e.target.value)}
            className="w-full p-3 outline-none rounded-lg"
          />
          <button onClick={handleSearch}>
            <MdSearch className="text-gray-900 text-5xl pl-2" />
          </button>
        </div>
        {error && <p>{error}</p>}
        {files.length > 0 ? <div className="bg-red-300 p-2 rounded-lg">
          {" "}
          <ul className="text-xl list-disc  p-5 cursor-pointer">
            {files.map((file, index) => (
              <li className="pb-2 pl-2" key={index}>
                {file.filename}
              </li>
            ))}
          </ul>
        </div> : null }
      </div>
    </div>
  );
};

export default Records;
