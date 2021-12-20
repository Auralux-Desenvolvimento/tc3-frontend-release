import { CSSProperties, FC, HTMLAttributes, useEffect, useRef } from "react";
import UseState from "../../../utils/types/UseState";
import "./style.css"

interface props extends HTMLAttributes<HTMLDivElement> {
  sidebarState: UseState<boolean>;
  sunscreenStyle?: CSSProperties;
  fromLeft?: boolean;
  onActiveClasses?: string[];
}

const Sidebar: FC<props> = ({
  children,
  className, 
  sidebarState,
  fromLeft, 
  sunscreenStyle,
  onActiveClasses, 
  ...rest
}) => {
  const sidebar = useRef<HTMLDivElement>(null);
  const sunscreen = useRef<HTMLDivElement>(null);
  const [ active, setActive ] = sidebarState;

  useEffect(() => {    
    if (active) {
      //adds the elements styles after the initial display
      sunscreen.current?.classList.add("active");
      setTimeout(() => {
        sunscreen.current?.classList.add("fadeIn");
        if (onActiveClasses) {
          onActiveClasses?.forEach(e => sidebar.current?.classList.add(e));
        }
      }, 1);
    } else {
      if (onActiveClasses) {
        onActiveClasses?.forEach(e => sidebar.current?.classList.remove(e));
      }
      sunscreen.current?.classList.remove("fadeIn");
      setTimeout(() => {
        sunscreen.current?.classList.remove("active");
      }, 150);
    }
  }, [ active, onActiveClasses ]);
  
  return (
    <>
      <div
        className={`sidebar ${fromLeft ? "left" : ""} ${active ? "active" : ""} ${className || ""}`}
        ref={sidebar}
        { ...rest }
      >
        {children}
      </div>
      <div
        className="sunscreen"
        style={sunscreenStyle}
        ref={sunscreen}
        onClick={() => setActive(false)}
      ></div>
    </>
  );
}
export default Sidebar;
