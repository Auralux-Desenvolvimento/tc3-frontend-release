import { Form, Field, Formik, FormikHelpers, FieldProps, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import CustomerDataContext from '../../utils/UserDataContext';
import { useRef, useContext, useEffect } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom';
import { FloatInput } from '../../components/FloatingLabelInput';
import { setCredentials } from '../../utils/functions/manageUserLoginState';
import postLogin from '../../services/login/postLogin';
import IFormStatus from '../../utils/types/IFormStatus';
import './style.css';
import '../../assets/css/initialPages.css';
import FormMessage from '../../components/FormMessage';
import Loading from '../../components/Loading';
import isModerator from '../../utils/functions/isModerator';
import IUserTeamData from '../../utils/types/team/IUserTeamData';
import IUserModeratorData from '../../utils/types/moderator/IUserModeratorData';
import { AxiosError } from 'axios';
import IAppError from '../../utils/types/API/IAppError';
import TopErrorMessage from '../../components/ErrorMessage';

interface IFormValues {
  email: string;
  password: string;
}

export default function Login () {
  const setCustomerData = useContext(CustomerDataContext)[1];
  const mounted = useRef<boolean>();
  const history = useHistory();
  const location = useLocation<{ emailConfirmation?: boolean }>();

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; }
  }, []);

  const handleSubmit = async (
    { email, password }: IFormValues,
    { setStatus }: FormikHelpers<IFormValues>
  ) => {
    try {
      const loginResponse = await postLogin({
        email: email,
        password: password
      });
      if (!isModerator(loginResponse.data)) {
        if (mounted.current) {
          setCustomerData(loginResponse.data);
          setCredentials(true);
          const { isVerified, hasPreferences } = loginResponse.data as IUserTeamData;
          if (!hasPreferences) {
            history.push("/preferencias");
          } else if (!isVerified) {
            history.push("/validar-email");
          } else {
            history.push("/equipes");
          }
        }
      } else {
        if (mounted.current) {
          setCustomerData(loginResponse.data);
          setCredentials(true);
          const { isVerified } = loginResponse.data as IUserModeratorData;
          if (!isVerified) {
            history.push("/validar-email");
          } else {
            history.push("/denuncias");
          }
        }
      }
    } catch (err: any) {
      const error: AxiosError<IAppError> = err;

      switch (error.response?.data.code) {
        case -3:
          return setStatus({
            message: "Você foi banido.",
            state: 'error'
          } as IFormStatus);
        default:
          return setStatus({
            message: "Credenciais inválidas.",
            state: 'error'
          } as IFormStatus);
      }
    }
  }
  
  const LoginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Email inválido")
      .required("Email obrigatório"),
    password: Yup.string()
      .min(8, 'Mínimo de 8 caracteres')
      .max(30, 'Máximo de 30 caracteres')
      .required("Senha obrigatória"),
  })
  
  return (
    <Formik
      initialValues={{
        email: "",
        password: ""
      } as IFormValues}
      onSubmit={handleSubmit}
      validationSchema={LoginSchema}
    >{({ status, isSubmitting }) => (
      <div className="form-page login">
        {
          location.state?.emailConfirmation &&
          <TopErrorMessage message="Faça login antes de confirmar seu email" type="warning" /> 
        }
        <div className="form-container">
          <Form className="form">
            <h1 className="title-initial-page">Entrar na conta</h1>
            <Field name="email">{({ field }: FieldProps) => (
              <FloatInput
                label="E-mail"
                errorDisplay={
                  <div>
                    <ErrorMessage name="email" />
                  </div>
                }
              >
                <input type="text" {...field} />
              </FloatInput>
            )}</Field>

            <Field name="password">{({ field }: FieldProps) => (
              <FloatInput
                label="Senha"
                errorDisplay={
                  <div>
                    <ErrorMessage name="password" />
                  </div>
                }
              >
                <input type="password" {...field} />
              </FloatInput>
            )}</Field>
            <div className="links-login">
              <Link to="/esqueci-minha-senha" className="forgot">Esqueceu a senha?</Link>
              <Link to="/cadastro" className="register-here">Não tem cadastro? Faça aqui</Link>
            </div>
            {status &&
              <FormMessage className="form-message" state={status.state} message={status.message} />
            }
            {isSubmitting
            ? <Loading position="left" />  
            : <button className="responsive-button" type="submit">Entrar</button>
            }
          </Form>
          <div className="background-linear"></div>
        </div>
      </div>
    )}</Formik>
  );
} 