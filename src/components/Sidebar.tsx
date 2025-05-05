import { useState } from "react";
import { Clock, ChevronRight, ChevronLeft, Home, Shield, BarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom"; // Import useNavigate

interface SidebarProps {
  promptHistory: string[];
}

const Sidebar = ({ promptHistory }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate(); // Initialize navigate

  return (
    <div
      className={cn(
        "border-r border-gray-200 bg-gray-50 transition-all duration-300 flex flex-col",
        collapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      <div className="p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed && <span className="ml-2">Collapse</span>}
        </Button>
      </div>

      <nav className="flex-1 p-2">
        <TooltipProvider>
          <ul className="space-y-2">
            {[
              { icon: Home, label: "Home", href: "/" }, // Link Home button to '/'
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
                        "w-full justify-start",
                        collapsed ? "px-2" : ""
                      )}
                      onClick={() => navigate(item.href)} // Navigate on click
                    >
                      <item.icon className={cn("h-4 w-4", collapsed ? "mx-auto" : "mr-2")} />
                      {!collapsed && <span>{item.label}</span>}
                    </Button>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
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
            "border-t border-gray-200 p-2",
            collapsed ? "hidden" : "block"
          )}
        >
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">Prompt History</span>
          </div>
          <ScrollArea className="h-[200px]">
            <ul className="space-y-1">
              {promptHistory.map((prompt, index) => (
                <li key={index} className="text-sm truncate p-1 hover:bg-gray-100 rounded">
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
