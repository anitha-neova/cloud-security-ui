import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const LogoutPage: React.FC = () => {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        toast({
            title: "Logged out",
            description: "You have been successfully logged out.",
        });

        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    navigate("/login", { replace: true });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [navigate, toast]);

    const handleImmediateRedirect = () => {
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-blue-50 dark:bg-gray-800 p-6">
            <div className="text-center">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Redirecting to login page in {countdown} seconds.
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    <Link
                        to="/login"
                        onClick={handleImmediateRedirect}
                        className="text-blue-500 dark:text-blue-400 hover:underline"
                    >
                        Click here
                    </Link>{" "}
                    if you want to go to the login page now.
                </p>
            </div>
        </div>
    );
};

export default LogoutPage;