import Navbar from "../../components/Navbar";
import MemberCard from "../../components/MemberCard";
import { Icon } from '@iconify/react';
import { useContext, useEffect, useRef, useState } from "react";
import Image from "../../components/Image";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import { useWindowWidth } from "@react-hook/window-size";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import UserDataContext from "../../utils/UserDataContext";
import "../../assets/css/teamView.css";
import IUserTeamData from "../../utils/types/team/IUserTeamData";
import Footer from "../../components/Footer";
import "./style.css";
import Tag from "../../components/Tag";
import logoff from "../../services/team/getLogoff";
import getPreference, { IGetPreferenceResponse } from "../../services/preferences/getPreference";
import FilterModal from "../../components/Modals/FilterModal";
import EditProfile from "../../components/Modals/EditProfile";
import AdvisorCard from "../../components/AdvisorCard";
import ChatContext from "../../utils/ChatContext";
import { Link } from "react-router-dom";
import { convertFromRaw, EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import CreateMember from "../../components/Modals/CreateMember";
import DeleteMember from "../../components/Modals/DeleteMember";
import SocketContext from "../../utils/SocketContext";
import CreateAdvisor from "../../components/Modals/CreateAdvisor";
import DeleteAdvisor from "../../components/Modals/DeleteAdvisor";
import ErrorContext from "../../utils/ErrorContext";

export default function Profile() {
  const mounted = useRef(false);
  let team = useContext(UserDataContext)[0] as IUserTeamData;
  const width = useWindowWidth();
  const setGlobalError = useContext(ErrorContext)[1];
  const [preferences, setPreferences] = useState<IGetPreferenceResponse>();
  const [preferencesModal, setPreferencesModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteAdvisorModal, setDeleteAdvisorModal] = useState(false);
  const [createAdvisorModal, setCreateAdvisorModal] = useState(false);
  const [currentAdvisor, setCurrentAdvisor] = useState<string>();
  const [createMemberModal, setCreateMemberModal] = useState(false);
  const [deleteMemberModal, setDeleteMemberModal] = useState(false);
  const [currentMember, setCurrentMember] = useState<string>();
  let matches = useContext(ChatContext)[0];
  const socket = useContext(SocketContext);
  const editorState = team.portfolio 
  ? EditorState.createWithContent(convertFromRaw(team.portfolio))
  : undefined;

  let activeAgreementIndex;
  for (let i = 0; i < matches.length; i++) {
    if (matches[i].agreement?.status === 'active') {
      activeAgreementIndex = i;
      break;
    }
  }  

  useEffect(() => {
    mounted.current = true;
    getPreference().then(response => {
      mounted.current && setPreferences(response.data);
    }).catch(() => {
      mounted.current && setPreferences(undefined);
    });
    return () => { mounted.current = false; }
  }, []);

  async function handleSetPreferences() {
    let response;
    try {
      response = await getPreference();
    } catch {
      mounted.current && setPreferences(undefined);
      return;
    }
    mounted.current && setPreferences(response.data);
    mounted.current && setPreferencesModal(false);
  }

  async function handleLogoff() {
    try {
      await logoff();
      socket.current?.disconnect();
      window.location.href = '/';
    } catch {
      setGlobalError({ value: "Ops... Algo deu errado. Tente novamente mais tarde..." });
    }
  }

  const editPreferences = (
    <button onClick={() => setPreferencesModal(true)} className="edit-preferences responsive-button">
      Editar preferências
      <Icon icon="akar-icons:edit" />
    </button>
  );

  const description = <>
    <div className="container-description">
      <div className="theme">
        <h1 className="section-label">Tema do trabalho</h1>
        <p className="name">{team?.theme || "Sua equipe não possui um tema."}</p>
        <p className="description">{team?.themeDescription || "Sua equipe ainda não possui uma descrição do tema."}</p>
      </div>

      <hr className="hr" />

      <div className="portfolio-wrapper">
        <h1 className="section-label">Portfólio</h1>
        <p className="portfolio">
          {
            !!team.portfolio
            ? <Editor editorState={editorState as EditorState} toolbarHidden readOnly/>
            : <>Você ainda não possui um portfólio... Clique em "Editar Perfil" para fazer um!</>
          }
        </p>
      </div>
    </div>
  </>

  const innerDetails = <>
    <div>
      <div className="team"> 
        <div className="photo">
          <Image
            src={team?.logoURL}
            fallback={userPlaceholder}
            alt="Foto da equipe"
          />
        </div>
        <SimpleBar className="name">{team.name || "Placeholder"}</SimpleBar>
        <h3 className="course">{team.course || "Placeholder"}</h3>
        <h3 className="location">{team.city || "Placeholder"}</h3>
        <button className="responsive-button edit-profile" onClick={() => setEditModal(true)}>
          <p>Editar Perfil</p>
        </button>
        <button
          className="responsive-button exit"
          onClick={handleLogoff}
        >
          <Icon icon="radix-icons:exit" />
          <p>Sair</p>
        </button>
      </div>
      {typeof activeAgreementIndex === "number" &&
        <p className="current-agreement">
          Acordo firmado com:
          <Link
            to={`/equipe/${matches[activeAgreementIndex].id}`}
            className="team-name"
          >
            {matches[activeAgreementIndex].name}
          </Link>
        </p>
      }
      {width <= 768 &&
        <hr className="hr" />
      }
      <div className="preferences-profile">
        <div className="preferences-controls">
          <h1 className="section-label">Preferências</h1>
          {width > 768 && editPreferences}
        </div>

        {
          preferences &&
          <>
            <div className="preferences-section">
              <span>Localidade:</span>
              {preferences?.area || "Equipes de qualquer lugar"}
            </div>

            {
              preferences.themePreference === undefined || null
                ? null
                : preferences.themePreference
                ? <div className="preferences-section tags">
                    <span>Palavras-chave de tema:</span> 
                    {preferences?.keywords?.map(e => (
                      <Tag label={e} key={e}/>
                    ))}
                  </div>
                : <div className="preferences-section">
                    Equipes sem tema
                  </div>
            }

            <div className="preferences-section tags">
              <span>Cursos:</span>
              {preferences?.courses.map(e => (
                <Tag label={e} key={e} />
              ))}
            </div>
          </>
        }

        {width <= 768 && editPreferences}
      </div>
    </div>

    {
      width <= 768 &&
      description
    }

    <hr className="hr" />

    <div className="advisors">
      <div className="advisor-label">
        <h1 className="section-label">Orientadores</h1>
        <Icon icon="akar-icons:plus" onClick={() => setCreateAdvisorModal(true)} />
      </div>
      {
        team?.advisors?.map(e => {
          const handleAdvisorRemoval = () => {
            setCurrentAdvisor(e.id);
            setDeleteAdvisorModal(true);
          }
          return (
            <AdvisorCard 
              photoURL={e.photoURL || undefined}
              key={e.id}
              isMine
              name={e.name}
              email={e.email}
              onRemove={team.advisors.length > 1 ? handleAdvisorRemoval : undefined}
            />
          )
        })
      }
      
    </div>

    <div className="members">
      <div className="members-label">
        <h1 className="section-label">Integrantes</h1>
        <Icon icon="akar-icons:plus" onClick={() => setCreateMemberModal(true)} />
      </div>
      {
        team?.members.map(e => {
          const handleMemberRemoval = () => {
            setCurrentMember(e.id);
            setDeleteMemberModal(true);
          }
          return (
            <MemberCard
              age={Math.abs(new Date(Date.now() - e.birthday.getTime()).getUTCFullYear() - 1970)}
              description={e.description}
              name={e.name}
              role={e.role}
              key={e.id}
              photoUrl={e.photoURL}
              onRemove={team.members.length > 1 ? handleMemberRemoval : undefined}
            />
          )
        })
      }
    </div>
  </>;

  let details;
  if (width > 768) {
    details =
      <div className="details">
        <div className="inner-details">
          {innerDetails}
        </div>
        <div className="vertical-bar"></div>
      </div>
  } else {
    details = innerDetails;
  }

  return (
    <>
      <div className="profile team-view page">
        <Navbar locale="profile"/>
        <div className="content">
          <div className="inner-content">
            {details}
            {
              width > 768 &&
              description
            }
          </div>
        </div>
        <Footer />
      </div>
      <FilterModal
        openState={[preferencesModal, setPreferencesModal]}
        handleSubmit={handleSetPreferences}
        buttonText="Alterar"
      />
      <EditProfile
        openState={[editModal, setEditModal]}
      />
      <CreateMember 
        openState={[createMemberModal, setCreateMemberModal]}
      />
      <DeleteMember
        openState={[deleteMemberModal, setDeleteMemberModal]}
        currentMember={currentMember}
      />
      <CreateAdvisor
        openState={[createAdvisorModal, setCreateAdvisorModal]}
      />
      <DeleteAdvisor
        openState={[deleteAdvisorModal, setDeleteAdvisorModal]}
        currentAdvisor={currentAdvisor}
      />
    </>
  )
}