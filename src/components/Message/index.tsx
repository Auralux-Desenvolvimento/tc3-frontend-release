import { FC, HTMLAttributes } from "react";
import { Icon } from '@iconify/react';
import './style.css';

interface props extends HTMLAttributes<HTMLDivElement> {
  isMine: boolean;
  content: string;
  time: Date;
  seen?: boolean;
}

const Message: FC<props> = ({
  content,
  isMine,
  time,
  seen,
  className,
  ...rest
}) => {
  let minutes: string|number = time.getMinutes();
  if (minutes < 10) {
    minutes = `0${minutes}`;
  }
  return (
    <div className={`message-wrapper ${isMine ? "mine" : ""} ${className ? className : ""}`} {...rest}>
      <p className="message">{content}</p>
      <div className="info">
        <p className="time">{`${time.getHours()}:${minutes}`}</p>
        {
          !isMine 
          ? null
          : seen
          ? <Icon className="icon seen" icon="bi:check-all" /> 
          : <Icon className="icon unseen" icon="bi:check-all" />
        }
      </div>
    </div>
  );
}

export default Message;