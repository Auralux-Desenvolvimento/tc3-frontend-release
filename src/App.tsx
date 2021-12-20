import { useEffect, useRef, useState } from 'react';
import Routes from './Routes';
import IUserTeamData from './utils/types/team/IUserTeamData';
import UserDataContext from './utils/UserDataContext';
import getUserDataWithToken from './utils/functions/getUserDataWithToken';
import ChatContext from './utils/ChatContext';
import ITeam from './utils/types/chat/ITeam';
import ErrorContext from './utils/ErrorContext';
import useGlobalError from './utils/hooks/useGlobalError';
import SocketContext from './utils/SocketContext';
import IUserModeratorData from './utils/types/moderator/IUserModeratorData';
import IInterest from './utils/types/interest/IInterest';
import InterestContext from './utils/InterestContext';
import { useHistory } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import AlertContext, { IAlert } from './utils/AlertContext';
import Alert from './components/Alert';

export default function App () {
  const [ user, setUser ] = useState<IUserTeamData|IUserModeratorData|undefined|false>();
  const [ teams, setTeams ] = useState<ITeam[]>([]);
  const [ interest, setInterest ] = useState<IInterest[]>([]);
  const [ error, setError ] = useGlobalError();
  const [ alert, setAlert ] = useState<IAlert|undefined>()
  const socket = useRef<Socket>();
  const history = useHistory();

  //check for credentials in localStorage, if there are any, try a GET "/login" and set userState to the response
  useEffect(() => {
    getUserDataWithToken(setUser, history, socket);
  }, [ setUser ]);

  return (
    <>
      <SocketContext.Provider value={socket}>
      <ErrorContext.Provider value={[ error, setError ]}>
      <AlertContext.Provider value={[ alert, setAlert ]}>
      <InterestContext.Provider value={[ interest, setInterest ]}>
      <ChatContext.Provider value={[ teams, setTeams ]}>
      <UserDataContext.Provider value={[ user, setUser ]}>
        <Routes/>
        {
          alert
          ? <Alert 
              title={alert.title}
              closeable
              overlay
            >
              <p>{alert.message}</p>
            </Alert>
          : null
        }
      </UserDataContext.Provider>
      </ChatContext.Provider>
      </InterestContext.Provider>
      </AlertContext.Provider>
      </ErrorContext.Provider>
      </SocketContext.Provider>
    </>
  );
}