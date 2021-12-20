import { Route, Switch } from 'react-router-dom';
import SignUpUser from './pages/SignUpUser';
import Login from './pages/Login';
import { LandingPage } from './pages/LandingPage';
import Preferences from './pages/Preferences/index';
import ValidateEmail, { ValidateEmailRoute } from './pages/ValidateEmail/index';
import ConfirmEmail, { ConfirmEmailRoute } from './pages/ConfirmEmail/index';
import ProtectedRoute from './utils/routes/ProtectedRoute';
import NotLoggedRoute from './utils/routes/NotLoggedRoute';
import PasswordRecovery from './pages/PasswordRecovery';
import UpdatePassword from './pages/UpdatePassword';
import IndividualSearch from './pages/IndividualSearch';
import Profile from './pages/Profile';
import TeamSearchContext from './utils/TeamSearchContext';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import ICompleteTeamData from './utils/types/team/ICompleteTeamData';
import TeamSearchIndexContext from './utils/TeamSearchIndexContext';
import Search from './pages/Search';
import TeamSearchPageContext from './utils/TeamSearchPageContext';
import Connections from './pages/Connections';
import UserDataContext from './utils/UserDataContext';
import socketRouter from './services/socket/socketRouter';
import ErrorContext from './utils/ErrorContext';
import ChatContext from './utils/ChatContext';
import InterestContext from './utils/InterestContext';
import setupSocket from './services/socket/setupSocket';
import PreferencesRoute from './utils/routes/PreferencesRoute';
import AboutUs from './pages/AboutUs';
import Chat from './pages/Chat';
import SocketContext from './utils/SocketContext';
import SignUpModerator from './pages/SignUpModerator';
import AllReports from './pages/AllReports';
import IUserTeamData from './utils/types/team/IUserTeamData';
import isModerator from './utils/functions/isModerator';
import Report from './pages/Report';
import ViewTeams from './pages/ViewTeams';
import ProfileModerator from './pages/ProfileModerator';
import Posts from './pages/Posts';
import Courses from './pages/Courses';
import Ban from './pages/Ban';
import AlertContext from './utils/AlertContext';

export default function Routes() {
  const search = useState<ICompleteTeamData[]>([]);
  const searchIndex = useState(0);
  const searchPage = useState(1);
  const connected = useRef(false);
  const user = useContext(UserDataContext)[0];
  const socket = useContext(SocketContext);
  const setError = useContext(ErrorContext)[1];
  const [ teams, setTeams ] = useContext(ChatContext);
  const [ interest, setInterest ] = useContext(InterestContext);
  const [ alert, setAlert ] = useContext(AlertContext);
  const mounted = useRef(false);

  const socketRouterMemo = useCallback(socketRouter, [ teams ]);

  //TEAM-ONLY
  useEffect(() => {
    mounted.current = true;
    if (!!user && !isModerator(user) && !connected.current && mounted.current) {
      setupSocket().then(newSocket => {
        socket.current = newSocket;
        socketRouterMemo([ teams, setTeams ], [ interest, setInterest ], [ alert, setAlert ], user, newSocket);
      }).catch(() => {
        setError({ value: "Oops, as funcionalidades de chat podem não estar disponíveis no momento..." });
      });
      connected.current = true;
    }
    return () => {
      mounted.current = false;
    }
  }, [ user ]);

  //TEAM-ONLY
  useEffect(() => {
    if (!!user && !isModerator(user)) {
      const itens = [];
      if (!(user as IUserTeamData).portfolio) {
        itens.push("portfólio");
      }
      if (!!(user as IUserTeamData).theme && !(user as IUserTeamData).themeDescription) {
        itens.push("descrição do tema")
      }
      const missingMemberDescription = (user as IUserTeamData).members.some(e => !e.description);
      if (missingMemberDescription) {
        itens.push("descrição dos integrantes");
      }
      if (itens.length > 0) {
        setError({ 
          value: `Melhore sua visibilidade! Preencha os seguintes itens no seu perfil: ${itens.join(", ")}.`,
          type: 'warning'  
        }, 15000);
      }
    }
  }, [ user ]);

  //TEAM-ONLY
  useEffect(() => {
    if (user && !isModerator(user) && localStorage.getItem('isInNewAgreement') !== user.id && (user as IUserTeamData).isInAgreement) {
      setAlert({
        title: "Você está em um acordo!",
        message: "Parabéns! Você acaba de iniciar um acordo com uma equipe. Para acessar o email dos orientadores da equipe parceira vá até o perfil dela."
      });
      localStorage.setItem('isInNewAgreement', user.id);
    }
  }, [ user ]);

  //TEAM-ONLY
  useEffect(() => {
    if (socket.current) {
      socketRouterMemo([ teams, setTeams ], [ interest, setInterest ], [ alert, setAlert ], user, socket.current);
    }
  }, [ teams, interest, socket.current ]);

  const teamRoutes = [
    <ProtectedRoute path="/perfil" component={Profile} key="/perfil" />,
    <ProtectedRoute path="/conexoes" component={Connections} key="/conexoes" />,
    <ProtectedRoute path="/chat/:id" component={Chat} key="/chat/:id" />
  ];

  const moderatorRoutes = [
    <ProtectedRoute path="/denuncias" component={AllReports} key="/denuncias"/>,
    <ProtectedRoute path="/denuncia/:id" component={Report} key="/denuncia"/>,
    <ProtectedRoute path="/ver-equipes" component={ViewTeams} key="/ver-equipes"/>,
    <ProtectedRoute path="/cursos" component={Courses} key="/denuncias"/>,
    <ProtectedRoute path="/postagens" component={Posts} key="/postagens" />,
    <ProtectedRoute path="/perfil-moderador" component={ProfileModerator} key="/perfil-moderador" />
  ];

  const [ currentRoutes, setCurrentRoutes ] = useState<JSX.Element[]>();
  //manages the current routes based on what sort of user is logged in at the moment
  useEffect(() => {
    if (mounted.current && user) {
      if (isModerator(user)) {
        setCurrentRoutes(moderatorRoutes);
      } else {
        setCurrentRoutes(teamRoutes);
      }
    }
  }, [ user ]);

  return (
    <Switch>
      <NotLoggedRoute exact path="/" component={LandingPage} />
      <NotLoggedRoute path="/cadastro" component={SignUpUser} />
      <NotLoggedRoute path="/login" component={Login} />
      <NotLoggedRoute path="/cadastro-moderador" component={SignUpModerator} />
      <ValidateEmailRoute path="/validar-email" component={ValidateEmail} key="/validar-email" />
      <ConfirmEmailRoute path="/confirmar-email/:token" component={ConfirmEmail} key="/confirmar-email/:token" />
      <PreferencesRoute path="/preferencias" component={Preferences} key="/preferencias" />,
      <Route path="/esqueci-minha-senha" component={PasswordRecovery} />
      <Route path="/recuperar-senha/:token" component={UpdatePassword} />
      <Route path="/banido" component={Ban} />
      <Route path="/sobre-nos" component={AboutUs} key="/sobre-nos" />,
      { currentRoutes }
      <TeamSearchPageContext.Provider value={searchPage} key="context">
        <TeamSearchIndexContext.Provider value={searchIndex}>
          <TeamSearchContext.Provider value={search}>
            <ProtectedRoute path="/equipes" component={Search} />
            <ProtectedRoute path="/equipe/:id" component={IndividualSearch} />
            <ProtectedRoute path="/equipe" exact component={IndividualSearch} />
          </TeamSearchContext.Provider>
        </TeamSearchIndexContext.Provider>
      </TeamSearchPageContext.Provider>   
    </Switch>
  );
}