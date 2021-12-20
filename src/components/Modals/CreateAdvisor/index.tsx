import { ErrorMessage, Field, FieldProps, Form, Formik, FormikConfig, FormikProps } from "formik";
import { FC, useContext } from "react";
import Modal from "react-responsive-modal";
import "../../../assets/css/genericModal.css";
import UseState from "../../../utils/types/UseState";
import * as yup from 'yup';
import urlRegex from "../../../utils/regex/urlRegex";
import { FloatInput } from "../../FloatingLabelInput";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import UserDataContext from "../../../utils/UserDataContext";
import IUserTeamData from "../../../utils/types/team/IUserTeamData";
import { AxiosError } from "axios";
import IAppError from "../../../utils/types/API/IAppError";
import FormMessage from "../../FormMessage";
import IFormStatus from "../../../utils/types/IFormStatus";
import Loading from "../../Loading";
import postAdvisors, { IPostAdvisorsParams } from "../../../services/team/advisors/postAdvisors";
import cloneDeep from "lodash.clonedeep";

interface props {
  openState: UseState<boolean>;
}

interface IFormValues {
  name: string;
  photoURL?: string;
  email: string;
  password: string;
}

const schema = yup.object().shape({
  name: yup.string()
    .required("O nome é obrigatório")
    .min(2, "Mínimo de 2 caracteres")
    .max(254, "Máximo de 254 caracteres"),
  photoURL: yup.string()
    .matches(urlRegex, "URL inválida"),
  email: yup.string()
    .email("Email Inválido")
    .required("Campo obrigatório"),
  password: yup.string()
    .required("A senha é obrigatória")
    .min(8, 'Mínimo de 8 caracteres')
    .max(30, 'Máximo de 30 caracteres')
});


const CreateAdvisor: FC<props> = ({ openState: [ open, setOpen ] }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;

  const handleSubmit: FormikConfig<IFormValues>["onSubmit"] = async (
    values,
    { setStatus, setErrors, resetForm }
  ) => {
    let newAdvisor;
    values.photoURL = values.photoURL === ""
    ? undefined
    : values.photoURL;

    try {
      newAdvisor = await postAdvisors(values as any);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case -2:
          switch ((error.response.data.details as { value: string, location: string }).location) {
            case "advisor.name":
              return setErrors({ name: "Conteúdo impróprio" });
            default:
              return setStatus({
                message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
                state: "error"
              } as IFormStatus);
          }
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus);
      }
    }
    const newTeam = cloneDeep(team);
    newTeam.advisors.push(newAdvisor.data);
    setTeam(newTeam);
    resetForm();
    setOpen(false);
  }

  return (
    <Modal 
      classNames={{
        modal: "generic-modal create-advisor",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false}
    >
      <header>
        <p>Cadastrar Orientador</p>
      </header>
      <Formik 
        initialValues={{
          name: "",
          password: "",
          photoURL: "",
          email: ""
        } as IFormValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >{({ status, isSubmitting }) => (<>
        <Form className="content">
          <SimpleBar className="main">
            <Field name="name">{({ field }: FieldProps) => (
              <FloatInput
                label="Nome"
                errorDisplay={
                  <div>
                    <ErrorMessage name="name" />
                  </div>
                }
              >
                <input {...field} />
              </FloatInput>
            )}</Field>
            <Field name="photoURL">{({ field }: FieldProps) => (
              <FloatInput
                label="Link da foto"
                errorDisplay={
                  <div>
                    <ErrorMessage name="photoURL" />
                  </div>
                }
              >
                <input {...field} />
              </FloatInput>
            )}</Field>
            <Field name="email">{({ field }: FieldProps) => (
              <FloatInput
                label="Email do orientador"
                errorDisplay={
                  <div>
                    <ErrorMessage name="email" />
                  </div>
                }
              >
                <input {...field} />
              </FloatInput>
            )}</Field>
          </SimpleBar>
          <footer>
            {
              status &&
              <FormMessage message={status.message} state={status.state} />
            }
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
            {
              isSubmitting
              ? <Loading />
              : <button className="responsive-button" type="submit">Salvar</button>
            }
          </footer>
        </Form>
      </>)}</Formik>
    </Modal>
  );
}
export default CreateAdvisor;