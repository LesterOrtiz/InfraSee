import { DataTableColumnHeader } from "../DataTableColumnHeader";
import { ModHiddenDataTableRowActions } from "../ModHiddenDataTableRowActions";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
// Helper function to format date using date-fns
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "MMMM dd, yyyy hh:mm aa"); // Corrected to use 'mm' for minutes and 'ss' for seconds
};

export const columnsModHidden = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-0.5"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-0.5"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "report_by",
    title: "Reported By",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Reported By" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("report_by")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "report_desc",
    title: "Description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => <div className="">"{row.getValue("report_desc")}"</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "report_status",
    title: "Status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => (
      <Badge className="px-2" variant="default">
        {row.getValue("report_status")?.stat_name || "Unknown"}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue("report_status")?._id);
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "report_address",
    title: "Address",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Address" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("report_address")}</div>,
    enableSorting: true,
    enableHiding: true,
  },
  {
    accessorKey: "hidden_at",
    title: "Hidden On",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hidden On" />
    ),
    cell: ({ row }) => (
      <div className="">{formatDate(row.getValue("hidden_at"))}</div>
    ),
    filterFn: (row, id, value) => {
      const rowDate = new Date(row.getValue(id));
      const [startDate, endDate] = value;
      return rowDate >= startDate && rowDate <= endDate;
    },
    enableSorting: true,
    enableHiding: true,
  },
  {
    id: "actions",
    cell: ({ row }) => <ModHiddenDataTableRowActions row={row} />,
  },
];
