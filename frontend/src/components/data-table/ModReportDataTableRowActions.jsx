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
import { UpdateStatusDialog } from "../elements/update-status-modal";
import { ConfirmArchiveDialog } from "../elements/archive-confirm-modal";
import { EyeIcon, ArchiveIcon, Edit } from "lucide-react";
import { toast } from 'sonner';

export function ModReportDataTableRowActions({ row }) {
  const [isShowDetailsDialogOpen, setShowDetailsDialogOpen] = useState(false);
  const [isUpdateStatusDialogOpen, setUpdateStatusDialogOpen] = useState(false);
  const [isArchiveDialogOpen, setArchiveDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const [newStatus, setNewStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleShowDetails = () => {
    setDialogData(row.original);
    setShowDetailsDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    setDialogData(row.original);
    setUpdateStatusDialogOpen(true);
  };

  const handleArchive = async () => {
    const reportId = row.original._id;
    try {
      const response = await axios.put(`/api/reports/archive/${reportId}`);
      console.log(response.data.message);
      toast.success("Report archived successfully!");
      setArchiveDialogOpen(false);
    } catch (error) {
      console.error("Error archiving report:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to archive report."
      );
      toast.error("Failed to archive report.");
    }
  };

  const handleCloseDialog = () => {
    setShowDetailsDialogOpen(false);
    setUpdateStatusDialogOpen(false);
    setArchiveDialogOpen(false);
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
          <DropdownMenuItem onClick={handleUpdateStatus} className="flex gap-2">
            <Edit size={14} />
            Update Status
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleShowDetails} className="flex gap-2">
            <EyeIcon size={14} />
            Show Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-yellow-500 flex gap-2"
            onClick={() => setArchiveDialogOpen(true)}
          >
            <ArchiveIcon size={14} />
            Hide
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDetailsDialog
        isOpen={isShowDetailsDialogOpen}
        onClose={handleCloseDialog}
        data={dialogData}
      />
      <UpdateStatusDialog
        isOpen={isUpdateStatusDialogOpen}
        onConfirm={handleUpdateStatus} 
        onClose={handleCloseDialog}
        data={dialogData}
        setNewStatus={setNewStatus}
      />
      <ConfirmArchiveDialog
        isOpen={isArchiveDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleArchive}
      />
    </>
  );
}
