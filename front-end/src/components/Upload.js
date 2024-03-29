import React, { useEffect, useRef, useContext, useState } from "react";
import AuthContext from "./AuthContext";
import axios from "axios";
import { MdDeleteForever } from "react-icons/md";

const Upload = () => {

    const dropzoneBoxRef = useRef(null);
  const { name, userId } = useContext(AuthContext); // Access context
  const [selectedFile, setSelectedFile] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    console.log(name);
    const dropzoneBox = dropzoneBoxRef.current;

    fetchFiles();

    const inputFiles = dropzoneBox.querySelectorAll(
      ".dropzone-area input[type='file']"
    );
    const inputElement = inputFiles[0];
    const dropZoneElement = inputElement.closest(".dropzone-area");

    inputElement.addEventListener("change", (e) => {
      if (inputElement.files.length) {
        setSelectedFile(inputElement.files[0]);
        updateDropzoneFileList(dropZoneElement, inputElement.files[0]);
      }
    });

    dropZoneElement.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZoneElement.classList.add("dropzone--over");
    });

    ["dragleave", "dragend"].forEach((type) => {
      dropZoneElement.addEventListener(type, (e) => {
        dropZoneElement.classList.remove("dropzone--over");
      });
    });

    dropZoneElement.addEventListener("drop", (e) => {
      e.preventDefault();

      if (e.dataTransfer.files.length) {
        inputElement.files = e.dataTransfer.files;
        updateDropzoneFileList(dropZoneElement, e.dataTransfer.files[0]);
      }

      dropZoneElement.classList.remove("dropzone--over");
    });

    // Update to clear file selection on reset
    dropzoneBox.addEventListener("reset", (e) => {
      e.preventDefault();
      inputElement.value = ""; // Clear file selection
      setSelectedFile(null); // Clear selected file state
      updateDropzoneFileList(dropZoneElement, null); // Update file info
    });

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      inputElement.removeEventListener("change", (e) => {});
      //dropZoneElement.removeEventListener("dragover", (e) => {});
      // ... remove other event listeners
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(
        `http://localhost:4000/api/auth/uploadedFiles/${userId}`
      );
      setFiles(response.data.files);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleSaveButtonClick = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
  
    if (selectedFile) {
      const formData = new FormData();
      formData.append('uploadedFile', selectedFile); // Append the file to FormData
      formData.append('userId', userId); // Append other form data if needed
      formData.append('filename', selectedFile.name);
  
      console.log("Data to be sent to server:", formData.get('uploadedFile')); // Corrected line
  
      try {
        const response = await axios.post(
          "http://localhost:4000/api/auth/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" }, // Corrected header
          }
        );

        // if (!response.data.ok) { // Assuming your backend response has an "ok" property
        //   throw new Error(`HTTP error! status: ${response.data.status}`);
        // }

        console.log("File uploaded successfully!");
        console.log(response.data); // Log response data if applicable

        // Add the new file to the list
        const newFiles = [...files, { fileName: selectedFile.name }];
        setFiles(newFiles);
        fetchFiles();
        // Reset dropzone after successful upload
        const dropzoneBox = dropzoneBoxRef.current;
        dropzoneBox.reset();
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    } else {
      console.error("No file selected.");
    }
  };

  const updateDropzoneFileList = (dropzoneElement, file) => {
    let dropzoneFileMessage = dropzoneElement.querySelector(".file-info");

    if (file) {
      dropzoneFileMessage.innerHTML = `
        ${file.name}, ${file.size} bytes
      `;
    } else {
      dropzoneFileMessage.innerHTML = "No Files Selected";
    }
  };

// Define the handleFileClick function
const handleFileClick = async (filename) => {
  try {
    // Make a request to your backend, passing the filename
    const response = await axios.post('http://localhost:4000/api/auth/download', { filename }, { responseType: 'blob' });

    // Create a blob from the response data
    const blob = new Blob([response.data]);

    // Create a temporary anchor element
    const a = document.createElement('a');
    a.style.display = 'none';

    // Create a URL for the blob and set it as the href attribute of the anchor element
    const url = window.URL.createObjectURL(blob);
    a.href = url;

    // Set the filename for the downloaded file
    a.download = filename;

    // Append the anchor element to the body
    document.body.appendChild(a);

    // Click the anchor element to start downloading the file
    a.click();

    // Remove the anchor element from the body
    document.body.removeChild(a);

    // Clean up the blob URL
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading file:', error);
  }
};

const handleDelete = async (filename) => {
  try {
    await axios.delete(`http://localhost:4000/api/auth/delete/${filename}`);
    // Refresh the file list after deletion
    // You can implement this part based on your application's logic
    fetchFiles();
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

  return (
    <div>
        <div>
          <div className="bg-gray-300 text-black h-64 mb-10 rounded-2xl shadow-lg shadow-gray-500  hover:bg-gray-100">
            <h2 className="text-center text-3xl pt-2 pb-2 underline decoration-black">
              Your Documents
            </h2>
            <div>
              <ul className="ml-2 p-2 pl-5 text-xl list-disc">
                {files.map((file, index) => (
                  <li key={index} >
                    <button onClick={() => handleFileClick(file.filename)}>
                      {file.filename}
                    </button>
                    <button className="ml-16" onClick={() => handleDelete(file.filename)}>
                       <MdDeleteForever />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
        </div>
      

      <div className="w-6/12">
        <form ref={dropzoneBoxRef} onSubmit={handleSaveButtonClick}>
          <div className="bg-gray-800 rounded-lg p-10 flex flex-col items-center border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">
              Upload and attach files
            </h2>
            <p className="text-base text-gray-500 mb-6">
              Click to upload or drag and drop
            </p>
            <div className="dropzone-area relative w-full min-h-64 flex justify-center items-center flex-col border-2 border-dashed border-white rounded-lg cursor-pointer hover:bg-gray-700">
              <div className="file-info text-base text-gray-500">
                No Files Selected
              </div>
              <input
                type="file"
                required
                id="uploadFile"
                name="uploadedFile"
                className="absolute top-0 right-0 bottom-0 left-0 opacity-0"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="file-upload-icon h-20 w-20 mx-auto mb-4 text-white"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18a4.6 4.4 0 0 1 0-9a5 4.5 0 0 1 11 2h1a3.5 3.5 0 0 1 0 7h-1Z" />
                <path d="M12 12l3 -3l3 3" />
                <path d="M16 12v6" />
              </svg>
            </div>
            <div className="dropzone-actions text-xl mt-8 flex justify-center space-x-4">
              <button
                type="reset"
                onClick={(e) =>
                  updateDropzoneFileList(dropzoneBoxRef.current, null)
                }
                className="btn btn-secondary hover:bg-slate-500 p-2 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary hover:bg-slate-500 p-2 pr-4 pl-4 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

   
  )
}

export default Upload