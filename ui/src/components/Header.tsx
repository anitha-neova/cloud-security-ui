import { Bell, HelpCircle, Settings, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { useEffect, useState } from "react";

interface HeaderProps {
    className?: string;
}

const Header = ({ className }: HeaderProps) => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState("light");

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove(theme === "light" ? "dark" : "light");
        root.classList.add(theme);
    }, [theme]);

    return (
        <header className="bg-blue-50 dark:bg-gray-800 border-b border-blue-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
                {/* Left Side: Logo and Title */}
                <div className="flex items-center space-x-4">
                    <img
                        src="/neova_solutions_logo.png"
                        alt="Neova Solutions Logo"
                        className="h-auto w-auto"
                    />
                </div>

                {/* Centered Title */}
                <div className="flex flex-col justify-center items-center py-1 px-4">
                    <h1 className="font-Roboto font-extrabold text-3xl text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-sky-500 to-teal-400 dark:from-blue-400 dark:via-cyan-400 dark:to-green-300 leading-snug text-center">
                        neoComplianceAgent
                    </h1>
                    <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 text-center max-w-xl">
                        An <span className="font-semibold text-blue-600 dark:text-blue-400">AI-Powered</span> Cloud Compliance Solution designed to automate, secure, and simplify cloud governance.
                    </p>
                </div>

                {/* Right Side: Header Buttons */}
                <div className="flex items-center space-x-2">
                    {/* Home Button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                                onClick={() => navigate("/dashboard")}
                            >
                                <Home className="h-6 w-6" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>Home</p>
                        </TooltipContent>
                    </Tooltip>

                    {/* Notifications */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                            >
                                <Bell className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-blue-100 dark:bg-gray-800">
                            <DropdownMenuItem>No new notifications</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Help */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                            >
                                <HelpCircle className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-blue-100 dark:bg-gray-800">
                            <DropdownMenuItem>
                                <a href="/guide.pdf" download className="w-full block">
                                    Documentation
                                </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigate("/support")}>
                                Support
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Settings */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:hover:bg-gray-700"
                            >
                                <Settings className="h-6 w-6" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-blue-100 dark:bg-gray-800">
                            <DropdownMenuItem onClick={() => setTheme("light")}>
                                Light Theme
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => setTheme("dark")}>
                                Dark Theme
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
};

export default Header;
