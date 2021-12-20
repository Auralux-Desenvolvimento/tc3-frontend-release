import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { FloatInput } from "../../../../FloatingLabelInput";
import * as yup from 'yup';
import { FC, useContext } from "react";
import './style.css';
import yupPasswordCheck from "../../utils/yupPasswordCheck";
import IFormStatus from "../../../../../utils/types/IFormStatus";
import { AxiosError } from "axios";
import IAppError from "../../../../../utils/types/API/IAppError";
import patchAdvisor, { IPatchAdvisorParams } from "../../../../../services/team/advisors/patchAdvisor";
import urlRegex from "../../../../../utils/regex/urlRegex";
import { cloneDeep } from "lodash";
import { IEditProfileFormValues } from "../..";
import editProfileSchema from "../../utils/editProfileSchema";
import UserDataContext from "../../../../../utils/UserDataContext";
import IUserTeamData from "../../../../../utils/types/team/IUserTeamData";
import UseState from "../../../../../utils/types/UseState";
import { ITabProps } from "../../../TabModal";
import FormMessage from "../../../../FormMessage";
import Loading from "../../../../Loading";
import stackOnChangeCalls from "../../utils/stackOnChangeCalls";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

export interface IFormValues extends IEditProfileFormValues {
  advisor: string,
  name: string,
  photoURL: string,
  email: string,
}

const schema = editProfileSchema({
  advisor: yup.string()
    .required("Escolha um integrante"),
  name: yup.string()
    .min(2, "Mínimo de 2 caracteres")
    .max(254, "Máximo de 254 caracteres")
    .required("O nome é obrigatório"),
  photoURL: yup.string()
    .matches(urlRegex, "Forneça uma URL válida"),
  email: yup.string()
    .email("Forneça um email válido")
    .required("A função é obrigatória"),
});

const Advisors: FC<ITabProps> = ({ openState }) => {
  function closeModal () {
    openState[1](false);
  }

  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;

  async function handlePhotoRemoval (
    { password, advisor: id }: IFormValues,
    { setErrors, setTouched, setStatus, resetForm }: FormikProps<IFormValues>
  ) {
    const validPassword = await yupPasswordCheck(password, setTouched, setErrors);
    if (!validPassword) {
      return;
    }
  
    const advisor = team.advisors.find(e => e.id === id);
    
    if (!advisor) {
      return setErrors({
        advisor: "Selecione um orientador"
      });
    }
  
    const newTeam = cloneDeep(team);
    const patchData: IPatchAdvisorParams = { password };
  
    patchData.photoURL = null;
    advisor.photoURL = undefined;
  
    try {
      await patchAdvisor(id, patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code){
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
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
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus)
      }
    }
    for (let i in team.advisors) {
      if (team.advisors[i].id === id) {
        team.advisors[i] = advisor;
        break;
      }
    }
    setTeam(newTeam);
    resetForm();
    closeModal();
  }

  async function handleSubmit (
    { 
      photoURL,
      advisor: id,
      name,
      password,
      email,
    }: IFormValues,
    { setErrors, setStatus, resetForm }: FormikHelpers<IFormValues>
  ) {    
    const newTeam = cloneDeep(team);
  
    const advisor = newTeam.advisors.find(e => e.id === id);
    if (!advisor) {
      return setErrors({
        advisor: "Selecione um orientador"
      });
    }
  
    const patchData: IPatchAdvisorParams = { password };
  
    if (name && advisor.name !== name) {
      patchData.name = name;
      advisor.name = name;
    }
  
    if (email && advisor.email !== email) {
      patchData.email = email;
      advisor.email = email;
    }
  
    if (photoURL && advisor.photoURL !== photoURL) {
      patchData.photoURL = photoURL;
      advisor.photoURL = photoURL;
    } else if (photoURL === "") {
      patchData.photoURL = null;
      advisor.photoURL = undefined;
    }
  
    try {
      await patchAdvisor(id, patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code){
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
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
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus)
      }
    }
    for (let i in team.advisors) {
      if (team.advisors[i].id === id) {
        team.advisors[i] = advisor;
        break;
      }
    }
    setTeam(newTeam);
    resetForm();
    closeModal();
  }

  function handleAdvisorChange (
    advisor: string,
    { values, setValues, setTouched }: FormikProps<IFormValues>
  ) {
    let index = team.advisors.findIndex(e => e.id === advisor);
    if (index !== -1) {
      const { name, email, photoURL } = team.advisors[index];
      setValues({
        name,
        email,
        photoURL: photoURL || "",
        advisor: advisor,
        password: values.password
      });
      setTouched({});
    }
  }

  return (
    <Formik 
      initialValues={{
        advisor: "",
        email: "",
        name: "",
        password: "",
        photoURL: "",
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ values, status, isSubmitting, setValues, setErrors, setTouched, setStatus, resetForm }) => (
      <Form className="form content">
        <SimpleBar className="main">
          <Field name="advisor">{({ field: { value, onChange, ...field } }: FieldProps) => (
            <FloatInput
              label="Selecione o orientador"
              errorDisplay={
                <div>
                  <ErrorMessage name="state" />
                </div>
              }
            >
              <select
                value={value || ""}
                onChange={stackOnChangeCalls(onChange, event => handleAdvisorChange(
                  event.target.value,
                  { values, setValues, setTouched } as any
                ))}
                {...field}
              >
                <option value=""></option>
                {team.advisors.map(e => (
                  <option value={e.id} key={e.id}>{e.name}</option>
                ))}
              </select>
            </FloatInput>
          )}</Field>

          <Field name="name">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Nome do orientador"
              errorDisplay={
                <div>
                  <ErrorMessage name="name" />
                </div>
              }
            >
              <input type="text" value={value || ""} {...field}/>
            </FloatInput>
          )}</Field>

          <div className="advisors-photo-wrapper">
            <Field name="photoURL">{({ field: { value, ...field } }: FieldProps) => (
              <FloatInput
                className="photo"
                label="Link da foto"
                errorDisplay={
                  <div>
                    <ErrorMessage name="photoURL" />
                  </div>
                }
              >
                <input type="text" value={value || ""} {...field}/>
              </FloatInput>
            )}</Field>
            <button
              className="responsive-button"
              type="button"
              onClick={() => handlePhotoRemoval(values, { setErrors, setTouched, setStatus, resetForm } as any)}
            >
              Remover foto
            </button>
          </div>

          <Field name="email">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="E-mail do orientador"
              errorDisplay={
                <div>
                  <ErrorMessage name="email" />
                </div>
              }
            >
              <input type="text" value={value || ""} {...field}/>
            </FloatInput>
          )}</Field>
        </SimpleBar>

        <footer>
          {
            status &&
            <FormMessage
              className="generic-error"
              message={status.message}
              state={status.state}
            />
          }
          <div className="controls">
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
          </div>
        </footer>
      </Form>
    )}</Formik>
  );
}
export default Advisors;