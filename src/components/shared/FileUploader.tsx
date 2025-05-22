"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud } from "lucide-react";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";

interface FileUploaderProps {
  onFileUpload: (file: File | null, dataUri: string | null) => void;
  id: string;
  label: string;
  accept?: string;
}

export default function FileUploader({ onFileUpload, id, label, accept = "image/*" }: FileUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setPreview(dataUri);
        onFileUpload(file, dataUri); // Pass both file and dataUri
      };
      reader.readAsDataURL(file);
    } else {
      setFileName(null);
      setPreview(null);
      onFileUpload(null, null); // Clear if no file
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-base font-medium">{label}</Label>
      <div className="flex items-center justify-center w-full">
          <label
              htmlFor={id}
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer bg-card hover:bg-muted border-border"
          >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {preview ? (
                    <div className="relative w-48 h-32 mb-2">
                       <Image src={preview} alt="Preview" layout="fill" objectFit="contain" className="rounded-md" data-ai-hint="uploaded image" />
                    </div>
                  ) : (
                    <UploadCloud className="w-10 h-10 mb-3 text-muted-foreground" />
                  )}
                  <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
                  {fileName && <p className="mt-2 text-xs text-foreground">{fileName}</p>}
              </div>
              <Input id={id} type="file" className="hidden" onChange={handleFileChange} accept={accept} />
          </label>
      </div>
    </div>
  );
}
