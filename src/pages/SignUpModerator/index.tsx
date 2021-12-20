import { Icon } from "@iconify/react";
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers } from "formik";
import IAppError from "../../utils/types/API/IAppError";
import { AxiosError } from "axios";
import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { FloatInput } from "../../components/FloatingLabelInput";
import FormMessage from "../../components/FormMessage";
import Loading from "../../components/Loading";
import postModerator, { IPostModeratorParams } from "../../services/moderator/postModerator";
import { useContext, useEffect, useRef } from "react";
import UserDataContext from "../../utils/UserDataContext";
import getUserDataWithToken from "../../utils/functions/getUserDataWithToken";
import SocketContext from "../../utils/SocketContext";

interface IFormModeratorValues {
  email: string;
  name: string;
  password: string;
  passwordConfirm: string;
  key: string;
}

const SignUpModeratorSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Mínimo de 2 caracteres")
    .max(50, "Máximo de 50 caracteres")
    .required("Campo obrigatório"),
  email: Yup.string()
    .email("Email Inválido")
    .required("Campo obrigatório"),
  password: Yup.string()
    .min(8, "Mínimo de 8 caracteres")
    .max(30, "Máximo de 30 caracteres")
    .required("Campo obrigatório"),
  passwordConfirm: Yup.string()
    .required("Campo obrigatório")
    .oneOf([Yup.ref("password"), null], "As senhas não são iguais"),
  key: Yup.string()
    .required("Campo obrigatório")
    .uuid("A chave inserida não é válida")
});

export default function SignUpModerator () {
  const mounted = useRef<boolean>();
  const history = useHistory();
  const setUserData = useContext(UserDataContext)[1];
  const socket = useContext(SocketContext);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false }
  }, []);

  async function handleSubmit (
    {
      email,
      name,
      password,
      key
    }: IFormModeratorValues,
    {
      setStatus,
      setErrors
    }: FormikHelpers<IFormModeratorValues>
  ) {

    const postData: IPostModeratorParams = {
      email,
      name,
      password,
      key
    };

    try {
      await postModerator(postData)
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case 1:
          return (
            setStatus({
              message: "Oops... Houve um erro de validação. Cheque se o que você inseriu os dados corretamente."
            })
          )
        case 2:
          return (
            setErrors({
              key: "A chave que você inseriu não existe."
            })
          )
        case 3: 
          return (
            setErrors({
              key: "Esta chave já está em uso."
            })
          )
        default:
          return (
            setStatus({
              message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
              state: "error"
            })
          )
      }
    }
    await getUserDataWithToken(setUserData, history, socket);
    history.push("/validar-email");
  }

  return (
    <div className="form-page register">
      <Formik 
        initialValues={{
          email: "",
          name: "",
          password: "",
          passwordConfirm: "",
          key: ""
        } as IFormModeratorValues}
        onSubmit={handleSubmit}
        validationSchema={SignUpModeratorSchema}
      >
        {({status, isSubmitting}) => {
          return (
            <div className="form-container">
              <Form className="form" action="">
                <h1 className="title-initial-page">Cadastre-se como moderador</h1>
                <Field name="name">{({ field }: FieldProps) => (
                  <div>
                  <Icon icon="icons8:asterisk" className="icon-required" />
                  <FloatInput
                    label="Nome"
                    errorDisplay={
                      <div>
                        <ErrorMessage name="name" />
                      </div>
                    }
                  >
                    <input type="text" {...field} />
                  </FloatInput>
                  </div>
                )}</Field>

                <Field name="email">{({ field }: FieldProps) => (
                  <div>
                  <Icon icon="icons8:asterisk" className="icon-required" />
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
                  </div>
                )}</Field>

                <Field name="password">{({ field }: FieldProps) => (
                  <div>
                    <Icon icon="icons8:asterisk" className="icon-required" />
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
                  </div>
                )}</Field>

                <Field name="passwordConfirm">{({ field }: FieldProps) => (
                  <div>
                    <Icon icon="icons8:asterisk" className="icon-required" />
                    <FloatInput
                      label="Confirme a senha"
                      errorDisplay={
                        <div>
                          <ErrorMessage name="passwordConfirm" />
                        </div>
                      }
                    >
                      <input type="password" {...field} />
                    </FloatInput>
                  </div>
                )}</Field>

                <Field name="key">{({ field }: FieldProps) => (
                  <div>
                  <Icon icon="icons8:asterisk" className="icon-required" />
                  <FloatInput
                    label="Chave de acesso"
                    errorDisplay={
                      <div>
                        <ErrorMessage name="key" />
                      </div>
                    }
                  >
                    <input type="text" {...field} />
                  </FloatInput>
                  </div>
                )}</Field>

                {status &&
                  <FormMessage message={status?.message} state={status?.state} />
                }

                {isSubmitting
                  ? <Loading position="left"/>
                  : <button className="responsive-button" type="submit">Avançar</button>
                }
              </Form>
            </div>
          )
        }}
      </Formik>
      <div className="background-linear-register"></div>
    </div>
  )
}