import { useContext, useEffect, useRef, useState } from "react";
import { AxiosError } from "axios";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import TeamConnectionCard, { ITeamConnectionCardData } from "../../components/TeamConnectionCard";
import getFavourite from "../../services/team/favourites/getFavourite";
import '../../assets/css/listPage.css';
import IAppError from "../../utils/types/API/IAppError";
import Footer from "../../components/Footer";
import ChatContext from "../../utils/ChatContext";
import ErrorContext from "../../utils/ErrorContext";
import InterestContext from "../../utils/InterestContext";

const options = [ "Conexões", "Equipes interessadas", "Equipes que tenho interesse", "Favoritos" ];

export default function Connections () {
  const mounted = useRef(false);
  const teamsChat = useContext(ChatContext)[0];
  const interestContext = useContext(InterestContext)[0];
  const setGlobalError = useContext(ErrorContext)[1];
  const [ index, setIndex ] = useState<number>(0);
  const [ teams, setTeams ] = useState<ITeamConnectionCardData[]>();
  const [ favourite, setFavourite ] = useState<ITeamConnectionCardData[]>([]);

  function handleError (error: AxiosError<IAppError>) {
    switch (error.response?.data.code) {
      case -1:
        setGlobalError({ value: "Você não está logado." });
        break;
      case 0: 
        setGlobalError({ value: "Ops. Deu algo errado, tente novamente mais tarde." });
        break;
    }
  }

  useEffect(() => {
    mounted.current = true;
    if (index === 1 || index === 2) {
      const filterParam = index === 2;
      mounted.current && setTeams(
        interestContext
          .filter(e => e.isMine === filterParam)
          .map(e => ({
            id: e.id,
            name: e.name,
            description: e.course,
            photoURL: e.logo,
            isMine: e.isMine 
          }))
      );
    } else if (index === 3) {
      if (favourite.length === 0) {
        getFavourite().then(response => {
          const newTeams = response.data.map<ITeamConnectionCardData>(e => ({
            name: e.name,
            photoURL: e.logoURL,
            description: e.course,
            id: e.id,
            to: ""
          }));
          mounted.current && setFavourite(newTeams);
          mounted.current && setTeams(newTeams);
        }).catch(error => {
          handleError(error);
          mounted.current && setFavourite([]);
          mounted.current && setTeams(undefined);
        });
      } else {
        mounted.current && setTeams(favourite);
      }
    } else if (index === 0) {
      const newTeams = teamsChat.map<ITeamConnectionCardData>(e => {
        let teamsDisplay: string;
        const lastMessage = e.messages[e.messages.length - 1];
        if (lastMessage) {
          const sender = lastMessage.from === e.id
          ? e.name
          : "Você";
          teamsDisplay = `${sender}: ${lastMessage.content}`;
        } else {
          teamsDisplay = "Sem mensagens...";
        }
        return {
          id: e.id,
          photoURL: e.logo,
          name: e.name,
          description: teamsDisplay,
          isChat: true,
          isOnline: e.connected,
          to: "",
          hourMessage: lastMessage?.createdAt.toLocaleString(),
          available: e.status === "active" || e.status === "inactive",
          seen: lastMessage?.from !== e.id ? lastMessage?.seen : undefined
        }
      });
      mounted.current && setTeams(newTeams);
    }
    return () => {mounted.current = false;}
  }, [ index, teamsChat, interestContext ]);

  return (
    <div className="list-page page">
      <Navbar className="list-page-navbar" locale="connections"/>
      <div className="content-container">
        <Sidebar index={[ index, setIndex ]} options={options} />
        <div className="content-list">
          {
            teams && teams.length !== 0
            ? teams?.map(e => (
                <TeamConnectionCard
                  key={e.id}
                  id={e.id}
                  name={e.name}
                  photoURL={e.photoURL}
                  description={e.description}
                  isOnline={e.isOnline}
                  isChat={e.isChat}
                  hourMessage={e.hourMessage}
                  available={e.available}
                  seen={e.seen}
                />
              ))
            : index === 0
            ? <div className="not-found">
                Você ainda não tem interesse mútuo com nenhuma equipe.
              </div>
            : index === 3
            ? <div className="not-found">Você ainda não tem nenhuma equipe favorita.</div>
            : index === 1
            ? <div className="not-found">
                Que pena! Não achamos nenhuma equipe interessada em você.
              </div>
            : index === 2
            ? <div className="not-found">
                Você ainda não demonstrou interesse a nenhuma equipe. Vá a aba equipes e demonstre já!
              </div>
            : null
          }
          <Footer/>
        </div>
      </div>
    </div>
  )
}