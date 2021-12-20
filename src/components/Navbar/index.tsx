import { FC, HTMLAttributes, useContext, useEffect, useState } from "react";
import logo from  "../../assets/img/logo.svg";
import { InlineIcon } from '@iconify/react';
import bxX from '@iconify/icons-bx/bx-x';
import { Link, LinkProps } from 'react-router-dom';
import Sidebar from "./Sidebar";
import UserDataContext from "../../utils/UserDataContext";
import Image from "../Image";
import IUserTeamData from "../../utils/types/team/IUserTeamData";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import truncate from "../../utils/functions/truncate";
import ErrorMessage from "../ErrorMessage";
import ErrorContext from "../../utils/ErrorContext";
import ChatContext from "../../utils/ChatContext";
import '../../assets/css/navbar.css';
import './style.css';
import UseState from "../../utils/types/UseState";

const TeamContainer: FC<LinkProps> = ({
  className,
  ...rest
}) => {
  const user = useContext(UserDataContext)[0];

  let name;
  if (user) {
    name = truncate((user as IUserTeamData).name);
  }


  return (
    <Link className={`team-container ${className || ""}`} {...rest}>
      <div className="text-container">
        <p className="team-name">{name || "Time não logado"}</p>
        <p className="team-course">{(user as IUserTeamData)?.course || ""}</p>            
      </div>
      <Image
        src={(user as IUserTeamData)?.logoURL}
        alt="Sua foto de perfil"
        className="team-image"
        fallback={userPlaceholder}
      />
    </Link>
  );
}

export enum NavbarLocale {
  teams = "teams",
  connections = "connections",
  aboutUs = "aboutUs",
  profile = "profile"
}

interface props extends HTMLAttributes<HTMLDivElement> {
  locale: keyof typeof NavbarLocale;
  className?: string;
} 

const Navbar: FC<props> = ({
  locale,
  className,
  children,
  ...rest
}) => {
  const [ sidebar, setSidebar ] = useState(false);
  const [ globalError, setGlobalError ] = useContext(ErrorContext);
  const [ chatContext ] = useContext(ChatContext);
  const [ user ] = useContext(UserDataContext) as UseState<IUserTeamData | false | undefined>;
  const [ hasUnseenMessages, setHasUnseenMessages ] = useState(false);

  useEffect(() => {
    setHasUnseenMessages(!!user && !!chatContext && !!chatContext.find(e => (
      !!e.messages.find(f => (
        !f.seen && f.from !== user.id
      ))
    )));
  }, [ chatContext ]);


  return (
    <div
      className={`navbar-wrapper ${!!globalError ? "error" : ""} ${className ? className : ""}`}
      {...rest}
    >
      <ErrorMessage 
        message={globalError?.value||""}
        type={globalError?.type}
        onClose={() => setGlobalError(undefined)}
      />
      <nav className={`navbar ${className ? className : ""}`}>
        <div className="logo-container">
          <Link to="/equipes">
            <img className="logo" src={ logo } alt="Logo do site"/>
          </Link> 
        </div>
        <div className="nav-options">
          <Link to="/equipes" className={`menu-option ${locale === "teams" ? "selected" : ""}`}>
            <p className="option-text">Equipes</p>
          </Link>
          <Link to="/conexoes" className={`menu-option ${locale === "connections" ? "selected" : ""}`}>
            <p className={`option-text ${ hasUnseenMessages ? "connections" : ""}`}>
              Conexões
              {
                hasUnseenMessages
                ? <div className="notification-dot"></div>
                : <></>
              }
              </p>
          </Link>
          <Link to="/sobre-nos" className={`menu-option ${locale === "aboutUs" ? "selected" : ""}`}>
            <p className="option-text">Sobre nós</p>
          </Link>
        </div>
        <TeamContainer to="/perfil" className={`desktop ${locale === "profile" ? "selected" : ""}`} />
        <InlineIcon
          className="menu-icon"
          icon="eva:menu-outline"
          inline={true}
          onClick={() => setSidebar(true)}
        />
        <Sidebar sidebarState={[sidebar, setSidebar]}>
          <div className="sidebar-background">
            <InlineIcon className="sidebar-icon" icon={bxX} inline={true} onClick={() => setSidebar(false)} />
            <div className="sidebar-content">
              <TeamContainer to="/perfil" className={`team-container ${locale === "profile" ? "selected" : ""}`}/>
              <hr/>
              <ul className="sidebar-options">
                <li className={`sidebar-menu-option ${locale === "teams" ? "selected" : ""}`}>
                  <Link className="sidebar-option" to="/equipes">Equipes</Link>
                </li>
                <li className={`sidebar-menu-option ${locale === "connections" ? "selected" : ""}`}>
                <Link className={`sidebar-option ${hasUnseenMessages ? "connections" : ""}`}  to="/conexoes">Conexões
                {
                  hasUnseenMessages
                  ? <div className="notification-dot"></div>
                  : <></>
                }
                </Link>
                </li>
                <li className={`sidebar-menu-option ${locale === "aboutUs" ? "selected" : ""}`}>
                <Link className="sidebar-option"  to="/sobre-nos">Sobre nós</Link>
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

export default Navbar;