import { FC, HTMLAttributes } from "react";
import Alert from "../Alert";
import "./style.css";

interface props extends HTMLAttributes<HTMLDivElement> {
  title: string;
}

const SingleMessage: FC<props> = ({
  title,
  children,
  className,
  ...rest
}) => {
  return (
    <div className={`single-message ${className ? className : ""}`} {...rest}>
      <Alert
        title={title}
        children={children}
      />
    </div>
  );
}

export default SingleMessage;

