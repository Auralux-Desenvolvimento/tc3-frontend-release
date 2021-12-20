import { Icon } from '@iconify/react';
import starOutlined from '@iconify/icons-ant-design/star-outlined';
import starFilled from '@iconify/icons-ant-design/star-filled';
import Image from '../Image';
import { FC, useContext, MouseEvent, useRef, useEffect } from 'react';
import UseState from '../../utils/types/UseState';
import './style.css'
import { useHistory } from 'react-router-dom';
import favouritePost from '../../services/team/favourites/postFavourite';
import { IGetSearchResponse } from '../../services/team/getSearch';
import ErrorContext from '../../utils/ErrorContext';
import cloneDeep from 'lodash.clonedeep';
import SocketContext from '../../utils/SocketContext';
import IAppError from '../../utils/types/API/IAppError';
import IInterest from '../../utils/types/interest/IInterest';
import truncate from '../../utils/functions/truncate';
import TeamSearchIndexContext from '../../utils/TeamSearchIndexContext';

interface props {
  team: IGetSearchResponse;
  teamState: UseState<IGetSearchResponse[]>;
  interestState: UseState<IInterest[]>;
}

const TeamCard: FC<props> = ({
  team,
  teamState,
  interestState
}) => {
  const mounted = useRef(false);
  const history = useHistory();
  const [ teams, setTeams ] = teamState;
  const [ interest, setInterest ] = interestState;
  const setGlobalError = useContext(ErrorContext)[1];
  const socket = useContext(SocketContext);
  let [ index, setIndex ] = useContext(TeamSearchIndexContext);

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

  async function handleShowInterest (event: MouseEvent<HTMLButtonElement>, interestBool: boolean) {
    event.stopPropagation();
    socket?.current?.emit("user/interest", {interest: interestBool, id: team.id});

    const newTeams = cloneDeep(teams).filter(e => e.id !== team.id);
    setTeams(newTeams);

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

  async function handleFavouriteTeam (event: MouseEvent) {
    event.stopPropagation();
    if (team.id) {
      try {
        await favouritePost(team.id);
      } catch {
        mounted.current && setGlobalError({ value: "Oops... Encontramos um erro inesperado, tente novamente mais tarde." });
      }

      const newTeams = cloneDeep(teams);
      const teamIndex = newTeams.findIndex(e => e.id === team.id);

      if (teamIndex < 0) {
        return;
      }

      newTeams[teamIndex].isFavourite = !newTeams[teamIndex].isFavourite;

      mounted.current && setTeams(newTeams);
    }
  }

  function handleViewTeam () {
    const newTeams = cloneDeep(teams);
    const subjectIndex = newTeams.findIndex(e => e.id === team.id);
    const subject = newTeams.splice(subjectIndex, 1)[0];
    newTeams.unshift(subject);
    setTeams(newTeams);
    setIndex(0);
    history.push('/equipe');
  }

  return (
    <div 
      className="team-card"
      onClick={handleViewTeam}
    >
      {
        team.isFavourite
        ?
          <Icon className="favourite" icon={starFilled} onClick={(e) => handleFavouriteTeam(e)} />
        :
          <Icon className="favourite" icon={starOutlined} onClick={(e) => handleFavouriteTeam(e)} />
      }
      <Icon 
      icon={starOutlined}
      onClick={event => handleFavouriteTeam(event)} />
      <div className="team-data">
        <div className="team-image">
          <Image
            src={team.logoURL}
            fallback="https://img.icons8.com/material-outlined/96/000000/user--v1.png"
            alt="Imagem da equipe"
          />
        </div>
        <div className="team-details">
          <h1>{team.name}</h1>
          <p>{team.course}</p>
        </div>
      </div>
      <div className="team-theme-wrapper">
        <p className="label">Tema:</p>
        <p className="content">{team.theme ? truncate(team.theme, 40) : "Essa equipe não possui um tema"}</p>
      </div>
      <div className="button-area">
        <button className="disinterest" onClick={(event) => handleShowInterest(event, false)}>Não tenho interesse</button>
        <button className="responsive-button" onClick={(event) => handleShowInterest(event, true)}>Tenho interesse</button>
      </div>
    </div>
  );
}

export default TeamCard;