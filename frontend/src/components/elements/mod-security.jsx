import React, { useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { useLogoutMutation } from "@/slices/users-api-slice";
import { logout } from "@/slices/auth-slice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form"; // Adjust path as necessary
import { useChangePasswordMutation } from "@/slices/users-api-slice";

// Validation schema
const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long.")
      .regex(/[A-Z]/, {
        message: "Password must contain at least one uppercase letter.",
      })
      .regex(/[a-z]/, {
        message: "Password must contain at least one lowercase letter.",
      })
      .regex(/\d/, { message: "Password must contain at least one number." })
      .regex(/[\W_]/, {
        message: "Password must contain at least one special character.",
      }),
    confirmPassword: z
      .string()
      .min(8, "Confirmation password must be at least 8 characters long."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export function ModSecurity() {
  const methods = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  const [logoutApiCall] = useLogoutMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;
  const [changePassword, { isLoading, isError, error }] =
    useChangePasswordMutation();
  const [newPasswordVisible, setNewPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [currentPasswordVisible, setCurrentPasswordVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate("/moderator/login");
    } catch (err) {
      console.log(err);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Attempt to change the password
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap();
  
      // Notify the user of success and reset the form
      toast.success("Password updated successfully!");
      reset();
  
      // Initiate the logout countdown
      startLogoutCountdown(3);
  
    } catch (error) {
      console.error("Error updating password:", error);
      handleError(error);
    }
  };
  
  // Function to handle logout countdown
  const startLogoutCountdown = (seconds) => {
    let countdown = seconds;
  
    const countdownInterval = setInterval(() => {
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        toast.dismiss();
        toast.info("You have been logged out to apply changes.");
        handleLogout(); 
      } else {
        toast.dismiss(); 
        toast(`Logging out in ${countdown} seconds to apply changes.`);
        countdown -= 1;
      }
    }, 1000);
  };
  
  // Function to handle error messages
  const handleError = (error) => {
    if (error.status === 400) {
      toast.error(error.data.message || "Current password is incorrect.");
    } else if (error.status === 404) {
      toast.error("User not found.");
    } else {
      toast.error("Failed to update password.");
    }
  };
  

  return (
    <FormProvider {...methods}>
      <div className="">
        <h1 className="text-xl font-bold mb-2">Security</h1>
        <p className="text-gray-500 text-sm mb-4">Change your password.</p>
        <hr className="mb-4" />

        <Form {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 md:w-1/2 w-full"
          >
            <FormField
              control={control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="font-bold">
                      Current Password
                    </FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={currentPasswordVisible ? "text" : "password"}
                        placeholder="Enter current password"
                        autoComplete="current-password"
                        {...field}
                        className="pr-10" // Padding to accommodate eye icon
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setCurrentPasswordVisible(!currentPasswordVisible)
                        }
                        className="absolute inset-y-0 right-3 flex items-center text-sm"
                      >
                        {currentPasswordVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="newPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="font-bold">New Password</FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={newPasswordVisible ? "text" : "password"}
                        placeholder="Enter new password"
                        autoComplete="new-password"
                        {...field}
                        className="pr-10" // Padding to accommodate eye icon
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setNewPasswordVisible(!newPasswordVisible)
                        }
                        className="absolute inset-y-0 right-3 flex items-center text-sm"
                      >
                        {newPasswordVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-center">
                    <FormLabel className="font-bold">
                      Confirm Password
                    </FormLabel>
                    <FormMessage />
                  </div>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={confirmPasswordVisible ? "text" : "password"}
                        placeholder="Confirm new password"
                        autoComplete="confirm-password"
                        {...field}
                        className="pr-10" // Padding to accommodate eye icon
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmPasswordVisible(!confirmPasswordVisible)
                        }
                        className="absolute inset-y-0 right-3 flex items-center text-sm"
                      >
                        {confirmPasswordVisible ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full mt-4" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </Form>
      </div>
    </FormProvider>
  );
}
