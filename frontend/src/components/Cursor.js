import { useEffect } from "react";
import "./Cursor.css"; // Add styles for cursor

const Cursor = () => {
  useEffect(() => {
    const cursor = document.createElement("div");
    cursor.id = "customCursor";

    const arrow = document.createElement("div");
    arrow.id = "cursorArrow";
    cursor.appendChild(arrow);
    document.body.appendChild(cursor);

    let lastX = 0, lastY = 0;

    const moveCursor = (e) => {
      let deltaX = e.clientX - lastX;
      let deltaY = e.clientY - lastY;

      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      if (deltaX === 0 && deltaY === 0) {
        arrow.innerHTML = "";
      } else if (Math.abs(deltaX) > Math.abs(deltaY)) {
        arrow.innerHTML = deltaX > 0 ? ">" : "<";
        arrow.style.top = "0";
        arrow.style.left = deltaX > 0 ? "30px" : "-15px";
      } else {
        arrow.innerHTML = deltaY > 0 ? "v" : "^";
        arrow.style.left = "0";
        arrow.style.top = deltaY > 0 ? "25px" : "-15px";
      }

      lastX = e.clientX;
      lastY = e.clientY;
    };

    document.addEventListener("mousemove", moveCursor);

    return () => {
      document.removeEventListener("mousemove", moveCursor);
      document.body.removeChild(cursor);
    };
  }, []);

  return null; // This component doesn't render anything, just runs script
};

export default Cursor;
