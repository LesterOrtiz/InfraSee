import { DataTableColumnHeader } from "../DataTableColumnHeader";
import { ModReportDataTableRowActions } from "../ModReportDataTableRowActions";
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
// Helper function to format date using date-fns
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return format(date, "MMMM dd, yyyy"); // Corrected to use 'mm' for minutes and 'ss' for seconds
};

export const columnsModReports = [
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
    accessorKey: "is_new",
    title: "",
    header: ({ column }) => <DataTableColumnHeader column={column} title="" />,
    cell: ({ row }) => (
      <div className="whitespace-nowrap">
        {row.getValue("is_new") ? (
          <Badge variant="outline" className="w-full rounded-md border-muted-foreground/20 text-muted-foreground">
            Unread
          </Badge>
        ) : (
          <Badge variant="outline" className="w-full rounded-md border-muted-foreground/20 text-muted-foreground">
            Read
          </Badge>
        )}
      </div>
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
      <>
      <DataTableColumnHeader column={column} title="Status" />
      </>
    ),
    cell: ({ row }) => (
      <Badge className="px-2" variant="default">
        {row.getValue("report_status")?.stat_name || "Unknown"}
      </Badge>
    ),
    filterFn: (row, id, value) => {
      console.log(id)
      return value.includes(row.getValue(id));
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
    accessorKey: "createdAt",
    title: "Created On",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Created On" />
    ),
    cell: ({ row }) => (
      <div className="">{formatDate(row.getValue("createdAt"))}</div>
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
    cell: ({ row }) => <ModReportDataTableRowActions row={row} />,
  },
];
