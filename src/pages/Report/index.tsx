import { Icon } from "@iconify/react";
import { AxiosError } from "axios";
import { FormikConfig } from "formik";
import cloneDeep from "lodash.clonedeep";
import { FC, Fragment, useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../../components/Footer";
import Message from "../../components/Message";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import ReportedTeamCard, { ReportState } from "../../components/ReportedTeamCard";
import banTeam from "../../services/moderator/banTeam";
import getReportById, { IGetReportByIdResponse } from "../../services/report/getReportById";
import postResolve from "../../services/report/postResolve";
import postTakeover from "../../services/report/postTakeover";
import ErrorContext from "../../utils/ErrorContext";
import IAppError from "../../utils/types/API/IAppError";
import IUserModeratorData from "../../utils/types/moderator/IUserModeratorData";
import UserDataContext from "../../utils/UserDataContext";
import "./style.css";

const Report: FC = () => {
  const pathName = window.location.pathname;
  const pathNameSplit = pathName.split("/");
  const pathId = pathNameSplit[2];
  const mounted = useRef(false);
  const [ report, setReport ] = useState<IGetReportByIdResponse>();
  const user = useContext(UserDataContext)[0];
  const setGlobalError = useContext(ErrorContext)[1];

  useEffect(() => {
    mounted.current = true;

    getReportById(pathId).then(response => {
      mounted.current && setReport(response.data);
    }).catch(() => {
      mounted.current && setGlobalError({ value: "Oops... Algo de errado aconteceu, tente novamente mais tarde." });
    });

    return () => { mounted.current = false; }
  }, []);

  async function handleTakeover () {
    if (report) {
      try {
        await postTakeover(report.id);
      } catch {
        mounted.current && setGlobalError({ value: "Oops... Algo de errado aconteceu, tente novamente mais tarde." });
      }

      const newReport = cloneDeep(report);
      newReport.moderatorId = (user as IUserModeratorData).id;
      setReport(newReport);
    }
  } 

  async function handleResolve () {
    if (report) {
      try {
        await postResolve(report.id);
      } catch {
        mounted.current && setGlobalError({ value: "Oops... Algo de errado aconteceu, tente novamente mais tarde." });
      }

      const newReport = cloneDeep(report);
      newReport.isResolved = true;
      setReport(newReport);
    }
  } 

  let reportState: keyof typeof ReportState = "fromAnotherModerator";
  if (!report?.isResolved) {
    if (report?.moderatorId) {
      if (report?.moderatorId === (user as IUserModeratorData).id) {
        reportState = "fromSelf";
      }
    } else {
      reportState = "unattended"
    }
  }

  let actionButton = null;
  if (reportState === "fromSelf") {
    actionButton = (
      <button className="responsive-button" onClick={handleResolve}>Resolver denúncia</button>
    );
  } else if (reportState === "unattended") {
    actionButton = (
      <button className="responsive-button" onClick={handleTakeover}>Assumir denúncia</button>
    );
  }

  let currentDate: string;

  async function BanTeam(id?: string) {
    if (id) {
      try {
        await banTeam(id);
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
      return setGlobalError({value: "Usuário banido com sucesso.", type: "success"});
    }
  }

  return (
    <div className="page report-page">
      <ModeratorNavbar locale="reports" />
      <div className="content">
        <div className="report-header">
          <Link className="return-wrapper" to="/denuncias">
            <Icon className="return" icon="bi:arrow-left-short" />
          </Link>
          <h1 className="title">Denúncia</h1>
          <p className="code">Código: {report?.id}</p>
          <p className="date">Feita em: {report?.createdAt.toLocaleDateString()}</p>
        </div>
        
        <hr className="hr" />

        <div className="report-body">
          <div className="report">
            <h1 className="title">Denunciante</h1>
            <ReportedTeamCard 
              id={report?.reporter?.id}
              logoURL={report?.reporter?.logoURL}
              name={report?.reporter?.name}
              course={report?.reporter?.course}
              theme={report?.reporter?.theme}
              reportState={reportState}
              onBan={() => BanTeam(report?.reporter?.id)}
            />
          </div>

          <div className="report">
            <h1 className="title">Denunciado</h1>
            <ReportedTeamCard 
              id={report?.reported.id}
              logoURL={report?.reported.logoURL}
              name={report?.reported.name}
              course={report?.reported.course}
              theme={report?.reported.theme}
              reportState={reportState}
              onBan={() => BanTeam(report?.reported.id)}
            />
          </div>
        </div>

        <div className="report-message">
          <h1 className="title">Mensagem</h1>
          <p className="message">{report?.message}</p>
        </div>

        {report?.chatHistory &&
          <div className="chat-history">
            <h1 className="title">Histórico do chat</h1>
            <div className="info">
              <p className="chat-data"><strong>Data do primeiro contato: </strong> {report?.chatHistory?.createdAt.toLocaleDateString()}</p>
              <p className="chat-data"><strong>Data do último contato: </strong> {report?.chatHistory.messages[report?.chatHistory.messages.length - 1].createdAt.toLocaleDateString()}</p>
              <p className="chat-data"><strong>Está ativo? </strong> {report?.chatHistory?.isActive ? "Sim" : "Não"}</p>
            </div>
            <div className="chat-container">
              <div className="chat-header">
                <p className="team-name">{report?.reported.name}</p>
                <p className="team-name">{report?.reporter?.name}</p>
              </div>
              <div className="chat">
                {report.chatHistory.messages.map(e => {
                  const message = 
                  (<Message 
                    key={Math.random()}
                    content={e.content} 
                    isMine={e.sender === report.reporter?.id}
                    time={e.createdAt}
                  />);  

                  const date = e.createdAt.toDateString() === new Date().toDateString()
                    ? "Hoje"
                    : e.createdAt.toLocaleDateString();
                  if (date !== currentDate) {
                    currentDate = date;
                    return (
                    <Fragment key={Math.random()}>
                      <div className="date">{date}</div>
                      {message}
                    </Fragment>
                    );
                  } else {
                    return message;
                  }
                })}
              </div>
            </div>

          </div>
        }
        { actionButton }
      </div>
      <Footer />
    </div>
  );
}

export default Report;