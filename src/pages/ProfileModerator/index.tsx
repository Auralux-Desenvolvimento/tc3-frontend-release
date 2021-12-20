import { useContext, useEffect, useRef, useState } from "react";
import Footer from "../../components/Footer";
import EditProfileModerator from "../../components/Modals/EditProfileModerator";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import UserDataContext from "../../utils/UserDataContext";
import IUserModeratorData from "../../utils/types/moderator/IUserModeratorData";
import getKeys, { IGetKeysResponse } from "../../services/moderator/getKeys";
import getKey from "../../services/moderator/getKey";
import SimpleBar from "simplebar-react";
import 'simplebar/dist/simplebar.min.css';
import logoff from "../../services/team/getLogoff";
import cloneDeep from "lodash.clonedeep";
import getCountKeys from "../../services/moderator/getCountKeys";

import '../../assets/css/teamView.css';
import './style.css';
import { Icon } from "@iconify/react";
import ErrorContext from "../../utils/ErrorContext";
import PageSelector from "../../components/PageSelector";

export default function ProfileModerator () {
  const [ editProfileModeratorModal, setEditProfileModeratorModal ] = useState(false);
  const [ keys, setKeys ] = useState<IGetKeysResponse[]>();
  const user = useContext(UserDataContext)[0] as IUserModeratorData;
  const [ page, setPage ] = useState<number>(1);
  const setGlobalError = useContext(ErrorContext)[1];
  const mounted = useRef(false);
  const [ keysCount, setKeysCountState ] = useState<number>(0);

  useEffect(() => {
    mounted.current = true;

    if(mounted.current) {
      handleGetKeys();
      getCountKeys().then(response => {
        setKeysCountState(response.data);
      }).catch(() => {
        setKeysCountState(0)
      })
    }
    return () => { mounted.current = false; }
  }, [ page ]);

  useEffect(() => {
    mounted.current = true;

    return () => { mounted.current = false; }
  }, [ ]);

  async function handleGenerateKey() {
    let newKey;
    try {
      newKey = await getKey();
    } catch {
      setGlobalError({ value: "Oops... Algo de errado ocorreu ao gerar a chave. Tente novamente" });
    }

    if(keys && keys.length > 0 && newKey) {
      let key = {
        key: newKey.data,
        issuer: {
          name: user.name,
          email: user.email
        }
      } as IGetKeysResponse;

      let newKeys = cloneDeep(keys);
      newKeys.push(key);
      setKeys(newKeys);
    }
  }

  async function handleGetKeys() {
    try {
      const response = await getKeys(page);
      setKeys(response.data);
    } catch {
      setKeys([]);
    }
  }

  async function handleLogoff() {
    try {
      await logoff();
      window.location.href = '/';
    } catch {
      setGlobalError({ value: "Ops... Algo deu errado. Tente novamente mais tarde..." });
    }
  }

  return (
    <div className="mod-profile-page page">
      <ModeratorNavbar locale="profile" />
      <div className="content">
        <div className="profile-info">
          <h1 className="title">Informações do perfil</h1>
          <p className="info"><strong>Nome: </strong>{user ? user.name : "Nome Do Moderador"}</p>
          <p className="info"><strong>Email: </strong>{user ? user.email : "email.do.moderador@email.com"}</p>
          <button type="button" className="responsive-button" onClick={() => setEditProfileModeratorModal(true)}>Editar perfil</button>
          <button
            className="responsive-button exit"
            onClick={handleLogoff}
          >
            <Icon icon="radix-icons:exit" />
            <p>Sair</p>
          </button>
        </div>
        <div className="access-keys">
          <div className="header">
            <h1 className="title">Chaves de acesso</h1>
            <button 
              type="button" 
              className="generate-key"
              onClick={handleGenerateKey}
            >
              Gerar chave
            </button>
          </div>
          <SimpleBar>
            <div className="key-container">
              <p className="keys">Chaves</p>
              <p className="created-by">Gerado por</p>
              <p className="used-by">Usado por</p>

              {
                keys && keys.length > 0
                ?
                  keys.map(e => (
                    <>
                      <p className="key">{e.key}</p>
                      <div className="creator">
                        {
                          e.issuer && e.issuer.name && e.issuer.email 
                          ?
                            <>
                              <p className="creator-name">{e.issuer.name}</p>
                              <p className="creator-email">{e.issuer.email}</p>
                            </>
                          :
                            <p className="creator-name">Chave gerada automaticamente</p>
                        }
                      </div>
                      <div className="user">
                        {
                          e.receiver && e.receiver.name && e.receiver.email 
                          ?
                            <>
                              <p className="user-name">{e.receiver.name}</p>
                              <p className="user-email">{e.receiver.email}</p>
                            </>
                          :
                            <p className="user-name">Chave ainda não utilizada</p>
                        }
                      </div>
                    </>
                  ))
                :
                  <p className="without-keys">Você ainda não gerou nenhuma chave. Gere uma agora!</p>
              }
            </div>
          </SimpleBar>
          {keys && keys.length === 0
          ? null
          : <PageSelector listLength={keysCount} pageState={[ page, setPage ]} />}
        </div>
      </div>
      <Footer />
      <EditProfileModerator 
        openState={[editProfileModeratorModal, setEditProfileModeratorModal]}
      />
    </div>
  )
}