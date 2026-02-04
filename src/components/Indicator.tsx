import { useState } from "react";
import logo from "../assets/logo.png";

export const Indicator = (props: { onClick: () => void }) => {
  const [position, setPosition] = useState<{
    top: string;
  }>({
    top: localStorage.getItem("top") || "33%",
  });

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    const { clientY } = e;
    const top = `${clientY}px`;
    setPosition({
      top,
    });
  };

  const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    const { clientY } = e;
    localStorage.setItem("top", `${clientY}px`);
    setPosition({ top: `${clientY}px` });
  };

  return (
    <div
      onClick={props.onClick}
      onDrag={(e) => handleDrag(e)}
      onDragEnd={(e) => handleDragEnd(e)}
      draggable="true"
      className="dd:absolute dd:-right-5 dd:z-99999 dd:bg-white 
            dd:rounded-[36px_0_0_36px] dd:shadow-[0_0_10px_rgba(0,0,0,0.2)]
            dd:w-14 dd:h-9 dd:cursor-pointer 
            dd:transition-[right_0.2s_ease-in-out] dd:select-none
            dd:flex dd:items-center"
      style={{ top: position.top }}
    >
      <img
        className="dd:select-none dd:w-6.5 dd:h-6.5"
        style={{ marginLeft: "3px" }}
        src={logo}
      />
    </div>
  );
};
