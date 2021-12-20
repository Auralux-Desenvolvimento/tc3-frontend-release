import { FC, HTMLAttributes, useContext, useState } from "react";
import logo from  "../../assets/img/logo.svg";
import { Icon } from '@iconify/react';
import { Link, LinkProps } from 'react-router-dom';
import Sidebar from "../Navbar/Sidebar";
import UserDataContext from "../../utils/UserDataContext";
import IUserTeamData from "../../utils/types/team/IUserTeamData";
import truncate from "../../utils/functions/truncate";
import ErrorMessage from "../ErrorMessage";
import ErrorContext from "../../utils/ErrorContext";
import '../../assets/css/navbar.css';
import './style.css';

const ModeratorContainer: FC<LinkProps> = ({
  className,
  ...rest
}) => {
  const user = useContext(UserDataContext)[0];

  let name;
  if (user) {
    name = truncate((user as IUserTeamData).name);
  }

  return (
    <Link className={`moderator-container ${className || ""}`} {...rest}>
      <p className="moderator-name">{name || "Moderator Name"}</p>          
    </Link>
  );
}

export enum ModeratorNavbarLocale {
  reports = "reports",
  teams = "teams",
  courses = "courses",
  posts = "posts",
  profile = "profile"
}

interface props extends HTMLAttributes<HTMLDivElement> {
  locale: keyof typeof ModeratorNavbarLocale;
  className?: string;
} 

const ModeratorNavbar: FC<props> = ({
  locale,
  className,
  children,
  ...rest
}) => {
  const [ sidebar, setSidebar ] = useState(false);
  const [ globalError, setGlobalError ] = useContext(ErrorContext);
  
  return (
    <div
      className={`navbar-wrapper ${!!children ? "has-children" : ""} ${!!globalError ? "error" : ""} ${className ? className : ""}`}
      {...rest}
    >
      <ErrorMessage 
        message={globalError?.value||""}
        type={globalError?.type}
        onClose={() => setGlobalError(undefined)}
      />
      <nav className={`navbar ${className ? className : ""}`}>
        <div className="logo-container">
          <Link to="/denuncias">
            <img className="logo" src={ logo } alt="Logo do site"/>
          </Link>
        </div>
        <div className="nav-options">
          <Link to="/denuncias" className={`menu-option ${locale === "reports" ? "selected" : ""}`}>
            <p className="option-text">Denúncias</p>
          </Link>
          <Link to="/ver-equipes" className={`menu-option ${locale === "teams" ? "selected" : ""}`}>
            <p className="option-text">Equipes</p>
          </Link>
          <Link to="/cursos" className={`menu-option ${locale === "courses" ? "selected" : ""}`}>
            <p className="option-text">Cursos</p>
          </Link>
          <Link to="/postagens" className={`menu-option ${locale === "posts" ? "selected" : ""}`}>
            <p className="option-text">Postagens</p>
          </Link>
        </div>
        <ModeratorContainer to="/perfil-moderador" className={`desktop ${locale === "profile" ? "selected" : ""}`} />
        <Icon
          className="menu-icon"
          icon="eva:menu-outline"
          inline={true}
          onClick={() => setSidebar(true)}
        />
        <Sidebar sidebarState={[sidebar, setSidebar]} >
          <div className="sidebar-background">
            <Icon className="sidebar-icon" icon="bi:x-lg" inline={true} onClick={() => setSidebar(false)} />
            <div className="sidebar-content">
              <ModeratorContainer to="/perfil-moderador" className={`${locale === "profile" ? "selected" : ""}`}/>
              <hr/>
              <ul className="sidebar-options">
                <li className={`sidebar-menu-option ${locale === "reports" ? "selected" : ""}`}>
                  <Link className="sidebar-option"  to="/denuncias">Denúncias</Link>
                </li>
                <li className={`sidebar-menu-option ${locale === "teams" ? "selected" : ""}`}>
                  <Link className="sidebar-option" to="/ver-equipes">Equipes</Link>
                </li>
                <li className={`sidebar-menu-option ${locale === "courses" ? "selected" : ""}`}>
                  <Link className="sidebar-option"  to="/cursos">Cursos</Link>
                </li>
                <li className={`sidebar-menu-option ${locale === "posts" ? "selected" : ""}`}>
                  <Link className="sidebar-option"  to="/postagens">Postagens</Link>
                </li>
              </ul>
            </div>
          </div>
          
        </Sidebar>
      </nav>
      <div className="children">
        {children}
      </div>
    </div>
  )
}

export default ModeratorNavbar;