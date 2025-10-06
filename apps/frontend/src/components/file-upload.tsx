import { useState } from "react";
import { useUserStore } from "../stores/userStore"

export type UploadType = "profile";

const BUCKETS: Record<UploadType, string> = {
  profile: "profile-pictures",
};

interface FileUploadProps {
  onUpload?: (url: string) => void;
  uploadType: UploadType;
}

export function FileUpload({ onUpload, uploadType }: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    setError(null);

    setUploading(true);
    const fileExt = uploadedFile.name.split('.').pop();
    const fileName = `${useUserStore.getState().userId}-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${fileExt}`;
    const filePath = fileName;

    const bucket = BUCKETS[uploadType];

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, uploadedFile);

    if (uploadError) {
      setError("Upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (publicUrlData?.publicUrl) {
      if (onUpload) onUpload(publicUrlData.publicUrl);
    } else {
      setError("Failed to get public URL");
    }
    setUploading(false);
  };

  return (
    <div className="flex justify-center">
      <label htmlFor="serverAvatar" className="cursor-pointer">
        <div className="w-[12rem] h-[12rem] rounded-full bg-gray-700 border-4 border-gray-600 flex items-center justify-center overflow-hidden hover:border-cyan-500 transition-all duration-200">
          {preview ? (
            <img
              src={preview}
              alt="Server avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-white text-sm">Upload</span>
          )}
        </div>
        <input
          type="file"
          id="serverAvatar"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>
      {uploading && <span className="ml-2 text-cyan-400">Uploading...</span>}
      {error && <span className="ml-2 text-red-500">{error}</span>}
    </div>
  );
}