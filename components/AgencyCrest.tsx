import React from "react";
import Image from "next/image";

interface AgencyCrestProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function AgencyCrest({ size = "md", className = "" }: AgencyCrestProps) {
  const sizeMap = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-28 h-28",
    xl: "w-36 h-36",
  };

  const imageSizeMap = {
    sm: 32,
    md: 56,
    lg: 80,
    xl: 104,
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full bg-[#071931] p-1 border-2 border-[#c5a059] shadow-md select-none shrink-0 ${sizeMap[size]} ${className}`}
      title="Directorate of Special Incident Oversight - Official Seal"
    >
      {/* Outer Decorative Ring with Gold Dots */}
      <div className="absolute inset-0 rounded-full border border-dashed border-[#e6ca85]/40 pointer-events-none" />

      {/* Central Portrait of Subject Seal */}
      <div className="relative rounded-full overflow-hidden w-full h-full border border-[#c5a059] flex items-center justify-center bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/seal_logo.jpg"
          alt="Directorate Official Seal Insignia"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Subtle Circular Watermark Rim Overlay */}
      <div className="absolute -inset-1 rounded-full border border-[#c5a059]/30 pointer-events-none" />
    </div>
  );
}
