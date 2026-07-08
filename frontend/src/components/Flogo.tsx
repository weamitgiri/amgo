import homeLogoLight from "@/assets/F-logo.png";
import homeLogoDark from "@/assets/home-logo.png";

interface FlogoProps {
  light?: boolean;
  width?: string | number;
  height?: string | number;
}

export function Flogo({ light = false, width = 211, height = 60 }: FlogoProps) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={light ? homeLogoLight : homeLogoDark}
        alt="Flogo"
        style={{ width: widthStyle, height: heightStyle, objectFit: "contain" }}
      />
    </div>
  );
}


