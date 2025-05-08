import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useToast } from "@/components/ui/use-toast";

const ResetPassword = () => {
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        setIsLoading(true);

        if (newPassword !== confirmPassword) {
            setError("New password and confirm password do not match.");
            toast({
                title: "Error",
                description: "New password and confirm password do not match.",
                variant: "destructive",
            });
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post("http://localhost:8000/reset-password", {
                email,
                current_password: currentPassword,
                new_password: newPassword,
            });

            if (response.status === 200) {
                setSuccess("Password reset successfully. Please log in with your new password.");
                setEmail("");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                toast({
                    title: "Success",
                    description: "Password reset successfully.",
                });
            }
        } catch (error) {
            const errorMessage =
                error.response?.data?.detail || "Failed to reset password. Please try again.";
            setError(errorMessage);
            toast({
                title: "Error",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 flex items-center justify-center px-4">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <img
                        src="/neova_solutions_logo.png"
                        alt="Neova Solutions Logo"
                        className="w-auto h-auto mb-3 drop-shadow-md"
                    />
                </div>
                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded" role="alert">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-3 mb-4 rounded" role="alert">
                        {success} <Link to="/login" className="text-indigo-600 dark:text-indigo-400 underline">Login now</Link>.
                    </div>
                )}
                {!success && (
                    <form className="space-y-5" onSubmit={handleResetPassword}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Enter your email"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Current Password
                            </label>
                            <input
                                id="currentPassword"
                                type="password"
                                placeholder="Enter current password"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                New Password
                            </label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400 dark:focus:ring-indigo-500 text-base bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            className={`w-full bg-indigo-600 text-white font-semibold py-2 text-base rounded-md shadow-lg transition duration-300 ${
                                isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-indigo-700"
                            }`}
                            disabled={isLoading}
                        >
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </button>
                    </form>
                )}
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Back to{" "}
                        <Link to="/login" className="text-indigo-600 dark:text-indigo-400 underline hover:text-indigo-800 dark:hover:text-indigo-300">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;