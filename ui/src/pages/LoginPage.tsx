import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
  
    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });
  
      if (response.status === 200) {
        // Store the token in localStorage
        localStorage.setItem("access_token", response.data.access_token);
        alert("Login successful!");
        navigate("/dashboard");

         // Navigate to the dashboard page
      }
    } catch (error) {
      console.error("Login failed:", error);
      alert("Login failed. Please check your credentials.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/neova_solutions_logo.png" alt="Logo" className="w-21 h-21 mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">neoComplianceAgent Login</h1>
          <p className="text-slate-500 text-sm sm:text-base text-center">Cloud Security & Compliance Portal</p>
        </div>
        <form className="space-y-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <span
              className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>
          <button
            type="submit"
            onClick={handleLogin}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-lg rounded-md shadow-lg transition duration-300"
          >
            Login
          </button>
          <p className="text-center text-sm">
            Don’t have an account?{" "}
            <a href="/signup" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
              Sign up
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
