import Navbar from "../../components/Navbar";
import MemberCard from "../../components/MemberCard";
import { Link, useHistory } from 'react-router-dom';
import { Icon } from '@iconify/react';
import starOutlined from '@iconify/icons-ant-design/star-outlined';
import "../../assets/css/teamView.css";
import { useContext, useEffect, useRef, useState } from "react";
import TeamSearchIndexContext from "../../utils/TeamSearchIndexContext";
import TeamSearchContext from "../../utils/TeamSearchContext";
import getSearch from "../../services/team/getSearch";
import Image from "../../components/Image";
import Footer from '../../components/Footer';
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import TeamSearchPageContext from "../../utils/TeamSearchPageContext";
import LoadingPage from "../LoadingPage"; 
import { useWindowWidth } from "@react-hook/window-size";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import favouritePost from "../../services/team/favourites/postFavourite";
import starFilled from "@iconify/icons-ant-design/star-filled";
import getTeamById, { IGetTeamByIdResponse } from "../../services/team/getTeamById";
import { convertFromRaw, EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import Report from "../../components/Modals/Report";
import AdvisorCard from "../../components/AdvisorCard";
import ErrorContext from "../../utils/ErrorContext";
import cloneDeep from "lodash.clonedeep";
import UserDataContext from "../../utils/UserDataContext";
import IUserModeratorData from "../../utils/types/moderator/IUserModeratorData";
import "./style.css";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import { AxiosError } from "axios";
import IAppError from "../../utils/types/API/IAppError";
import banTeam from "../../services/moderator/banTeam";
import SocketContext from "../../utils/SocketContext";
import InterestContext from "../../utils/InterestContext";
import IUserTeamData from "../../utils/types/team/IUserTeamData";

export default function IndividualSearch () {
  const user = useContext(UserDataContext)[0];
  const [ reportModal, setReportModal ] = useState(false);
  const pathName = window.location.pathname;
  const pathNameSplit = pathName.split("/");
  const pathId = pathNameSplit[2];
  let [ index, setIndex ] = useContext(TeamSearchIndexContext);
  const [ loading, setLoading ] = useState<boolean>(true);
  const [ search, setSearch ] = useContext(TeamSearchContext);
  let [ page, setPage ] = useContext(TeamSearchPageContext);
  const mounted = useRef(false);
  let [ team, setTeam ] = useState<IGetTeamByIdResponse|undefined>(search[index]);
  const width = useWindowWidth();
  const setGlobalError = useContext(ErrorContext)[1];
  const editorState = team?.portfolio 
  ? EditorState.createWithContent(convertFromRaw(team.portfolio))
  : undefined;
  const socket = useContext(SocketContext);
  const [ interest, setInterest ] = useContext(InterestContext);
  const history = useHistory();

  useEffect(() => {
    mounted.current = true;

    socket.current?.off("user/interest/error");
    socket.current?.on("user/interest/error", ({ code }: IAppError) => {
      switch (code) {
        case 5:
          mounted.current && setGlobalError({ value: "Você já demonstrou interesse a essa equipe." });
          break;
        case 5:
          mounted.current && setGlobalError({ value: "Você não pode demonstrar interesse enquanto está em um acordo." });
          break;
        case 6:
          mounted.current && setGlobalError({ value: "Você não pode demonstrar interesse enquanto a equipe que você tem interesse está em um acordo." });
          break;
        default:
          mounted.current && setGlobalError({ value: "Algo de errado aconteceu... Tente novamente mais tarde" });
          break;
      }
    });

    return () => {
      socket.current?.off("user/interest/error");
      mounted.current = false;
    }
  }, [ ]);

  useEffect(() => {    
    if (pathId) {
      getTeamById(pathId).then(response => {
        setTeam(response.data);
        setLoading(false);
      }).catch(() => {
        if (mounted.current) {
          setGlobalError({ value: "Oops... Algo deu errado." });
        }
      });
    } else {
      if (search.length === 0) {
        getSearch(page).then(response => {
          if (mounted.current) {
            setSearch(response.data);
            setLoading(false);
          }
        }).catch(() => {
          if (mounted.current) {
            setSearch([]);
            setLoading(false);
          }
        });
      } else {
        if (mounted.current) {
          setLoading(false);
        }
      }
    }
  }, [ page, search.length, setSearch ]);

  useEffect(() => {
    if (mounted.current) {
      setTeam(search[index]);
    }
  }, [ index, search ]);

  async function handleInterest (interestBool: boolean) {
    if (team?.id) {
      socket?.current?.emit("user/interest", {interest: interestBool, id: team.id});
      
      if (interestBool) {
        const newInterests = cloneDeep(interest);
        newInterests.push({
          course: team.course,
          id: team.id,
          isMine: true,
          logo: team.logoURL,
          name: team.name
        });
        setInterest(newInterests);
      }

      if (!pathId) {
        if (index === search.length -1) {
          page++;
          let searchResponse;
          setPage(page);
          try {
            searchResponse = await getSearch(page);
          } catch {
            return setSearch([]);
          }
          setSearch(searchResponse.data);
          setIndex(0);
        } else {
          setIndex(index + 1);
        }
      } else {
        history.push('/conexoes');
      }
    }      
  }

  async function handleFavouriteTeam (id: string | undefined) {
    if (id) {
      try {
        await favouritePost(id);
      } catch (untypedError) {
        return;
      }
      const newTeam = cloneDeep(team) as IGetTeamByIdResponse | undefined;

      if (!newTeam) {
        return;
      }

      newTeam.isFavourite = !newTeam.isFavourite;
      
      const newSearch = cloneDeep(search);
      newSearch.splice(index, 1, newTeam);

      setTeam(newTeam);
      setSearch(newSearch);
    }
  }

  async function BanTeam() {
    if (pathId) {
      try {
        await banTeam(pathId);
      } catch (untypedError) {
        const error: AxiosError<IAppError> = untypedError as any;
        switch (error.response?.data.code) {
          case 1:
            return setGlobalError({value: "Oops... Algo de errado aconteceu, tente novamente mais tarde."});
          case 3:
            return setGlobalError({value: "Essa equipe já foi banida."});
          case -1:
            return setGlobalError({value: "Oops... Algo de errado aconteceu, tente novamente mais tarde."});
          case 2: 
            return setGlobalError({value: "Essa equipe que você quer banir não existe."});
          default:
            return setGlobalError({value: "Oops... Algo de errado aconteceu, tente novamente mais tarde."});
        }
      }
      const newTeam = cloneDeep(team) as IGetTeamByIdResponse | undefined;

      if (!newTeam) {
        return;
      }

      newTeam.isActive = false;
      
      setTeam(newTeam);
      return setGlobalError({value: "Usuário banido com sucesso.", type: "success"});
    }
  }

  const description = <>
    <div className="container-description">
      <hr className="hr" />
      <div className="theme">
        <h1 className="section-label">Tema do trabalho</h1>
        <p className="name">{team?.theme || "Esta equipe não possui um tema."}</p>
        <p className="description">{team?.themeDescription || undefined}</p>
      </div>

      <hr className="hr" />

      <div className="portfolio-wrapper">
        <h1 className="section-label">Portfólio</h1>
        <p className="portfolio">
          {
            !!team?.portfolio 
            ? <Editor editorState={editorState as EditorState} toolbarHidden readOnly/>
            : <>Essa equipe não possui um portfólio.</>
          }
        </p>
      </div>
      <hr className="hr" />
    </div>
  </>

  const innerDetails = <>
    <div className="team">
      <div className="photo">
        <Image
          src={team?.logoURL}
          fallback={userPlaceholder}
          alt="Foto da equipe"
        />
      </div>
      <SimpleBar className="name">{team?.name || "Placeholder"}</SimpleBar>
      <h3 className="course">{team?.course || "Placeholder"}</h3>
      <h3 className="location">{team?.city || "Placeholder"}</h3>
      {
        !(user as IUserModeratorData).isModerator
        ? !team?.isInterested && !(user as IUserTeamData)?.isInAgreement &&
          <>
            <button
              className="interest responsive-button"
              onClick={() => handleInterest(true)}
            >
              Tenho interesse
            </button>
            <button
              className="disinterest"
              onClick={() => handleInterest(false)}
            >
              Não tenho interesse
            </button>
          </>
        : !!team?.isActive 
          ?
            <button
              className="ban responsive-button"
              onClick={BanTeam}
            >
              Banir
            </button>
          : 
            <h3 className="banned-message">Equipe Banida</h3>
      }
    </div>

    {
      width <= 768 &&
      description
    }

    <div className="advisors">
      <h1 className="section-label">Orientadores</h1>{team?.advisors.map(e => (
        <AdvisorCard
          photoURL={e.photoURL || undefined}
          name={e.name}
          email={e.email}
          key={e.id}
        />
      ))}
    </div>

    <div className="members">
      <h1 className="section-label">Integrantes</h1>
      {team?.members.map(e => (
        <MemberCard 
          age={Math.abs(new Date(Date.now() - e.birthday.getTime()).getUTCFullYear() - 1970)}
          description={e.description}
          name={e.name}
          role={e.role}
          key={e.id}
          photoUrl={e.photoURL}
        />
      ))}
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
    <div className="individual-search team-view page">
      {
        (user as IUserModeratorData).isModerator
        ? <ModeratorNavbar locale="teams" />
        : <Navbar locale="teams"/>
      }
      {
        team
        ? <div className="content">
            {
              loading
              ? <LoadingPage/>
              : <>
                  {
                    !(user as IUserModeratorData).isModerator &&
                    <div className="navigation">
                      <button className="report-team" onClick={() => setReportModal(true)}>Denunciar equipe</button>
                      <Link to="/equipes" className="view-all">Ver todas as equipes</Link>
                      {
                        team?.isFavourite
                        ?
                          <Icon className="favourite" icon={starFilled} onClick={() => handleFavouriteTeam(team?.id)} />
                        :
                          <Icon className="favourite" icon={starOutlined} onClick={() => handleFavouriteTeam(team?.id)} />
                      }
                    </div>
                  }
                  <div className="inner-content">
                    {details}
                    {
                      width > 768 &&
                      description
                    }
                  </div>
                </>
            }
          </div>
        : <div className="not-found">
            Oops, parece que você já viu todas as equipes disponíveis...
          </div>
      }
      {
        team?.id
        ? <Report
            reportedId={team.id}
            openState={[reportModal, setReportModal]}
          />
        : null 
      }
      {
        loading
        ? null
        : <Footer />
      }
    </div>
  )
}