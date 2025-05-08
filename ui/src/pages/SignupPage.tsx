import { Link } from "react-router-dom";

const SignupPage = () => {
  return (
      <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
        <div className="relative bg-white rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md text-center">
          <img
              src="/neova_solutions_logo.png"
              alt="Neova Solutions Logo"
              className="absolute top-4 left-4 w-24 h-auto"
          />
          <div className="flex flex-col items-center mt-12 mb-6">
            <img src="/welcome_neocompliance.jpg" alt="neoCompliance Welcome" className="w-32 mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-4">User Registration</h2>
            <p className="text-slate-700 text-sm">
              Only administrators can create new user accounts. Please contact your administrator to get started.
            </p>
          </div>
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold underline hover:text-indigo-800">
              Login
            </Link>
          </p>
        </div>
      </div>
  );
};

export default SignupPage;