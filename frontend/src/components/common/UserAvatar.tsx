import React from "react";

interface UserAvatarProps {
  fullName?: string;
  profilePicture?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
  xl: "h-20 w-20 text-2xl",
};

const getInitials = (fullName?: string) => {
  if (!fullName) return "U";

  const parts = fullName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2);

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "U";
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  fullName,
  profilePicture,
  size = "md",
  className = "",
}) => {
  const baseClassName = `inline-flex items-center justify-center overflow-hidden rounded-full border border-gray-200 bg-gradient-to-br from-blue-500 to-cyan-400 font-semibold text-white shadow-sm dark:border-gray-700 ${sizeClasses[size]} ${className}`;

  if (profilePicture) {
    return (
      <img
        src={profilePicture}
        alt={`${fullName || "User"} avatar`}
        className={`${baseClassName} object-cover`}
      />
    );
  }

  return <div className={baseClassName}>{getInitials(fullName)}</div>;
};
