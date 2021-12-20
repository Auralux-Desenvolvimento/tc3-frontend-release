import { Icon } from "@iconify/react";
import { FC, HTMLAttributes } from "react";
import { ErrorContextType } from "../../utils/ErrorContext";
import "./style.css";

interface props extends HTMLAttributes<HTMLDivElement> {
  message: string;
  type?: keyof typeof ErrorContextType;
  onClose?: () => void;
}

const ErrorMessage: FC<props> = ({
  message,
  className,
  type,
  onClose,
  ...rest
}) => {
  return (
    <div className={`error-message ${className ? className : ""} ${type ? type : ""}`}  {...rest}>      
      {message}
      {onClose &&
      <Icon className="close" icon="bx:bx-x" onClick={onClose}/>}
    </div>
  );
}

export default ErrorMessage;
