import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { DateTimePicker } from "./datetimepicker";

const fetchStatusOptions = async () => {
  try {
    const response = await axios.get("/api/status/");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch status options", error);
    toast.error("Failed to fetch status options.");
    return [];
  }
};

const baseSchema = z.object({
  status: z.string().min(1, "Status is required"),
  remarks: z
    .string()
    .min(1, "Remarks are required")
    .max(150, "Remarks must be at most 150 characters"),
});

const resolvedSchema = baseSchema.extend({
  report_time_resolved: z
    .string()
    .min(1, "Time resolved is required when status is 'Resolved'"),
});

const getSchema = (selectedStatus) => {
  return selectedStatus === "Resolved" ? resolvedSchema : baseSchema;
};

const remarkPlaceholders = {
  Unassigned: {
    Pending:
      "Your report was successfully marked 'Pending' after we verified and accepted your report.",
  },
  Pending: {
    "In Progress":
      "Repairs started [date/time] and might end [date/time]. Delays may happen.",
    Unassigned:
      "Enter more details as to why this report is being marked unassigned again.",
    Dismissed: "Enter the reasons as to why this report is being dismissed.",
  },
  "In Progress": {
    Pending: "Enter more details as to why this report was paused",
    Resolved: "Enter more details about this report's resolution",
  },
  Dismissed: {},
  Resolved: {},
  "Under Review": {},
};

export function UpdateStatusDialog({ isOpen, onClose, data }) {
  const { userInfo } = useSelector((state) => state.auth);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState(
    data?.report_status.stat_name || ""
  );
  const currentStatus = data?.report_status.stat_name || "";
  const [remarksLength, setRemarksLength] = useState(0);

  const methods = useForm({
    resolver: zodResolver(getSchema(selectedStatus)),
    defaultValues: {
      status: data?.report_status?._id || "",
      remarks: "",
      report_time_resolved: data?.report_time_resolved || "",
    },
  });

  const {
    handleSubmit,
    setValue,
    control,
    formState: { errors },
    watch,
  } = methods;

  if (isOpen && statusOptions.length === 0) {
    fetchStatusOptions().then(setStatusOptions);
  }

  useEffect(() => {
    if (data && data.report_status) {
      setValue("status", data.report_status._id);
      setSelectedStatus(data.report_status.stat_name);
    }
  }, [data, setValue]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (selectedStatus === "Resolved" && value.report_time_resolved) {
        methods.clearErrors("report_time_resolved");
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, selectedStatus, methods]);

  const onSubmit = async (formData) => {
    const reportId = data._id;

    // Check if the status has actually changed before submitting
    if (formData.status === data.report_status._id) {
      toast.error("You must change the status before submitting.");
      return; // Early return to prevent form submission
    }

    try {
      const schema = getSchema(formData.status);
      schema.parse(formData);

      // Validate the resolved time for "Resolved" status
      if (formData.status === "Resolved" && formData.report_time_resolved) {
        const submissionTime = new Date(data.createdAt);
        const resolvedTime = new Date(formData.report_time_resolved);

        const minResolvedTime = new Date(
          submissionTime.getTime() + 60 * 60 * 1000
        ); // 1 hour after submission

        // Check if resolved time is at least 1 hour after submission
        if (resolvedTime < minResolvedTime) {
          toast.error(
            "Resolution time must be at least 1 hour after submission."
          );
          return; // Prevent form submission
        }

        const currentTime = new Date();
        currentTime.setSeconds(0, 0); // Set to current time without seconds

        const endOfToday = new Date(currentTime);
        endOfToday.setHours(23, 59, 59, 999); // End of today

        // Check if the resolved time is in the past
        if (resolvedTime < currentTime) {
          toast.error("Resolution time cannot be in the past.");
          return; // Prevent form submission
        }

        // Check if the resolved time is after today
        if (resolvedTime > endOfToday) {
          toast.error("Resolution time cannot be after today.");
          return; // Prevent form submission
        }

        // Check if the resolved time is within the allowed range (after current time but before end of today)
        if (resolvedTime >= currentTime && resolvedTime <= endOfToday) {
          // Proceed with form submission (field value is valid)
          field.onChange(formData.report_time_resolved);
        }
      }

      // Proceed with the report status update if validation passed
      const response = await axios.put(`/api/reports/status/${reportId}`, {
        report_status: formData.status,
        status_remark: formData.remarks,
        report_time_resolved: formData.report_time_resolved,
        modID: userInfo._id,
      });

      console.log(response.data.message);
      toast.success("Report status updated successfully!");
      onClose();
    } catch (error) {
      if (error instanceof z.ZodError) {
        methods.clearErrors();
        error.errors.forEach((err) => {
          methods.setError(err.path[0], {
            type: "manual",
            message: err.message,
          });
        });
      } else {
        console.error("Error updating report status:", error);
        toast.error("Error updating report status.");
      }
    }
  };

  const getAllowedStatusOptions = () => {
    const restrictedStatuses = {
      Pending: ["In Progress", "Dismissed", "Unassigned"],
      "In Progress": ["Resolved", "Pending"],
      "For Revision": ["Resolved"],
      Dismissed: [],
      Resolved: [],
      "Under Review": [],
    };

    const allowed = restrictedStatuses[currentStatus] || [];
    const currentStatusOption = statusOptions.find(
      (option) => option.stat_name === currentStatus
    );

    const filteredOptions = allowed
      .map((statName) =>
        statusOptions.find((option) => option.stat_name === statName)
      )
      .filter(Boolean);

    // Include the current status in the options
    if (currentStatusOption && !filteredOptions.includes(currentStatusOption)) {
      filteredOptions.push(currentStatusOption);
    }

    return filteredOptions;
  };

  const allowedStatusOptions = getAllowedStatusOptions();

  // Get the appropriate placeholder for the remarks field
  const getRemarkPlaceholder = () => {
    const placeholderMap = remarkPlaceholders[currentStatus] || {};
    return (
      placeholderMap[selectedStatus] ||
      "Enter more detailed info on the status update. Maximum of 150 characters."
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Report Status</DialogTitle>
          <DialogDescription>
            Update the reporter's report status here. An SMS notification is
            sent to their contact number immediately.
          </DialogDescription>
          {data ? (
            <div className="w-full pt-2">
              <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} className="w-full">
                  <label
                    htmlFor="status"
                    className="hidden text-sm font-medium text-gray-700"
                  >
                    Update Status
                  </label>
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          const selectedOption = statusOptions.find(
                            (option) => option._id === value
                          );
                          setSelectedStatus(
                            selectedOption ? selectedOption.stat_name : ""
                          );
                        }}
                        value={field.value}
                        className="w-full"
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Status Options</SelectLabel>
                            {allowedStatusOptions.map((option) => (
                              <SelectItem key={option._id} value={option._id}>
                                {option.stat_name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  {[
                    "Dismissed",
                    "Resolved",
                    "Under Review",
                    "For Revision",
                  ].includes(currentStatus) ? (
                    <p className="mt-2 text-muted-foreground text-sm">
                      {currentStatus === "Dismissed" &&
                        `This report was dismissed. Remarks: "${data.status_remark}"`}
                      {currentStatus === "Resolved" &&
                        "This report is already resolved."}
                      {currentStatus === "Under Review" &&
                        "This report is being reviewed by your submoderator, no action can be taken yet."}
                      {currentStatus === "For Revision" &&
                        "This report's resolution was rejected and is currently up for revision."}
                    </p>
                  ) : (
                    <>
                      <FormItem>
                        <FormLabel className="font-bold">Remarks</FormLabel>
                        <Controller
                          name="remarks"
                          control={control}
                          render={({ field }) => (
                            <Textarea
                              {...field}
                              id="remarks"
                              placeholder={getRemarkPlaceholder()}
                              className="mt-1"
                              rows="3"
                              maxLength={150} // Set a max length limit for remarks
                              onChange={(e) => {
                                setRemarksLength(e.target.value.length); // Update the length
                                field.onChange(e); // Keep the form state updated
                              }}
                            />
                          )}
                        />
                        {errors.remarks && (
                          <FormMessage>{errors.remarks.message}</FormMessage>
                        )}
                      </FormItem>

                      <div className="flex justify-between text-xs font-normal text-muted-foreground mt-1">
                        {remarksLength} / 150 {/* Display the current length */}
                      </div>

                      {selectedStatus === "Resolved" && (
                        <FormItem>
                          <FormLabel className="font-bold">
                            Time Resolved
                          </FormLabel>
                          <Controller
                            name="report_time_resolved"
                            control={control}
                            render={({ field }) => (
                              <DateTimePicker
                                value={field.value} // Directly use field.value
                                onChange={(value) => {
                                  field.onChange(value); // Directly call field.onChange
                                }}
                              />
                            )}
                          />

                          {errors.report_time_resolved && (
                            <FormMessage>
                              {errors.report_time_resolved.message}
                            </FormMessage>
                          )}
                        </FormItem>
                      )}
                    </>
                  )}

                  <Button
                    type="submit"
                    className="mt-4 w-full"
                    disabled={[
                      "Dismissed",
                      "Resolved",
                      "Under Review",
                      "For Revision",
                    ].includes(currentStatus)}
                  >
                    Update Status
                  </Button>
                </form>
              </FormProvider>
            </div>
          ) : (
            <p>No data available.</p>
          )}
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
