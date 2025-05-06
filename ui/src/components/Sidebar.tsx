import { useState } from "react";
import {
  Clock,
  ChevronRight,
  ChevronLeft,
  Home,
  Shield,
  BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";

interface SidebarProps {
  promptHistory: string[];
}

const Sidebar = ({ promptHistory }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className={cn(
        "border-r bg-blue-50 dark:bg-gray-800 dark:border-gray-700 transition-all duration-300 flex flex-col shadow-sm",
        collapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <TooltipProvider>
          <ul className="space-y-2">
            {[
              { icon: Home, label: "Home", href: "/" },
              { icon: BarChart, label: "Resources", href: "/resource-creation" },
              { icon: Shield, label: "Compliance", href: "/compliance" },
            ].map((item) => (
              <li key={item.label}>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "w-full justify-start text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md",
                        collapsed ? "px-2" : ""
                      )}
                      onClick={() => navigate(item.href)}
                    >
                      <item.icon
                        className={cn(
                          "h-6 w-6",
                          collapsed ? "mx-auto" : "mr-2",
                          window.location.pathname === item.href ? "text-blue-500 dark:text-blue-400" : ""
                        )}
                      />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </nav>

      {promptHistory.length > 0 && (
        <div
          className={cn(
            "border-t p-2 border-blue-200 dark:border-gray-700",
            collapsed ? "hidden" : "block"
          )}
        >
          <div className="flex items-center mb-2 text-blue-600 dark:text-blue-400">
            <Clock className="h-6 w-6 mr-2" />
            <span className="text-sm font-medium">Prompt History</span>
          </div>
          <ScrollArea className="h-[200px]">
            <ul className="space-y-1">
              {promptHistory.map((prompt, index) => (
                <li
                  key={index}
                  className="text-sm truncate p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-gray-700 rounded-md"
                >
                  {prompt}
                </li>
              ))}
            </ul>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Sidebar;