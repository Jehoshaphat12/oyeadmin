import React from "react";
import { avatarColors } from "../../utils/helpers";

interface AvatarProps {
  name: string;
  size?: number;
  photoUrl?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  size = 34,
  photoUrl,
}) => {
  const bg = avatarColors[name.charCodeAt(0) % avatarColors.length];
  const ini = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: 600,
        fontSize: Math.floor(size * 0.36),
        flexShrink: 0,
      }}
    >
      {photoUrl ? (
        <img
          src={photoUrl}
          style={{
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        ini
      )}
    </div>
  );
};
