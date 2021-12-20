import { FC } from "react";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import UseState from "../../utils/types/UseState";
import './style.css';

interface ISidebarProps {
  options: string[];
  index: UseState<number>
}

const Sidebar: FC<ISidebarProps> = ({
  index: indexState,
  options
}) => {
  let [ index, setIndex ] = indexState;

  return(
    <div className="sidebar-container">
      <SimpleBar className="sidebar-simplebar" >
        <ul className="sidebar-options">{options.map((e, i) => (
          <li 
            onClick={() => setIndex(i)} 
            className={`sidebar-option ${index === i ? "selected" : ""}`}
            key={i}
          >
            {e}
          </li>
        ))}</ul>
      </SimpleBar>
    </div>
  )
}

export default Sidebar;