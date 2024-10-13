import React, { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { Settings, LogOut, RefreshCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDispatch, useSelector } from "react-redux";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Overview } from "@/components/elements/overview";
import { Archives } from "@/components/elements/archives";
import { Reports } from "@/components/elements/reports";
import Analytics from "@/components/elements/analytics";
import { useLogoutMutation } from "@/slices/users-api-slice";
import { logout } from "@/slices/auth-slice";
import { Helmet, HelmetProvider } from "react-helmet-async";
import axios from "axios";
import { columnsModReports } from "@/components/data-table/columns/columnsModReports";
import { columnsModArchives } from "@/components/data-table/columns/columnsModArchives";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/elements/skeletontable";
const fetchReports = async () => {
  const response = await axios.get("/api/reports/moderator/reports");
  return response.data;
};

const fetchArchives = async () => {
  const response = await axios.get("/api/reports/moderator/archived/reports");
  return response.data;
};

const ModeratorDashboardScreen = () => {
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("overview");
  const [reports, setReports] = useState([]);
  const [archives, setArchives] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingArchives, setLoadingArchives] = useState(true);
  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();

  // Fetch data
  const loadReports = async () => {
    setLoadingReports(true);
    try {
      const data = await fetchReports();
      setReports(data);
      console.log(reports);
    } catch (error) {
      console.error("Failed to fetch reports", error);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadArchives = async () => {
    setLoadingArchives(true);
    try {
      const data = await fetchArchives();
      setArchives(data);
    } catch (error) {
      console.error("Failed to fetch archives", error);
    } finally {
      setLoadingArchives(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadReports();
    loadArchives();
  }, []);

  const handleLogoClick = () => {
    navigate("/");
  };

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/moderator/login");
    } catch (err) {
      console.log(err);
    }
  };

  const goToUnassignedTab = () => {
    setActiveTab("unassigned");
  };

  console.log(reports);
  return (
    <HelmetProvider>
      <div>
        <Helmet>
          <title>{"InfraSee | Moderator Dashboard"}</title>
        </Helmet>
        <header className="w-full h-fit p-3 flex items-center justify-between border-b border-slate-400">
          <div
            className="w-[6rem] mt-1 cursor-pointer"
            onClick={handleLogoClick}
          >
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
                    <Settings className="mr-2 h-4 w-4 text-slate-950" />
                    <span>Go to Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4 text-slate-950" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="p-4">
          <h1 className="text-3xl mb-1">Dashboard</h1>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center gap-2">
              <TabsList className="h-auto">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
                {/* Change archive to hidden */}
                <TabsTrigger value="archives">Hidden Reports</TabsTrigger>
                {/* <TabsTrigger value="analytics">Analytics</TabsTrigger> */}
              </TabsList>
              {/* Refresh Icon */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="filter"
                      onClick={() => {
                        loadReports();
                        loadArchives();
                      }}
                    >
                      <RefreshCcw size={15} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Refresh</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            {/* Overview Tab */}
            <TabsContent value="overview" className="h-[calc(100vh-11rem)]">
              {loadingReports ? (
                <div className="flex justify-center items-center h-full">
                  <Spinner size="large" />
                </div>
              ) : (
                <Overview
                  goToUnassignedTab={goToUnassignedTab}
                  dataReports={reports}
                  unassignedData={reports.filter(
                    (report) => report.report_status.stat_name === "Unassigned"
                  )}
                  userInfo={userInfo}
                />
              )}
            </TabsContent>
            <TabsContent value="unassigned" className="h-[calc(100vh-11rem)]">
              {loadingReports ? (
                <SkeletonTable columns={columnsModReports} /> // Use the SkeletonTable here
              ) : (
                <Reports
                  data={reports.filter(
                    (report) => report.report_status.stat_name === "Unassigned"
                  )}
                  columns={columnsModReports}
                  activeTab={activeTab}
                />
              )}
            </TabsContent>
            <TabsContent value="reports" className="h-[calc(100vh-11rem)]">
              {loadingReports ? (
                <SkeletonTable columns={columnsModReports} /> // Use the SkeletonTable here
              ) : (
                <Reports
                  data={reports.filter(
                    (report) => report.report_status.stat_name !== "Unassigned"
                  )}
                  columns={columnsModReports}
                  activeTab={activeTab}
                />
              )}
            </TabsContent>
            <TabsContent value="archives" className="h-[calc(100vh-11rem)]">
              {loadingArchives ? (
                <SkeletonTable columns={columnsModArchives} /> // Use the SkeletonTable here
              ) : (
                <Archives
                  data={archives}
                  columns={columnsModArchives}
                  activeTab={activeTab}
                />
              )}
            </TabsContent>
            {/* Analytics Tab */}
            <TabsContent value="analytics" className="h-[calc(100vh-11rem)]">
              <Analytics />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </HelmetProvider>
  );
};

export default ModeratorDashboardScreen;
