import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post("http://localhost:8000/signup", {
        email,
        password,
      });

      if (response.status === 200 || response.status === 201) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      setError(
          error.response?.data?.message ||
          "Signup failed. User may already exist or input is invalid."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-xl">
          <div className="flex flex-col items-center mb-8">
            <img src="/neova_solutions_logo.png" alt="Neova Solutions Logo" className="w-21 h-21 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">neoComplianceAgent Signup</h1>
            <p className="text-slate-500 text-sm sm:text-base text-center">Start securing your cloud now</p>
          </div>
          {isSuccess ? (
              <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded" role="alert">
                <p className="font-semibold">Signup successful!</p>
                <p>
                  Please <Link to="/login" className="text-indigo-600 font-semibold underline hover:text-indigo-800">log in</Link> with your new credentials.
                </p>
              </div>
          ) : (
              <>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded" role="alert">
                      {error}
                    </div>
                )}
                <form className="space-y-6" onSubmit={handleSignup}>
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
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input
                        id="confirmPassword"
                        type={showPassword ? "text" : "password"}
                        placeholder="Confirm your password"
                        className="w-full px-5 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 text-base"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        disabled={isLoading}
                    />
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
                    Signing up...
                  </span>
                    ) : (
                        "Sign Up"
                    )}
                  </button>
                  <p className="text-center text-sm">
                    Already have an account?{" "}
                    <a href="/login" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
                      Login
                    </a>
                  </p>
                </form>
              </>
          )}
        </div>
      </div>
  );
};

export default SignupPage;