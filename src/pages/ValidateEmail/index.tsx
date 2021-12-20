import { AxiosError } from "axios";
import { FC, useContext, useEffect, useRef, useState } from "react";
import { Link, Redirect, Route, RouteProps } from "react-router-dom";
import SingleMessage from "../../components/SingleMessage";
import getSendEmail from '../../services/email/getSendEmail';
import IAppError from "../../utils/types/API/IAppError";
import UserDataContext from "../../utils/UserDataContext";
import LoadingPage from "../LoadingPage";
import "./style.css";

export const ValidateEmailRoute: FC<RouteProps> = (props) => {
  const user = useContext(UserDataContext)[0];
  
  const emailToken = sessionStorage.getItem("emailToken");
  if (emailToken) {
    return <Redirect to={`/confirmar-email/${emailToken}`} />;
  }

  if (user && !user.isVerified) {
    return <Route { ...props } />
  } else if (typeof user === "undefined") {
    return <LoadingPage/>;
  } else {
    return <Redirect to="/login" />;
  }
}

export default function ValidateEmail () {
  const mounted = useRef(true);
  const [ success, setSuccess ] = useState<boolean>();
  const [ isLoading, setIsLoading ] = useState<boolean>(true);
  const [ errorMessage, setErrorMessage ] = useState<string>('');


  useEffect(() => {
    mounted.current = true;

    handleSendEmail();

    return () => {mounted.current = false;}
  }, [ ]);

  async function handleSendEmail () {
    try {
      await getSendEmail();
      if (mounted.current) {
        setSuccess(true);
        setIsLoading(false);
      }
    } catch (untypedError) {
      if (mounted.current) {
        setIsLoading(false);
        const error: AxiosError<IAppError> = untypedError as any;
  
        switch (error.response?.data.code) {
          case 0:
            setErrorMessage("Algo deu errado, mas não se preocupe. Estamos fazendo o possível para corrigir o problema. Tente novamente mais tarde");
            break;
          case 2:          
            return setSuccess(true);
          case 3:
            setErrorMessage("Equipe não logada.");
            break;
          default:
            setErrorMessage("Tente novamente mais tarde...");
        }
        setSuccess(false);  
      }
    }
  }
  
  return (isLoading
  ? <LoadingPage />
  : <div className="validate-email">
      <SingleMessage 
        title={
          success
          ? "Um link foi enviado ao e-mail cadastrado" 
          : "Algo deu Errado..."
        }
      >{success 
      ? <>
          <div className="text">
            <p className="main">Acesse o link para a ativação da sua conta!</p>
            <p className="description">O link expira em 30 minutos</p>
          </div>
          <Link 
            className="responsive-button"
            to="/equipes"
            // TODO: redirect to homePage
          >
            Já verifiquei
          </Link>
        </>
      : <p>{errorMessage}</p>
      }</SingleMessage>
    </div>
  )
}