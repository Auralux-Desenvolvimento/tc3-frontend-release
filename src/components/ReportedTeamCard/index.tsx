import { FC, HTMLAttributes } from "react";
import Image from "../Image";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import { Link } from "react-router-dom";
import './style.css'

export enum ReportState {
  fromAnotherModerator = "fromAnotherModerator",
  fromSelf = "fromSelf",
  unattended = "unattended"
}

interface props extends HTMLAttributes<HTMLDivElement> {
  id: string | undefined;
  name: string | undefined;
  logoURL?: string;
  course: string | undefined;
  theme?: string;
  reportState: keyof typeof ReportState;
  onBan?: () => void;
}

const ReportedTeamCard: FC<props> = ({
  id,
  name,
  logoURL,
  course,
  theme,
  className,
  reportState,
  onBan,
  ...rest
}) => {


  return (
    <div className={`reported-card-container ${className ? className : ""}`} {...rest}>
      <Image className="photo" src={logoURL} alt={name} fallback={userPlaceholder} />   
      <h1 className="name">{name}</h1>
      <h3 className="course">{course}</h3>
      <p className="theme"><strong>Tema: </strong>{theme || "Essa equipe não possui um tema."}</p>
      <div className="buttons">
        <Link className="see-profile" to={`/equipe/${id}`}>Ver perfil</Link>
        {
          reportState === "fromSelf" &&
          <button className="responsive-button" onClick={onBan}>Banir</button>
        }
      </div>
    </div>
  )
}

export default ReportedTeamCard;