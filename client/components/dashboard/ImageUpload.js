"use client";

import { useState } from "react";
import Image from "next/image";

// ============================================
// IMAGE UPLOAD COMPONENT
// ============================================
// Uploads images to Cloudinary and returns URLs
// Supports multiple image upload with preview
//
// Props:
// - images: Array of image URLs
// - onImagesChange: Callback when images change

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

export default function ImageUpload({ images = [], onImagesChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        const data = await res.json();
        return data.secure_url;
      });

      const newUrls = await Promise.all(uploadPromises);
      onImagesChange([...images, ...newUrls]);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    onImagesChange(images.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div>
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="flex gap-3 mb-3 flex-wrap">
          {images.map((url, index) => (
            <div key={index} className="relative group">
              <div className="w-24 h-24 relative rounded-lg overflow-hidden border border-gray-200">
                <Image
                  src={url}
                  alt={`Upload ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600 transition-colors flex items-center justify-center"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <label
        className={`inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
          uploading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-600"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span className="text-sm text-gray-700">
          {uploading ? "Uploading..." : "Upload Photos"}
        </span>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

      <p className="text-xs text-gray-500 mt-2">
        Upload photos from your gallery (max 5 recommended)
      </p>
    </div>
  );
}
