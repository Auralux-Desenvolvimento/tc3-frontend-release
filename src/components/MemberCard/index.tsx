import { FC, HTMLAttributes, MouseEvent, MouseEventHandler } from "react";
import Image from "../Image";
import "./style.css";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import { Icon } from "@iconify/react";

interface props extends HTMLAttributes<HTMLDivElement> {
  photoUrl?: string;
  name: string;
  age: number;
  role: string;
  description?: string;
  onRemove?: () => void;
}

const MemberCard: FC<props> = ({
  photoUrl,
  name,
  age,
  role,
  description,
  className,
  onRemove,
  ...rest
}) => {
  return (
    <div className={`member-card ${className ? className : ""}`} {...rest}>
      <Image className="photo" src={photoUrl} alt={name} fallback={userPlaceholder} />   
      <h1 className="name">{name}</h1>
      <h3 className="age">{age} anos</h3>
      <p className="role">{role}</p>
      <p className="description">{description || "Sem descrição..."}</p>
      {
        onRemove &&
        <Icon className="remove" icon="octicon:trash-24" onClick={onRemove} />
      }
    </div>
  );
}

export default MemberCard;
