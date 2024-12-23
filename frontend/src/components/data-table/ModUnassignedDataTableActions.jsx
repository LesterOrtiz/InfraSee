"use client";
import axios from "axios";
import { useState } from "react";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ReportDetailsDialog } from "../elements/report-details-modal";
import { LucideGalleryVerticalEnd, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export function ModUnassignedDataTableRowActions({ row }) {
  const [dialogData, setDialogData] = useState(null);
  const [isShowDetailsDialogOpen, setShowDetailsDialogOpen] = useState(false);

  const handleShowDetails = () => {
    setDialogData(row.original);
    setShowDetailsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setShowDetailsDialogOpen(false)
  };
  
  const handleMarkAsRead = async () => {
    const reportId = row.original._id;
    try {
      const response = await axios.put(`/api/reports/read/${reportId}`);
      toast.success(response.data.message || "Report marked as read!");
    } catch (error) {
      console.error("Error marking report as read:", error);
      toast.error(error.response?.data?.message || "Failed to mark as read.");
    }
  };
  
  const handleMarkAsUnread = async () => {
    const reportId = row.original._id;
    try {
      const response = await axios.put(`/api/reports/unread/${reportId}`);
      toast.success(response.data.message || "Report marked as unread!");
    } catch (error) {
      console.error("Error marking report as unread:", error);
      toast.error(error.response?.data?.message || "Failed to mark as unread.");
    }
  };
  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
        {row.original.is_new ? (
            <DropdownMenuItem onClick={handleMarkAsRead} className="flex gap-2">
              <Eye size={14} className="text-muted-foreground" />
              Mark as Read
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={handleMarkAsUnread}
              className="flex gap-2"
            >
              <EyeOff size={14} className="text-muted-foreground" />
              Mark as Unread
            </DropdownMenuItem>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleShowDetails} className="flex gap-2">
            <LucideGalleryVerticalEnd
              size={14}
              className="text-muted-foreground"
            />
            Show Details
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDetailsDialog
        isOpen={isShowDetailsDialogOpen}
        onClose={handleCloseDialog}
        data={dialogData}
      />
    </>
  );
}
