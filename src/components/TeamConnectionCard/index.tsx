import { AnchorHTMLAttributes, FC } from "react";
import Image from "../Image";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import "./style.css";
import { Link } from "react-router-dom";
import truncate from "../../utils/functions/truncate";
import { Icon } from "@iconify/react";

export interface ITeamConnectionCardData extends ITeamConnectionCardMetaProps {
  isMine?: boolean;
}

export interface ITeamConnectionCardMetaProps {
  seen?: boolean;
  photoURL?: string;
  name: string;
  id: string;
  description?: string;
  hourMessage?: string;
  isChat?: boolean;
  isOnline?: boolean;
  available?: boolean;
}

export interface ITeamConnectionCardProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  name: string;
  id: string;
  seen?: boolean;
  photoURL?: string;
  description?: string;
  hourMessage?: string;
  isChat?: boolean;
  isOnline?: boolean;
  available?: boolean;
}

const TeamConnectionCard: FC<ITeamConnectionCardProps> = ({
  photoURL: photoUrl,
  name,
  description,
  hourMessage,
  className,
  isChat,
  id,
  isOnline,
  available,
  seen,
  ...rest
}) => {
  let status;
  if (isOnline !== undefined) {
    status = (
      <div className={`status ${isOnline ? "online" : "offline"}`}>{
        isOnline
        ? <>online</>
        : <>offline</>
      }</div>
    );
  }

  let link;
  if (isChat) {
    if (available === true) {
      link = `/chat/${id}`;
    } else {
      link = '/conexoes';
    }
  } else {
    link = `/equipe/${id}`;
  }

  return (
    <Link 
      className={`team-connection-card ${className ? className : ""} ${isChat && "connection-chat"}`} 
      to={link}
      {...rest}
    >
      <div className="connection-card">
        <Image className="photo" src={photoUrl} alt={name} fallback={userPlaceholder} />   
        <h1 className="name">{name}</h1>
        {isChat && <p className="hourMessage">{hourMessage}</p>}
        <p className="description">{truncate(description || "", 50)}</p>
        <div className="unavailable-seen">
          {
            seen === undefined
            ? null
            : seen
            ? <Icon className="icon seen" icon="bi:check-all" /> 
            : <Icon className="icon unseen" icon="bi:check-all" />
          }
          {available === false && <p className="unavailable">Indisponível</p>}
        </div>
        {status}
      </div>
    </Link>
  );
}

export default TeamConnectionCard;