import React, { useState, useEffect } from "react";
import axios from "axios";
import { Cross2Icon } from "@radix-ui/react-icons";
import {
  TrashIcon,
  Plus,
  Download,
  ArchiveIcon,
  ArchiveRestore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { RegisterForm } from "@/components/elements/register-form";
import { CalendarDatePicker } from "../elements/calendar-date-picker";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";

export function DataTableToolbar({ table, activeTab }) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [dateRange, setDateRange] = useState({
    from: new Date(new Date().getFullYear(), 0, 1),
    to: new Date(),
  });

  const [filterOptions, setFilterOptions] = useState({
    infraType: [],
    reportMod: [],
    reportStatus: [],
  });

  const handleDateSelect = ({ from, to }) => {
    setDateRange({ from, to });
    table.getColumn("createdAt")?.setFilterValue([from, to]);
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const [infraTypeResponse, reportModResponse, reportStatusResponse] =
          await Promise.all([
            axios.get("/api/infrastructure-types"),
            axios.get("/api/users/moderators"),
            axios.get("/api/status"),
          ]);

        setFilterOptions({
          infraType: infraTypeResponse.data.map((type) => ({
            label: type.infra_name,
            value: type.infra_name,
          })),
          reportMod: reportModResponse.data.map((mod) => ({
            label: mod.name,
            value: mod.name,
          })),
          reportStatus: reportStatusResponse.data.map((status) => ({
            label: status.stat_name,
            value: status.stat_name,
          })),
        });
      } catch (error) {
        console.error("Error fetching filter options:", error);
      }
    };

    fetchFilterOptions();
  }, []);

  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-2 gap-y-2">
        <div className="col-span-1 flex gap-x-2">
          {/* MODERATOR SEARCH */}
          {table.getColumn("report_by") && (
            <Input
              placeholder="Search reporter name..."
              value={table.getColumn("report_by")?.getFilterValue() ?? ""}
              className="h-9"
              onChange={(event) => {
                table.getColumn("report_by")?.setFilterValue(event.target.value);
              }}
            />
          )}
          {/* ADMIN SEARCH */}
          {table.getColumn("name") && (
            <Input
              placeholder="Search moderator name..."
              value={table.getColumn("name")?.getFilterValue() ?? ""}
              className="h-9"
              onChange={(event) => {
                table.getColumn("name")?.setFilterValue(event.target.value);
              }}
            />
          )}
          {/* DESKTOP VIEW/DOWNLOAD */}
          <div className="flex gap-2 sm:hidden">
            <DataTableViewOptions table={table} />
            <Button size="filter" className="flex gap-2">
              <Download size={15} />
              <p className="hidden md:block">CSV</p>
            </Button>
          </div>
        </div>
        <div className="col-span-1">
          {/* Calendar Picker */}
          <CalendarDatePicker
            date={dateRange}
            onDateSelect={handleDateSelect}
            variant="outline"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-y-2">
        <div className="col-span-1 flex items-center justify-between">
          {/* FACETED FILTERS */}
          <div className="flex items-center">
            {table.getColumn("report_by") && !table.getColumn("report_mod") && (
              <DataTableFacetedFilter
                column={table.getColumn("report_status")}
                title="Status"
                options={filterOptions.reportStatus}
              />
            )}
            {table.getColumn("infra_type") && (
              <DataTableFacetedFilter
                column={table.getColumn("infra_type")}
                title="Infrastructure Type"
                options={filterOptions.infraType}
              />
            )}
            {table.getColumn("report_mod") && (
              <div className="flex gap-x-2">
                <DataTableFacetedFilter
                  column={table.getColumn("report_mod")}
                  title="Moderator"
                  options={filterOptions.reportMod}
                />
                <DataTableFacetedFilter
                  column={table.getColumn("report_status")}
                  title="Status"
                  options={filterOptions.reportStatus}
                />
              </div>
            )}
            {/* RESET BUTTON */}
            {isFiltered && (
              <Button
                variant="ghost"
                onClick={() => table.resetColumnFilters()}
                className="h-9 px-2 lg:px-3"
              >
                Reset
                <Cross2Icon className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
          {/* VIEW OPTIONS, MULTISELECT ACTIONS */}
          <div className="flex gap-x-2">
            {/* DESKTOP VIEW/DOWNLOAD */}
            <div className="hidden gap-2 sm:flex">
              <DataTableViewOptions table={table} />
              <Button size="filter" className="flex gap-2">
                <Download size={15} />
                <p className="hidden md:block">CSV</p>
              </Button>
            </div>
            <div className="flex gap-x-2">
              {/* ADMIN MULTI DELETE */}
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                activeTab === undefined && (
                  <Button
                    variant="outline"
                    size="filter"
                    className="flex gap-2"
                  >
                    <TrashIcon size={15} aria-hidden="true" />
                    <p className="hidden md:block">Delete</p>(
                    {table.getFilteredSelectedRowModel().rows.length})
                  </Button>
                )}
              {/* MOD MULTI ACTION */}
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                activeTab === "archives" && (
                  <Button
                    variant="outline"
                    size="filter"
                    className="flex gap-2"
                  >
                    <TrashIcon size={15} aria-hidden="true" />
                    <p className="hidden md:block">Delete</p>(
                    {table.getFilteredSelectedRowModel().rows.length})
                  </Button>
                )}
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                activeTab === "archives" && (
                  <Button variant="outline" size="sm">
                    <ArchiveRestore
                      className="mr-2 h-4 w-4"
                      aria-hidden="true"
                    />
                    <p className="hidden md:block">Restore</p>(
                    {table.getFilteredSelectedRowModel().rows.length})
                  </Button>
                )}
              {table.getFilteredSelectedRowModel().rows.length > 0 &&
                activeTab === "reports" && (
                  <Button variant="outline" size="sm">
                    <ArchiveIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                    <p className="hidden md:block">Archive</p>(
                    {table.getFilteredSelectedRowModel().rows.length})
                  </Button>
                )}
              {/* ADD BUTTON HERE */}
              {table.getColumn("infra_type") && activeTab === undefined && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="filter" className="flex gap-2">
                      <Plus size={15} />
                      <p className="hidden md:block">Add Moderator</p>
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Moderator</DialogTitle>
                      <DialogDescription>
                        Please fill in the details below.
                      </DialogDescription>
                    </DialogHeader>
                    <RegisterForm onClose={() => setIsDialogOpen(false)} />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
