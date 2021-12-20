import { FC, HTMLAttributes, useContext, useEffect } from "react";
import { Icon } from '@iconify/react';
import AlertContext from "../../utils/AlertContext";
import "./style.css";

interface props extends HTMLAttributes<HTMLDivElement> {
  title: string;
  overlay?: boolean;
  closeable?: boolean;
}

const AlertMessage: FC<props> = ({
  title,
  closeable,
  children,
  className,
  overlay,
  ...rest
}) => {
  const setAlert = useContext(AlertContext)[1];

  function handleClose() {
    setAlert(undefined);
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  });

  return (<>
    <div 
      className={`alert ${overlay ? "overlay" : ""} ${closeable ? "closeable" : ""} ${className ? className : ""}`}
      {...rest}
    >
      <h1 className="title-box">
        {title}
        {
          closeable
          ? <Icon className="close" icon="bx:bx-x" onClick={handleClose}/>
          : null
        }
      </h1>
      <div className="message-box">
        {children}
      </div>
    </div>
    {
      overlay
      ? <div className="alert-overlay"></div>
      : null
    }
  </>);
}

export default AlertMessage;
