import { FC, HTMLAttributes } from 'react';
import ReactLoading from 'react-loading';
import "./style.css";

export enum LoadingPositions {
  left = "left",
  right = "right",
  center = "center"
}

interface props extends HTMLAttributes<HTMLDivElement> {
  position?: keyof typeof LoadingPositions;
}

const Loading: FC<props> = ({
  className,
  position,
  ...rest
}) => {
  return(
    <div className={`loading-container ${position || "center"} ${className ? className : ""}`} {...rest}>
      <ReactLoading className="loading-icon" type="spin" color="#4a14e0" height={'40%'} width={'40%'} />
      <span className="loading-text">Carregando...</span>
    </div>  
  )
}

export default Loading;