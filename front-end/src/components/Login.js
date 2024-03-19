import React, { useState , useContext} from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios"; // Import axios for making API calls
import AuthContext from "./AuthContext";

function Login() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    uniqueCode: "",
  });
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const { setName , setIsLoggedIn ,setUserId} = useContext(AuthContext); // Access context


  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:4000/api/auth/login",
        loginData
      );
      
      
      
        // User login successful
        // Store user data in local storage or state management solution
        localStorage.setItem("user", JSON.stringify(response.data));
        console.log("Login success");
        console.log(response.data._id);
        

        // Redirect user based on their role (replace with your logic)
        const role = response.data.role;
        if (role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (role === "patient") {
          setName(response.data.name);
          setIsLoggedIn(true);
          setUserId(response.data._id);
          navigate("/patient-dashboard");
        } else {
          // Handle unexpected roles or invalid data
          setErrorMessage("Invalid role information.");
          console.log(errorMessage);
        }
      
    } catch (error) {
      alert("Please Check your credentials.");
      console.error(error);
      setErrorMessage("An error occurred. Please try again later.");
    }
    setLoginData({
      email: "",
      password: "",
      uniqueCode: "",
    });
  };

  // Check if user is already logged in on component mount (optional)
  // useEffect(() => {
  //   const storedUser = localStorage.getItem("user");
  //   if (storedUser) {
  //     const user = JSON.parse(storedUser);
  //     // Redirect user based on their role if already logged in
  //     const role = user.role;
  //     if (role === "doctor") {
  //       navigate("/doctor-dashboard");
  //     } else if (role === "patient") {
  //       navigate("/patient-dashboard");
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const handleLoginChange = (e) => {
    const {name,value} = e.target;
   
    setLoginData((prevData) => ({
      ...prevData,
      [name]:value
    }))
  }

  return (
    <div className="flex  h-screen opacity-80 justify-center items-center ">
      <div className="bg-gray-200  shadow-md rounded-lg px-8 py-8 w-full max-w-sm">
        {/* Company logo and title */}
        <div className="flex-col justify-center items-center mb-8">
          <img
            className="w-14 h-14 mx-auto rounded-full"
            src="../assets/logo.png"
            alt="Your Company"
          />
          <h1 className="text-3xl font-semibold text-center text-gray-900">
            Log in
          </h1>
        </div>

        {/* Login form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
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
                placeholder="Enter your email"
                required
                onChange={handleLoginChange}
                value={loginData.email}
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="text"
              className="block text-lg font-medium text-gray-700"
            >
              Unique Code
            </label>
            <div className="mt-1">
              <input
                id="uniqueCode"
                name="uniqueCode"
                type="text"
                placeholder="Enter the secret code"
                onChange={handleLoginChange}
                value={loginData.uniqueCode}
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
              Password
            </label>
            <div className="flex items-center mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                onChange={
                  handleLoginChange
                }
                value={loginData.password}
                required
                className="w-full rounded-md border border-gray-300 py-2 px-3 text-gray-700 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <Link
                to="/"
                className="ml-4 text-sm text-gray-600 hover:text-indigo-500"
              >
                Forgot password?
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full rounded-md bg-indigo-600 py-2 px-3 text-center text-md font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Log in
            </button>
          </div>
        </form>

        {/* Sign-up link */}
        <p className="mt-6 text-center text-sm text-gray-600">
          Not a member?{" "}
          <Link to="/registration" className="text-indigo-600 hover:text-indigo-500">
            Sign up first
          </Link>
        </p>
      </div>
    </div>
  );
}
export default Login;
