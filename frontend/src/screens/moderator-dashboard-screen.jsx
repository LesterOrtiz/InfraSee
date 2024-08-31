import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Overview } from "@/components/elements/overview";
import { Archives } from "@/components/elements/archives";
import { Reports } from "@/components/elements/reports";
import { useLogoutMutation } from "@/slices/users-api-slice";
import { logout } from "@/slices/auth-slice";

const ModeratorDashboardScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview"); // Manage active tab state
  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();

  // Handle the keyboard shortcut for logout
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "l") {
        event.preventDefault();
        handleLogout();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      console.log("Logging out...");
      await logoutApiCall().unwrap(); // Ensure API call completes
      dispatch(logout()); // Clear state
      console.log("Navigating to home page...");
      navigate("/", { replace: true }); // Redirect to home
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  


  // Function to change the tab
  const goToReportsTab = () => {
    setActiveTab("reports");
  };

  return (
    <div>
      <header className="w-full h-fit p-3 flex items-center justify-between border-b border-slate-400">
        <div className="w-[6rem] mt-1 cursor-pointer" onClick={handleLogoClick}>
          <img src="/infrasee_black.png" alt="Infrasee Logomark" />
        </div>
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-8 w-8 hover:ring-4 ring-slate-300 cursor-pointer">
                <AvatarFallback className="text-white bg-slate-950">
                  M
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 mr-3">
              {userInfo && (
                <DropdownMenuLabel>
                  <p>{userInfo.name}</p>
                  <small className="text-gray-500 font-normal">
                    {userInfo.email}
                  </small>
                </DropdownMenuLabel>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                  <DropdownMenuShortcut>⌘+L</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="p-4">
        <h1 className="text-3xl mb-1">Dashboard</h1>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex items-center justify-center flex-wrap gap-2 h-auto max-w-64">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="archives">Archives</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <Overview goToReportsTab={goToReportsTab} />{" "}
            {/* Pass function as prop */}
          </TabsContent>
          <TabsContent value="reports">
            <Reports />
          </TabsContent>
          <TabsContent value="archives">
            <Archives />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ModeratorDashboardScreen;
