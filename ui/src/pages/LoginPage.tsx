import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:8000/login", {
        email,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("access_token", response.data.access_token);
        navigate("/dashboard");
      }
    } catch (error) {
      console.error("Login failed:", error);
      setError(
          error.response?.data?.message ||
          "Invalid credentials. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-xl">
          <div className="flex flex-col items-center mb-8">
            <img src="/neova_solutions_logo.png" alt="Neova Solutions Logo" className="w-18 h-18 mb-4" />
            <h1 className="text-2xl sm:text-2xl font-bold text-slate-800">Welcome To neoComplianceAgent</h1>
            <p className="text-slate-600 font-bold text-sm sm:text-base text-center">An AI-Powered Cloud Compliance Solution</p>
          </div>
          <p className="text-slate-700 text-xs sm:text-sm text-center mt-4">Enter your credentials to begin using neoComplianceAgent</p> {/* Adjusted mt-6 for more space */}
          {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                {error}
              </div>
          )}
          <form className="space-y-7" onSubmit={handleLogin}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                />
                <span
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-500"
                    onClick={() => setShowPassword((prev) => !prev)}
                >
                {showPassword ? "🙈" : "👁️"}
              </span>
              </div>
            </div>
            <button
                type="submit"
                className={`w-full bg-indigo-600 text-white font-semibold py-3 text-lg rounded-md shadow-lg transition duration-300 ${
                    isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                }`}
                disabled={isLoading}
            >
              {isLoading ? (
                  <span className="flex items-center justify-center">
                <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                  <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                  ></circle>
                  <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                Logging in...
              </span>
              ) : (
                  "Login"
              )}
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
