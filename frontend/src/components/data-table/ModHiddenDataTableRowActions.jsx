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
import { ConfirmDeleteDialog } from "../elements/delete-confirm-modal";
import { ConfirmRestoreDialog } from "../elements/restore-confirm-modal";
import { EyeIcon, ArchiveRestore, Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ModHiddenDataTableRowActions({ row }) {
  const [isShowDetailsDialogOpen, setShowDetailsDialogOpen] = useState(false);
  const [isRestoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleShowDetails = () => {
    setDialogData(row.original);
    setShowDetailsDialogOpen(true);
  };

  const handleRestore = async () => {
    const reportId = row.original._id;
    try {
      const response = await axios.put(`/api/reports/restore/${reportId}`);
      console.log(response.data.message);
      toast.success("Report unhid successfully!"); // Add success toast
      setRestoreDialogOpen(false);
    } catch (error) {
      console.error("Error unhiding report:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to unhide report."
      );
      toast.error("Error unhiding report."); // Add error toast
    }
  };

  const handleDelete = async () => {
    const reportId = row.original._id;
    try {
      const response = await axios.delete(`/api/reports/delete/${reportId}`);
      console.log(response.data.message);
      toast.success("Report deleted successfully!"); // Add success toast
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting report:", error);
      setErrorMessage(
        error.response?.data?.message || "Failed to delete report."
      );
      toast.error("Error deleting report."); // Add error toast
    }
  };

  const handleCloseDialog = () => {
    setShowDetailsDialogOpen(false);
    setRestoreDialogOpen(false);
    setDeleteDialogOpen(false);
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
          <DropdownMenuItem onClick={handleShowDetails} className="flex gap-2">
            <EyeIcon size={14} className="text-muted-foreground" />
            Show Details
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setRestoreDialogOpen(true)}
            className="flex gap-2"
          >
            <ArchiveRestore size={14} className="text-muted-foreground" />
            Restore
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>

      <ReportDetailsDialog
        isOpen={isShowDetailsDialogOpen}
        onClose={handleCloseDialog}
        data={dialogData}
      />
      <ConfirmRestoreDialog
        isOpen={isRestoreDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleRestore}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCloseDialog}
        onConfirm={handleDelete}
      />
    </>
  );
}
