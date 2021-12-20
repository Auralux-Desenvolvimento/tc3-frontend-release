import { useEffect, useRef, useState } from 'react';
import * as Yup from 'yup';
import SingleMessage from '../../components/SingleMessage';
import passwordRecoveryPost, { IPostPasswordRecoveryParams } from '../../services/passwordRecovery/postPasswordRecovery';
import { Form, Field, Formik, ErrorMessage, FormikHelpers, FieldProps } from 'formik';
import './style.css';
import { FloatInput } from '../../components/FloatingLabelInput';
import { AxiosError } from 'axios';
import IAppError from '../../utils/types/API/IAppError';
import IFormStatus from '../../utils/types/IFormStatus';
import Loading from '../../components/Loading';
import FormMessage from '../../components/FormMessage';

interface IPasswordRecovery {
  email: string;
}

const PasswordRecoverySchema = Yup.object().shape({
  email: Yup.string()
    .email("Email inválido")
    .required("Email obrigatório"),
});

export default function PasswordRecovery () {
  const mounted = useRef(true);
  const [ submitted, setSubmitted ] = useState(false);

  useEffect(() => {
    mounted.current = true;

    return () => {mounted.current = false;}
  }, [ ]);

  async function handleSubmit (
    {email}: IPasswordRecovery,
    {
      setStatus,
      setErrors
    }: FormikHelpers<IPasswordRecovery>
  ) {      
    const postData: IPostPasswordRecoveryParams = { email };
    
    try {
      await passwordRecoveryPost(postData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      if (mounted.current) {
        switch (error.response?.data.code) {
          case 1:
            return setStatus({
              message: "O e-mail inserido não está cadastrado.",
              state: "error"
            } as IFormStatus);
          case 2:
            setSubmitted(true);
            return setStatus({
              message: "Já enviamos um link para o seu e-mail nos últimos 30 minutos.",
              state: "success"
            } as IFormStatus);
          case 3:
            return setErrors({
              email: "E-mail inválido."
            });
          default:
            return setStatus({
              message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
              state: "error"
            } as IFormStatus);
        }
      }
    }
    if (mounted.current) {
      setSubmitted(true);
      return setStatus({
        message: "O link para o seu e-mail acabou de ser enviado.",
        state: "success"
      })
    }
  }

  return (
    <SingleMessage
      title="Digite seu e-mail cadastrado para recuperar a senha"
    >
      <Formik
        initialValues={{
          email: ""
        }}
        onSubmit={handleSubmit}
        validationSchema={PasswordRecoverySchema}
      >
        {({ isSubmitting, status }) => (
          <Form className="recovery-password-form">
            <p className="recovery-password-text">Depois que você clicar em enviar, verifique seu e-mail e clique no link que te enviamos.</p>
            <Field name="email">{({ field }: FieldProps) => (
              <FloatInput
                label="E-mail da sua conta"
                errorDisplay={
                  <div>
                    <ErrorMessage name="email" />
                  </div>
                }
              >
                <input type="text" {...field} />
              </FloatInput>
            )}</Field>
            {(status) &&
              <FormMessage message={status?.message} state={status?.state} />
            }
            {isSubmitting
              ? <Loading className="loading-password-recovery" />
              : !submitted
              ? <button className="responsive-button" type="submit">Enviar</button>
              : null
            }
          </Form>
        )}
        
      </Formik>
    </SingleMessage>
  );
}