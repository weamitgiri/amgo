import { jsx } from "react/jsx-runtime";
const homeLogoLight = "/assets/F-logo-igS5MJ4y.png";
const homeLogoDark = "/assets/home-logo-BDYi-GMR.png";
function Flogo({ light = false, width = 211, height = 60 }) {
  const widthStyle = typeof width === "number" ? `${width}px` : width;
  const heightStyle = typeof height === "number" ? `${height}px` : height;
  return /* @__PURE__ */ jsx("div", { className: "flex items-center gap-2.5", children: /* @__PURE__ */ jsx(
    "img",
    {
      src: light ? homeLogoLight : homeLogoDark,
      alt: "Flogo",
      style: { width: widthStyle, height: heightStyle, objectFit: "contain" }
    }
  ) });
}
export {
  Flogo as F
};
