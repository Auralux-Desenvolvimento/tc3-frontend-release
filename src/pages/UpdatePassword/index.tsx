import { useRef, useState } from 'react';
import * as Yup from 'yup';
import SingleMessage from '../../components/SingleMessage';
import { Form, Field, Formik, ErrorMessage, FormikHelpers, FieldProps, FormikErrors } from 'formik';
import { FloatInput } from '../../components/FloatingLabelInput';
import IAppError from '../../utils/types/API/IAppError';
import IFormStatus from '../../utils/types/IFormStatus';
import Loading from '../../components/Loading';
import FormMessage from '../../components/FormMessage';
import recoveryPassword from '../../services/passwordRecovery/newPassword/postNewPassword';
import { AxiosError } from 'axios';
import { Link } from 'react-router-dom';

import './style.css';

interface INewPassword {
  password: string;
  confirmPassword?: string;
}

const newPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Mínimo de 8 caracteres")
    .max(30, "Máximo de 30 caracteres")
    .required("Campo obrigatório"),
  confirmPassword: Yup.string()
    .required("Campo obrigatório")
    .oneOf([Yup.ref("password"), null], "As senhas não são iguais")
});
export default function UpdatePassword() {
  const mounted = useRef(true);
  const pathTokenURL = window.location.pathname;
  const pathTokenSplit = pathTokenURL.split("/");
  const pathToken = pathTokenSplit[2];
  const [ submitted, setSubmitted ] = useState(false);

  async function handleSubmit (
    { password }: INewPassword,
    { setStatus, setErrors }: FormikHelpers<INewPassword>
  ) {
    try {
      await recoveryPassword(password, pathToken);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      if (mounted.current) {
        switch (error.response?.data.code) {
          case 1:
            return setStatus({
              message: "Link de confirmação incorreto.",
              state: "error"
            } as IFormStatus);
          case 2:
            return setErrors({
              password: "Formato da senha inválido."
            });
          case 3:
            return setStatus({
              message: "Esse link de recuperação de senha não existe.",
              state: "error"
            } as IFormStatus);
          case 4:
            return setStatus({
              message: "Link de recuperação de senha expirado.",
              state: "error"
            } as IFormStatus);
          case 5:
            return setErrors({
              password: "A nova senha não pode ser igual a uma senha anterior."
            });
          default:
            return setStatus({
              message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
              state: "error"
            } as IFormStatus);
        }
      }
    }
    setSubmitted(true);
    return setStatus({
      message: "Senha alterada com sucesso!",
      state: "success"
    });
  }

  return (
    <SingleMessage className="update-password" title="Cadastre uma nova senha">
      <Formik
        initialValues={{
          password: "",
          confirmPassword: ""
        } as INewPassword}
        onSubmit={handleSubmit}
        validationSchema={newPasswordSchema}
      >
        {({ isSubmitting, status }) => (
          <Form className="recovery-password-form">
            <Field name="password">{({ field }: FieldProps) => (
              <FloatInput
                label="Digite a nova senha"
                errorDisplay={
                  <div>
                    <ErrorMessage name="password" />
                  </div>
                }
              >
                <input type="password" {...field} />
              </FloatInput>
            )}</Field>

            <Field name="confirmPassword">{({ field }: FieldProps) => (
              <FloatInput
                label="Confirme a nova senha"
                errorDisplay={
                  <div>
                    <ErrorMessage name="confirmPassword" />
                  </div>
                }
              >
                <input type="password" {...field} />
              </FloatInput>
            )}</Field>
            {(status) &&
              <FormMessage message={status?.message} state={status?.state} />
            }
            {status && status.state === "success" &&
              <Link to='/login' className='responsive-button'>Entrar</Link>
            }
            {isSubmitting
              ? <Loading className="loading-password-recovery"/>
              : !submitted
              ? <button className="responsive-button" type="submit">Enviar</button>
              : null              
            }
          </Form>
        )}
      </Formik>
    </SingleMessage>
  )
}