
import React from 'react';

interface ImageUploaderProps {
  onUpload: (base64: string) => void;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, label = "Upload Reference" }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      onUpload(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="relative">
      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-700 rounded-lg cursor-pointer bg-zinc-800/50 hover:bg-zinc-800 transition-colors">
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg className="w-8 h-8 mb-3 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="mb-2 text-sm text-zinc-400"><span className="font-semibold">{label}</span></p>
          <p className="text-xs text-zinc-500">PNG, JPG or WebP</p>
        </div>
        <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
      </label>
    </div>
  );
};

export default ImageUploader;
