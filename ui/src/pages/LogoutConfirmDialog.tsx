import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const LogoutConfirmDialog: React.FC = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Clear any session/token logic here
        localStorage.removeItem("access_token"); // example

        // Navigate to the intermediate /logout page with countdown
        navigate("/logout");
    };

    const handleCancel = () => {
        navigate(-1); // Go back to the previous page, e.g., dashboard
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900 p-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    Are you sure you want to log out?
                </h2>
                <div className="flex justify-center space-x-4">
                    <Button variant="destructive" onClick={handleLogout}>
                        Yes, Logout
                    </Button>
                    <Button onClick={handleCancel}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};

export default LogoutConfirmDialog;
