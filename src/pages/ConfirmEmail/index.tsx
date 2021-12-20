import { FC, useContext, useEffect, useRef, useState } from 'react';
import SingleMessage from "../../components/SingleMessage";
import confirmEmail from '../../services/email/getEmail';
import LoadingPage from '../../pages/LoadingPage';
import { AxiosError } from 'axios';
import IAppError from '../../utils/types/API/IAppError';
import { Link, Redirect, Route, RouteProps, useParams } from 'react-router-dom';
import "./style.css";
import UserDataContext from '../../utils/UserDataContext';

export const ConfirmEmailRoute: FC<RouteProps> = (props) => {
  const user = useContext(UserDataContext)[0];
  const pathToken = window.location.pathname.split("/")[2];


  if (user && !user.isVerified) {
    return <Route { ...props } />
  } else if (typeof user === "undefined") {
    return <LoadingPage/>;
  } else {    
    // alert("Faça login antes de validar seu email");
    sessionStorage.setItem("emailToken", pathToken);
    return (
      <Redirect 
        to={{
          state: { emailConfirmation: true },
          pathname: "/login",
        }} 
      />
    );
  }
}

export default function ConfirmEmail () {
  const mounted = useRef(true);
  const { token } = useParams<{ token?: string }>();
  const [ successState, setSuccessState ] = useState<boolean>();
  const [ isLoadingState, setIsLoadingState ] = useState<boolean>(true);
  const [ errorMessageState, setErrorMessageState ] = useState<string>('');

  useEffect(() => {
    mounted.current = true;
    handleConfirmToken();
    return () => {mounted.current = false;}
  }, [ ]);

  async function handleConfirmToken () {
    if (!token) {
      return;
    }
    try {
      await confirmEmail(token);
      setSuccessState(true);
      setIsLoadingState(false);      
    } catch (untypedError) {
      setSuccessState(false);
      setIsLoadingState(false);

      const error: AxiosError<IAppError> = untypedError as any;

      switch (error.response?.data.code) {
        case 0:
          return setErrorMessageState("Algo deu errado, mas não se preocupe. Estamos fazendo o possível para corrigir o problema. Tente novamente mais tarde");
        case 1:
          return setErrorMessageState("Link de confirmação de email inválido.");
        case 2:
          return setErrorMessageState("Link de confirmação de email inexistente.");
        case 3:
          return setErrorMessageState("Link de confirmação de email expirado.");
        default:
          return setErrorMessageState("Tente novamente mais tarde");
      }
    }
  }

  return (isLoadingState
  ? <LoadingPage/>
  : <div className="confirm-email">
      <SingleMessage 
        title={successState ? "Parabéns!" : "Algo deu errado..."}
      >
        <p>{successState ? "Seu email foi confirmado!" : errorMessageState}</p>
        {
          successState
          ? <>
              <p className="message">Você pode fazer login agora😊</p>
              <Link to="/login" className="responsive-button">Fazer Login</Link>
            </>
          : null
        }
      </SingleMessage>
    </div>
  )
}