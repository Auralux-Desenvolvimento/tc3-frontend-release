import { Icon } from "@iconify/react";
import { FC, HTMLAttributes } from "react";
import Image from "../Image";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import './style.css';

interface props extends HTMLAttributes<HTMLDivElement> {
  photoURL?: string;
  name: string;
  email?: string;
  isMine?: boolean;
  onRemove?: () => void;
}

const AdvisorCard: FC<props> = ({
  photoURL,
  name,
  email,
  isMine,
  onRemove
}) => {
  return (
    <div className="advisor-card">
      <Image className="photo" src={photoURL} alt={name} fallback={userPlaceholder} />   
      <h1 className="name">{name}</h1>
      {
        (!!isMine || !!email) && 
        <p className="email">{email}</p>
      }
      {
        onRemove && 
        <Icon className="remove" icon="octicon:trash-24" onClick={onRemove} />
      }
    </div>
  )
}

export default AdvisorCard;