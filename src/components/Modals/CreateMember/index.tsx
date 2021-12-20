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
import postMember from "../../../services/team/members/postMember";
import UserDataContext from "../../../utils/UserDataContext";
import IUserTeamData from "../../../utils/types/team/IUserTeamData";
import { AxiosError } from "axios";
import IAppError from "../../../utils/types/API/IAppError";
import FormMessage from "../../FormMessage";
import IFormStatus from "../../../utils/types/IFormStatus";
import Loading from "../../Loading";
import cloneDeep from "lodash.clonedeep";
import generateDateFromInput from "../../../utils/functions/generateDateFromInput";
import validateAge from "../../../utils/functions/validateAge";

interface props {
  openState: UseState<boolean>;
}

interface IFormValues {
  name: string;
  photoURL?: string;
  role: string;
  birthday: string;
  description?: string;
  password: string;
}

const schema = yup.object().shape({
  password: yup.string()
    .required("A senha é obrigatória")
    .min(8, 'Mínimo de 8 caracteres')
    .max(30, 'Máximo de 30 caracteres'),
  birthday: yup.string()
    .required("A data de nascimento é obrigatória")
    .test("valid-date", "Data inválida", (value) => !!value && !isNaN(Date.parse(value)))
    .test("age", "Um membro não pode ser mais novo que 15 anos", validateAge),
  name: yup.string()
    .required("O nome é obrigatório")
    .min(2, "Mínimo de 2 caracteres")
    .max(254, "Máximo de 254 caracteres"),
  role: yup.string()
    .required("A função é obrigatória")
    .max(50, "Máximo de 50 caracteres"),
  description: yup.string()
    .max(254, "Máximo de 254 caracteres"),
  photoURL: yup.string()
    .matches(urlRegex, "URL inválida"),
});


const CreateMember: FC<props> = ({ openState: [ open, setOpen ] }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;

  const handleSubmit: FormikConfig<IFormValues>["onSubmit"] = async (
    values,
    { setStatus, setErrors, resetForm }
  ) => {
    let newMember;
    values.birthday = generateDateFromInput(values.birthday) as any;

    values.description = values.description === ""
    ? undefined
    : values.description;

    values.photoURL = values.photoURL === ""
    ? undefined
    : values.photoURL;

    try {
      newMember = await postMember(values as any);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case -2:
          switch ((error.response.data.details as { value: string, location: string }).location) {
            case "member.name":
              return setErrors({ name: "Conteúdo impróprio" });
            case "member.role":
              return setErrors({ role: "Conteúdo impróprio" });
            case "member.description":
              return setErrors({ description: "Conteúdo impróprio" });
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
    newTeam.members.push(newMember.data);
    setTeam(newTeam);
    resetForm();
    setOpen(false);
  }

  return (
    <Modal 
      classNames={{
        modal: "generic-modal create-member",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false}
    >
      <header>
        <p>Cadastrar Membro</p>
      </header>
      <Formik 
        initialValues={{
          birthday: "",
          name: "",
          password: "",
          role: "",
          description: "",
          photoURL: ""
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
            <Field name="role">{({ field }: FieldProps) => (
              <FloatInput
                label="Função"
                errorDisplay={
                  <div>
                    <ErrorMessage name="role" />
                  </div>
                }
              >
                <input {...field} />
              </FloatInput>
            )}</Field>
            <Field name="birthday">{({ field }: FieldProps) => (
              <FloatInput
                label="Data de nascimento"
                errorDisplay={
                  <div>
                    <ErrorMessage name="birthday" />
                  </div>
                }
              >
                <input type="date" {...field} />
              </FloatInput>
            )}</Field>
            <Field name="description">{({ field }: FieldProps) => (
              <FloatInput
                label="Descrição"
                errorDisplay={
                  <div>
                    <ErrorMessage name="description" />
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
export default CreateMember;