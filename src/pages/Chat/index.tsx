import { Icon } from "@iconify/react";
import Footer from "../../components/Footer";
import Navbar from "../../components/Navbar";
import Report from "../../components/Modals/Report";
import { FC, Fragment, useContext, useEffect, useRef, useState } from "react";
import './style.css';
import Message from "../../components/Message";
import { Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import { FloatInput } from "../../components/FloatingLabelInput";
import * as yup from "yup";
import SocketContext from "../../utils/SocketContext";
import { Link, useParams } from "react-router-dom";
import IMessagePublish from "../../utils/types/chat/IMessagePublish";
import ChatContext from "../../utils/ChatContext";
import UserDataContext from "../../utils/UserDataContext";
import UseState, { SetUseState } from "../../utils/types/UseState";
import IUserTeamData from "../../utils/types/team/IUserTeamData";
import useWindowScroll from "../../utils/hooks/useWindowScroll";
import IAppError from "../../utils/types/API/IAppError";
import ErrorContext from "../../utils/ErrorContext";
import ITeam, { IAgreement } from "../../utils/types/chat/ITeam";
import cloneDeep from "lodash.clonedeep";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale"
import AlertContext from "../../utils/AlertContext";
import { SetGlobalError } from "../../utils/hooks/useGlobalError";

interface IFormValues {
  message: string;
}

const schema = yup.object().shape({
  message: yup.string()
    .required()
});

export interface IChatLocationState {
  id: string;
}

const useCurrentTeam = ([ teams, setTeams ]: UseState<ITeam[]>, id?: string): UseState<ITeam|undefined> => {
  const [ teamIndex, setTeamIndex ] = useState(getTeamIndex());
  const [ currentTeam, setCurrentTeam ] = useState<ITeam | undefined>(
    typeof teamIndex === "number" 
    ? teams[teamIndex] 
    : undefined
  );

  function getTeamIndex () {
    const innerIndex = teams?.findIndex(e => e.id === id);
    if (typeof innerIndex !== "number" || innerIndex < 0) {
      return undefined;
    } else {
      return innerIndex;
    }
  }

  const setTeam: SetUseState<ITeam|undefined> = (team?: ITeam) => {
    if (typeof teamIndex === "number" && team) {
      const newTeams = cloneDeep(teams);
      newTeams[teamIndex] = team;
      setTeams(newTeams);
    }
  }

  //updates teamIndex and currentTeam
  useEffect(() => {
    const index = getTeamIndex();
    setTeamIndex(index);
    setCurrentTeam(
      typeof index === "number"
      ? teams[index]
      : undefined
    );
  }, [ teams, id ]);

  return [ currentTeam, setTeam ];
}

//will maintain all the boring logic behind this useRef
const useIsAvailable = (teams: ITeam[], setGlobalError: SetGlobalError, currentTeam?: ITeam) => {
  const [ isAvailable, setIsAvailable ] = useState(currentTeam?.status === "active" || currentTeam?.status === "inactive");

  useEffect(() => {
    if (currentTeam && currentTeam.status !== "active" && currentTeam.status !== "inactive") {
      setGlobalError({ value: "Essa equipe não está disponível para conversa..." }, 0);
      setIsAvailable(false);
    } else {
      setIsAvailable(true);
    }
  }, [ currentTeam, teams ]);

  return isAvailable;
}

const Chat: FC = () => {
  const { id } = useParams<{ id?: string }>();
  const [ team ] = useContext(UserDataContext) as UseState<IUserTeamData>;
  const [ teams, setTeams ] = useContext(ChatContext);
  const [ globalError, setGlobalError ] = useContext(ErrorContext);
  const [ alert, setAlert ] = useContext(AlertContext);
  const [ agreementButton, setAgreementButton ] = useState(<></>);
  const [ showScrollDown, setShowScrollDown ] = useState(false);
  const [ reportModal, setReportModal ] = useState(false);
  const socket = useContext(SocketContext);
  const firstScroll = useRef(false);
  const scroll = useWindowScroll();
  const [ currentTeam, setCurrentTeam ] = useCurrentTeam([ teams, setTeams ], id);

  const mounted = useRef(false);
  const isAvailable = useIsAvailable(teams, setGlobalError, currentTeam);

  //sets the listener to errors up
  useEffect(() => {
    mounted.current = true;
    socket.current?.off("user/message/error");
    socket.current?.off("user/agreement/propose/error");
    socket.current?.off("user/agreement/accept/error");
    socket.current?.off("user/agreement/rejection/error");
    socket.current?.off("user/agreement/cancel/error");
    socket.current?.off("user/message/seen/error");

    socket.current?.on("user/message/error", ({ code }: IAppError) => {
      switch (code) {
        case -2:
          mounted.current && setGlobalError({ value: "Profanidade detectada." });
          if (currentTeam) {
            currentTeam.messages.pop();
            mounted.current && setCurrentTeam(currentTeam);
          }
          break;
        default:
          mounted.current && setGlobalError({ value: "Houve um erro ao enviar a mensagem" });
          break;
      }
    });

    socket.current?.on("user/agreement/propose/error", ({ code }: IAppError) => {
      if (currentTeam) {
        currentTeam.agreement = undefined;
        mounted.current && setCurrentTeam(currentTeam);
        switch (code) {
          case 1:
            mounted.current && setGlobalError({ value: "Já existe um pedido de acordo pendente entre vocês." });
            break;
          case 2:
            mounted.current && setGlobalError({ value: "Você ainda não iniciou uma conversa com essa equipe... Converse com essa equipe e depois tente novamente." });
            break;
          default:
            mounted.current && setGlobalError({ value: "Houve um erro ao propor o acordo" });
            break;
        }
      }
    });

    socket.current?.on("user/agreement/accept/error", ({ code }: IAppError) => {
      if (currentTeam) {
        if (!!currentTeam.agreement) {
          (currentTeam.agreement as IAgreement).status = "pending"
          mounted.current && setCurrentTeam(currentTeam);
        }
        switch (code) {
          case 0:
            mounted.current && setGlobalError({ value: "Você ainda não iniciou uma conversa com essa equipe... Converse com essa equipe e depois tente novamente." });
            break;
          case 1:
            mounted.current && setGlobalError({ value: "Não existe proposta de acordo para ser aceita." });
            break;
          default:
            mounted.current && setGlobalError({ value: "Houve um erro ao aceitar o acordo" });
            break;
        }  
      }
    });

    socket.current?.on("user/agreement/rejection/error", ({ code }: IAppError) => {
      if (currentTeam) {
        if (!!currentTeam.agreement) {
          (currentTeam.agreement as IAgreement).status = "pending"
          mounted.current && setCurrentTeam(currentTeam);
        }
        switch (code) {
          case 0:
            mounted.current && setGlobalError({ value: "Não existe proposta de acordo para ser recusada." });
            break;
          case 1:
            mounted.current && setGlobalError({ value: "Você ainda não iniciou uma conversa com essa equipe... Converse com essa equipe e depois tente novamente." });
            break;
          default:
            mounted.current && setGlobalError({ value: "Houve um erro ao aceitar o acordo" });
            break;
        }  
      }
    });

    socket.current?.on("user/agreement/cancel/error", ({ code }: IAppError) => {
      if (currentTeam) {
        if (!!currentTeam.agreement) {
          (currentTeam.agreement as IAgreement).status = "active";
          mounted.current && setCurrentTeam(currentTeam);
        }
        switch (code) {
          case 0:
            mounted.current && setGlobalError({ value: "Não existe proposta de acordo para ser cancelada." });
            break;
          case 1:
            mounted.current && setGlobalError({ value: "Você ainda não iniciou uma conversa com essa equipe... Converse com essa equipe e depois tente novamente." });
            break;
          default:
            mounted.current && setGlobalError({ value: "Houve um erro ao aceitar o acordo" });
            break;
        }  
      }
    });

    socket.current?.on("user/message/seen/error", () => {
      mounted.current && setGlobalError({ value: "Algo deu errado... Por favor atualize a página." });
    });

    return () => {
      socket.current?.off("user/message/error");
      socket.current?.off("user/agreement/propose/error");
      socket.current?.off("user/agreement/accept/error");
      socket.current?.off("user/agreement/rejection/error");
      socket.current?.off("user/agreement/cancel/error");
      socket.current?.off("user/message/seen/error");
      mounted.current = false;
    }
  }, [ currentTeam, teams ]);

  //marks all messages as read
  useEffect(() => {
    if (
      mounted.current
      && currentTeam
      && currentTeam.messages.length > 0
      && currentTeam.messages[currentTeam.messages.length - 1].from === currentTeam.id
    ) {
      //server-side
      socket.current?.emit("user/message/seen", currentTeam.chatId);

      //client-side
      const wasNotSeen = currentTeam.messages.slice().reverse().some(e => e.from === currentTeam.id && !e.seen);
      if (wasNotSeen) {
        currentTeam.messages.map(e => {
          if (e.from === currentTeam.id) {
            e.seen = true;
          }
          return e;
        });
        setCurrentTeam(currentTeam);
      }
    }
  }, [ currentTeam ])

  //scrolls down when the page is first loaded
  useEffect(() => {
    if (!firstScroll.current) {
      mounted.current && scrollToBottom();
      firstScroll.current = false;
    }
  }, [ teams ])

  //makes a "scroll down" button appear when scroll is too high
  useEffect(() => {
    if (document.body.scrollHeight - scroll > 900) {
      mounted.current && setShowScrollDown(true);
    } else {
      mounted.current && setShowScrollDown(false);
    }
  }, [ scroll ]);

  //manages the agreementButton state by the "currentTeam.agreement" value
  useEffect(() => {
    // currentTeam = typeof teamIndex === 'number' ? teams[teamIndex] : undefined;
    const currentState = currentTeam && currentTeam?.agreement
    ? currentTeam?.agreement.status || undefined
    : undefined;
    switch (currentState) {
      case "active":
        setAgreementButton(
          <button 
            onClick={() => handleCancelAgreement()} 
            className="cancel-agreement" 
            type="button"
          >
            Cancelar Acordo
          </button>
        );
        break;
      case "cancelled":
        setAgreementButton(<p className="canceled-agreement">O acordo com essa equipe foi cancelado</p>)
        break;
      case "pending":
        setAgreementButton(<>
          <button 
            onClick={() => handleRejectAgreement()} 
            className="reject-agreement" 
            type="button"
          > 
            Rejeitar Acordo
          </button>
          {
            currentTeam?.agreement && currentTeam?.agreement.agent !== team.id &&
            <button 
              onClick={() => handleAcceptAgreement()} 
              className="accept-agreement" 
              type="button"
            > 
              Aceitar Acordo
            </button>
          }
        </>)
        break;
      case "rejected":
        setAgreementButton(<p className="rejected-agreement">O acordo com essa equipe foi rejeitado</p>)
        break;
      case undefined:
        setAgreementButton(
          <button 
            onClick={() => handleProposeAgreement()} 
            className="agreement-button" 
            type="button"
          > 
            Firmar Acordo
          </button>
        );
    }
  }, [ teams, currentTeam ]);

  function handleSubmit (
    { message }: IFormValues,
    { resetForm }: FormikHelpers<IFormValues>
  ) {
    if (mounted.current && id && currentTeam) {
      socket.current?.emit("user/message", {
        content: message,
        to: id 
      } as IMessagePublish);

      currentTeam.messages.push({
        content: message,
        from: team.id,
        createdAt: new Date(),
        seen: false
      })
      mounted.current && setCurrentTeam(currentTeam);

      if (globalError) {
        setGlobalError(undefined);
      }
      mounted.current && resetForm();
    }
  }

  function handleProposeAgreement () {
    if (mounted.current && id && currentTeam) {
      socket.current?.emit("user/agreement/propose", currentTeam.id);
      
      currentTeam.agreement = {
        agent: team.id,
        status: "pending"
      };
      mounted.current && setCurrentTeam(currentTeam);

      if (globalError) {
        setGlobalError(undefined);
      }
    }
  }

  function handleAcceptAgreement () {
    if (mounted.current && id && currentTeam) {
      socket.current?.emit("user/agreement/accept", currentTeam.id);

      const newTeams = cloneDeep(teams);
      newTeams.map(e => {
        if (e.id === currentTeam.id) {
          (e.agreement as IAgreement).status = "active";
        } else {
          e.status = "inAgreement";
        }
        return e;
      });
      mounted.current && setTeams(newTeams);

      if (globalError) {
        setGlobalError(undefined);
      }

      setAlert({
        title: "Você está em um acordo!",
        message: "Parabéns! Você acaba de iniciar um acordo com uma equipe. Para acessar o email dos orientadores da equipe parceira vá até o perfil dela."
      })
      localStorage.setItem("isInNewAgreement", team.id);
    }
  }

  function handleRejectAgreement () {
    if (mounted.current && id && currentTeam) {
      socket.current?.emit("user/agreement/reject", currentTeam.id);

      (currentTeam.agreement as IAgreement).status = "rejected";
      mounted.current && setCurrentTeam(currentTeam);

      if (globalError) {
        setGlobalError(undefined);
      }
    }
  }

  function handleCancelAgreement () {
    if (mounted.current && id && currentTeam) {
      socket.current?.emit("user/agreement/cancel", currentTeam.id);

      (currentTeam.agreement as IAgreement).status = "cancelled";
      mounted.current && setCurrentTeam(currentTeam);

      if (globalError) {
        setGlobalError(undefined);
      }
    }
  }

  function scrollToBottom (smooth: boolean = false) {
    mounted.current && window.scrollTo({
      top: document.body.scrollHeight,
      behavior: smooth ? "smooth" : "auto"
    });
    mounted.current && setShowScrollDown(false);
  }

  let status;
  let isOnline = !!currentTeam?.connected;
  status = (
    <div className={`status ${isOnline ? "online" : "offline"}`}>{
      isOnline
      ? <>online</>
      : currentTeam
      ? <>Visto por último: {formatDistanceToNow(currentTeam?.lastSeen, { locale: ptBR })}</>
      : <>offline</>
    }</div>
  );

  let currentDate: string;

  return (
    <div className="chat-page page">
      <Navbar locale="connections">
        <div className="chat-header">
          <Link className="return-wrapper" to="/conexoes">
            <Icon className="return" icon="bi:arrow-left-short" />
          </Link>
          <div className="team-name">
            <Link className="title" to={currentTeam ? `/equipe/${currentTeam.id}` : ""}>
              <h2>{currentTeam ? currentTeam.name : ""}</h2>
            </Link>
            {status}
          </div>
          {isAvailable && agreementButton}
          <button
            className="report-team"
            type="button"
            onClick={() => setReportModal(true)}
          >
            Denunciar equipe
          </button>
        </div>
      </Navbar>
      <div className="chat">
        {
        currentTeam && currentTeam?.messages
        ? currentTeam.messages.map(e => {
            const message = (
              <Message 
                key={Math.random()} 
                content={e.content} 
                isMine={e.from !== id}
                time={e.createdAt}
                seen={e.seen}
              />
            );

            const date = e.createdAt.toDateString() === new Date().toDateString()
            ? "Hoje"
            : e.createdAt.toLocaleDateString();
            if (date !== currentDate) {
              currentDate = date;
              return (<Fragment key={Math.random()}>
                <div className="date">{date}</div>
                {message}
              </Fragment>);
            } else {
              return message;
            }
          }) 
        : <div className="no-messages">
            <p className="start-conversation">Vocês ainda não conversaram. Comece uma conversa enviando uma mensagem!</p>
          </div>
        }
      </div>
      <div className="controls-wrapper">{isAvailable &&
        <Formik
          initialValues={{
            message: ""
          } as IFormValues}
          onSubmit={handleSubmit}
          validationSchema={schema}
        >{() => (<>
          <Form className="controls">
            <Field name="message">{({ field }: FieldProps) => (
              <FloatInput
                label="Digite uma mensagem"
              >
                <input {...field} autoComplete="off" />
              </FloatInput>
            )}</Field>
            <button>
              <Icon icon="mdi:send-circle" />
            </button>
          </Form>
        </>)}</Formik>
      }</div>
      <Footer />
      {
        currentTeam && currentTeam?.id
        ? <Report
            reportedId={currentTeam.id}
            chatId={currentTeam.chatId}
            openState={[reportModal, setReportModal]}
          />
        : null
      }
      {
        showScrollDown &&
        <button className="scroll-down-wrapper" onClick={() => scrollToBottom(true)}>
          <Icon
            className="scroll-down"
            icon="eva:arrow-down-fill"
          />
        </button>
      }
    </div>
  )
}
export default Chat;