import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post("http://localhost:8000/signup", {
        email,
        password,
      });

      if (response.status === 200) {
        alert("Signup successful! You can now login.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Signup failed:", error);
      alert("Signup failed. User may already exist or input is invalid.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-xl">
        <div className="flex flex-col items-center mb-8">
          <img src="/neova_solutions_logo.png" alt="Logo" className="w-21 h-21 mb-4" />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">neoComplianceAgent Signup</h1>
          <p className="text-slate-500 text-sm sm:text-base text-center">Start securing your cloud now</p>
        </div>
        <form onSubmit={handleSignup} className="space-y-6">
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
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 text-lg rounded-md shadow-lg transition duration-300"
          >
            Sign Up
          </button>
          <p className="text-center text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
