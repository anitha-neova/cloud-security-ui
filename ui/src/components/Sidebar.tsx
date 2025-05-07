import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Cloud, FileText, LifeBuoy, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProgress } from "@/context/ProgressContext";

interface SidebarProps {
  promptHistory: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ promptHistory }) => {
  const navigate = useNavigate();
  const { setCloudConnected, setResourceCreated, setComplianceChecked, setTerraformCode, setStep } = useProgress();

  const handleLogout = () => {
    setCloudConnected(false);
    setResourceCreated(false);
    setComplianceChecked(false);
    setTerraformCode("");
    setStep(0);
    navigate("/login");
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
        </div>
        <div className="mt-auto">
          <Button
              variant="outline"
              className="w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-blue-500 dark:text-blue-400 border-blue-500 dark:border-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
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