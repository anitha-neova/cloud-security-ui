import React, { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, FileText, LifeBuoy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/context/ProgressContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface SidebarProps {
  promptHistory: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ promptHistory }) => {
  const navigate = useNavigate();
  const { setCloudConnected, setResourceCreated, setComplianceChecked, setTerraformCode, setStep } = useProgress();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleLogout = () => {
    setCloudConnected(false);
    setResourceCreated(false);
    setComplianceChecked(false);
    setTerraformCode("");
    setStep(0);
    navigate("/logout", { replace: true });
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    setIsDialogOpen(false);
  };

  const navigation = [
    { name: "Home", href: "/", icon: Home },
    { name: "Report", href: "/reports", icon: FileText },
    { name: "Support", href: "/support", icon: LifeBuoy },
  ];

  return (
      <aside className="w-64 bg-blue-50 dark:bg-gray-800 border-r border-blue-200 dark:border-gray-700 p-6 flex flex-col h-screen">
        <div className="flex-1">
          <nav className="space-y-2">
            {navigation.map((item) => (
                <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                        `flex items-center gap-3 p-3 rounded-lg text-sm font-medium transition-colors ${
                            isActive
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-gray-700"
                        }`
                    }
                >
                  <item.icon className="w-5 h-5" />
                  {item.name}
                </NavLink>
            ))}
          </nav>
          <div className="mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-blue-500 dark:text-blue-400 border-blue-500 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-blue-50 dark:bg-gray-800 rounded-xl border-blue-200 dark:border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-gray-800 dark:text-white">
                    Are you sure you want to logout?
                  </DialogTitle>
                  <DialogDescription className="text-sm text-gray-600 dark:text-gray-400">
                    This will end your session.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button
                        variant="outline"
                        className="border-blue-500 text-blue-500 hover:bg-blue-100 dark:border-blue-400 dark:text-blue-400 dark:hover:bg-gray-700 rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                      onClick={handleLogout}
                      className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm py-1 transition-all duration-200 hover:scale-105"
                  >
                    Yes, Logout
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        {promptHistory.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-white">Prompt History</h3>
              <ul className="mt-2 space-y-2">
                {promptHistory.map((prompt, index) => (
                    <li key={index} className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {prompt}
                    </li>
                ))}
              </ul>
            </div>
        )}
      </aside>
  );
};

export default Sidebar;