import { FC, HTMLAttributes } from "react";
import Image from "../Image";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import './style.css'
import { Link } from "react-router-dom";

interface props extends HTMLAttributes<HTMLDivElement> {
  id: string | undefined;
  name: string | undefined;
  logoURL?: string;
  course: string | undefined;
  theme?: string;
}

const SearchTeamsCard: FC<props> = ({
  id,
  name,
  logoURL,
  course,
  theme,
  className,
  ...rest
}) => {
  return(
    <div className={`search-team-card-container ${className ? className : ""}`} {...rest} >
      <Image className="photo" src={logoURL} alt={name} fallback={userPlaceholder} />
      <h1 className="name">{name}</h1>
      <h3 className="course">{course}</h3>
      <p className="theme"><strong>Tema: </strong>{theme || "Essa equipe não possui um tema."}</p>
      <Link className="link-button" to={`/equipe/${id}`}>
        <button type="button" className="responsive-button">Ver perfil</button>
      </Link>
      
    </div>
  )
}

export default SearchTeamsCard;