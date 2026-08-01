"use client";

import { useState } from "react";
import { supabase } from "../lib/supabase";

type Props = {
  folder: string;
  value?: string;
  onUpload: (url: string) => void;
};

export default function ImageUpload({
  folder,
  value,
  onUpload,
}: Props) {
  const [uploading, setUploading] = useState(false);

  async function handleUpload(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploading(true);

    const extension = file.name.split(".").pop();

    const fileName = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(2)}.${extension}`;

    const { error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      alert("Nie udało się wysłać zdjęcia.");
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    onUpload(data.publicUrl);

    setUploading(false);
  }

  return (
    <div className="space-y-4">

      {value && (
        <img
          src={value}
          alt="Podgląd"
          className="h-40 w-40 rounded-2xl object-cover border"
        />
      )}

      <label className="flex cursor-pointer items-center justify-center rounded-xl bg-blue-700 px-6 py-4 font-bold text-white hover:bg-blue-800">

        {uploading
          ? "Wysyłanie..."
          : "📷 Wybierz zdjęcie"}

        <input
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />

      </label>

    </div>
  );
}