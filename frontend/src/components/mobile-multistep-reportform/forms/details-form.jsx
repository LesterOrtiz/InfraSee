import React, { useState } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

const DetailsForm = ({ onClose, imagePreview, setImagePreview }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    trigger,
  } = useFormContext();
  
  const [descriptionLength, setDescriptionLength] = useState(0);

  const onDrop = async (acceptedFiles) => {
    const file = acceptedFiles[0];

    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        console.error("File size exceeds the limit of 2 MB.");
        return;
      }
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        console.error("Only JPG and PNG files are allowed.");
        return;
      }

      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      setValue("file", file); // Keep the file instance

      await trigger("file");

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "Infrasee");

      try {
        const response = await fetch(
          `https://api.cloudinary.com/v1_1/dqiqcbog4/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await response.json();
        if (data.secure_url) {
          setValue("fileUrl", data.secure_url); // Store the uploaded URL in the form
        } else {
          throw new Error("Upload failed");
        }
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [] },
  });

  return (
    <form
      onSubmit={handleSubmit(onClose)}
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full"
    >
      {/* File Upload Field */}
      <div className="flex flex-col h-full">
        <FormItem className="flex-grow">
          <FormLabel className="font-bold hidden">Upload File</FormLabel>
          <FormControl>
            <div
              {...getRootProps({
                className:
                  "dropzone border-dashed border-2 border-gray-300 p-4 text-center relative rounded-md h-full flex flex-col justify-center items-center",
              })}
            >
              <input {...getInputProps()} />
              <CloudUpload className="w-12 h-12 text-gray-400 mb-2" />
              <p className="text-muted-foreground text-xs font-normal">
                Drag & drop some files here, or click to select files (Max 2 MB)
              </p>
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="absolute inset-0 w-full h-full object-cover rounded-md"
                />
              )}
              {errors.file && <FormMessage>{errors.file.message}</FormMessage>}
            </div>
          </FormControl>
        </FormItem>
      </div>

      {/* Other Fields */}
      <div className="flex flex-col h-full">
        {/* Full Name Field */}
        <FormItem className="flex-grow">
          <FormLabel className="font-bold">Full Name</FormLabel>
          <FormControl>
            <Controller
              name="fullName"
              control={control}
              render={({ field }) => (
                <Input type="text" placeholder="Enter your name" {...field} />
              )}
            />
          </FormControl>
          {errors.fullName && (
            <FormMessage>{errors.fullName.message}</FormMessage>
          )}
        </FormItem>

        {/* Contact Number Field */}
        <FormItem className="flex-grow">
          <FormLabel className="font-bold">Contact Number</FormLabel>
          <FormControl>
            <Controller
              name="contactNumber"
              control={control}
              render={({ field }) => (
                <Input
                  type="text"
                  placeholder="Enter contact number"
                  {...field}
                />
              )}
            />
          </FormControl>
          {errors.contactNumber && (
            <FormMessage>{errors.contactNumber.message}</FormMessage>
          )}
        </FormItem>

        {/* Description Field */}
        <FormItem className="flex-grow">
          <FormLabel className="font-bold">Description</FormLabel>
          <FormControl>
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <Textarea
                  placeholder="Enter more details about the report. (Extra details based on landmark, description of the damage, etc.)"
                  minLength={25}
                  maxLength={150}
                  {...field}
                  onChange={(e) => {
                    setDescriptionLength(e.target.value.length);
                    field.onChange(e);
                  }}
                />
              )}
            />
          </FormControl>
          <div className="flex justify-between text-xs font-normal text-muted-foreground mt-1">
            {errors.description && (
              <FormMessage>{errors.description.message}</FormMessage>
            )}
            {descriptionLength} / 150
          </div>
        </FormItem>
      </div>
    </form>
  );
};

export default DetailsForm;
