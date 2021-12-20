import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { IEditProfileFormValues } from "../..";
import { FloatInput } from "../../../../FloatingLabelInput";
import editProfileSchema from "../../utils/editProfileSchema";
import * as yup from 'yup';
import { FC, useContext } from "react";
import './style.css';
import yupPasswordCheck from "../../utils/yupPasswordCheck";
import IFormStatus from "../../../../../utils/types/IFormStatus";
import { AxiosError } from "axios";
import IAppError from "../../../../../utils/types/API/IAppError";
import patchMember, { IPatchMemberParams } from "../../../../../services/team/members/patchMember";
import urlRegex from "../../../../../utils/regex/urlRegex";
import cloneDeep from 'lodash.clonedeep';
import { ITabProps } from "../../../TabModal";
import UserDataContext from "../../../../../utils/UserDataContext";
import UseState from "../../../../../utils/types/UseState";
import IUserTeamData from "../../../../../utils/types/team/IUserTeamData";
import stackOnChangeCalls from "../../utils/stackOnChangeCalls";
import FormMessage from "../../../../FormMessage";
import Loading from "../../../../Loading";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import generateDateFromInput from "../../../../../utils/functions/generateDateFromInput";
import validateAge from "../../../../../utils/functions/validateAge";

interface IFormValues extends IEditProfileFormValues {
  member: string,
  name: string,
  photoURL: string,
  role: string,
  birthday: string,
  description: string,
}

export const schema = editProfileSchema({
  member: yup.string()
    .required("Escolha um integrante"),
  name: yup.string()
    .min(2, "Mínimo de 2 caracteres")
    .max(254, "Máximo de 254 caracteres")
    .required("O nome é obrigatório"),
  photoURL: yup.string()
    .matches(urlRegex, "Forneça uma URL válida"),
  role: yup.string()
    .required("A função é obrigatória"),
  birthday: yup.string()
    .required("A data de nascimento é obrigatória")
    .test("age", "Um membro não pode ser mais novo que 15 anos", validateAge),
  description: yup.string()
    .max(254, "A descrição não pode ter mais que 254 caracteres"),
});

const Members: FC<ITabProps> = ({ openState }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;

  function closeModal () {
    openState[1](false);
  }

  async function handleSubmit (
    { 
      birthday,
      photoURL,
      member: id,
      name,
      password,
      role,
      description
    }: IFormValues,
    { setErrors, setStatus, resetForm }: FormikHelpers<IFormValues>,
  ) {  
    const newTeam = cloneDeep(team);
    
    const member = newTeam.members.find(e => e.id === id);
    if (!member) {
      return setErrors({
        member: "Selecione um membro"
      });
    }
    const patchData: IPatchMemberParams = { password };
  
    const newBirthday = generateDateFromInput(birthday);
  
    if (newBirthday && member.birthday.getTime() !== newBirthday.getTime()) {
      patchData.birthday = newBirthday;
      member.birthday = newBirthday;
    }
  
    if (description && member.description !== description) {
      patchData.description = description;
      member.description = description;
    } else if (description === "") {
      patchData.description = null;
      member.description = undefined;
    }
  
    if (name && member.name !== name) {
      patchData.name = name;
      member.name = name;
    }
  
    if (photoURL && member.photoURL !== photoURL) {
      patchData.photoURL = photoURL;
      member.photoURL = photoURL;
    } else if (photoURL === "") {
      patchData.photoURL = null;
      member.photoURL = undefined;
    }
  
    if (role && member.role !== role) {
      patchData.role = role;
      member.role = role;
    }
  
    try {
      await patchMember(id, patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code){
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
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
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus)
      }
    }

    for (let i in team.members) {
      if (team.members[i].id === id) {
        team.members[i] = member;
        break;
      }
    }

    setTeam(newTeam);
    resetForm();
    closeModal();
  }
  
  async function handlePhotoRemoval (
    { password, member: id }: IFormValues,
    { setErrors, setTouched, setStatus, resetForm }: FormikProps<IFormValues>
  ) {
    const validPassword = await yupPasswordCheck(password, setTouched, setErrors);
    if (!validPassword) {
      return;
    }
  
    const member = team.members.find(e => e.id === id);
    
    if (!member) {
      return setErrors({
        member: "Selecione um membro"
      });
    }
  
    const newTeam = cloneDeep(team);
    const patchData: IPatchMemberParams = { password };
  
    patchData.photoURL = null;
    member.photoURL = undefined;
  
    try {
      await patchMember(id, patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code){
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
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
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus)
      }
    }
    for (let i in team.members) {
      if (team.members[i].id === id) {
        team.members[i] = member;
        break;
      }
    }
    setTeam(newTeam);
    resetForm();
    closeModal();  
  }

  function handleMemberChange (
    member: string,
    { values, setValues, setTouched }: FormikProps<IFormValues>
  ) {
    let index = team.members.findIndex(e => e.id === member);
    if (index !== -1) {
      const { birthday, description, name, role, photoURL } = team.members[index];
      setValues({
        birthday: birthday.toISOString().split("T")[0],
        description: description || "",
        name,
        role,
        photoURL: photoURL || "",
        member: member,
        password: values.password
      });
      setTouched({});
    }
  }

  return (
    <Formik 
      initialValues={{
        password: "",
        member: "",
        name: "",
        photoURL: "",
        role: "",
        birthday: "",
        description: ""
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ values, setValues, setErrors, setTouched, setStatus, resetForm, status, isSubmitting }: FormikProps<IFormValues>) => (
      <Form className="form content">
        <SimpleBar className="main">
          <Field name="member">{({ field: { value, onChange, ...field } }: FieldProps) => (
            <FloatInput
              label="Selecione o integrante"
              errorDisplay={
                <div>
                  <ErrorMessage name="state" />
                </div>
              }
            >
              <select 
                value={value || ""}
                onChange={stackOnChangeCalls<HTMLSelectElement>(onChange, event => handleMemberChange(
                  event.target.value,
                  { values, setValues, setTouched } as any
                ))} 
                {...field}
              >
                <option value=""></option>
                {team.members.map(e => (
                  <option value={e.id} key={e.id}>{e.name}</option>
                ))}
              </select>
            </FloatInput>
          )}</Field>

          <Field name="name">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Nome do integrante"
              errorDisplay={
                <div>
                  <ErrorMessage name="name" />
                </div>
              }
            >
              <input type="text" value={value || ""} {...field}/>
            </FloatInput>
          )}</Field>

          <div className="members-photo-wrapper">
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

          <Field name="role">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Função"
              errorDisplay={
                <div>
                  <ErrorMessage name="role" />
                </div>
              }
            >
              <input type="text" value={value || ""} {...field}/>
            </FloatInput>
          )}</Field> 

          <Field name="birthday">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Data de nascimento"
              className="member-input"
              errorDisplay={
                <div>
                  <ErrorMessage name="birthday" />
                </div>
              }
            >
              <input type="date" value={value || ""} {...field}/>
            </FloatInput>
          )}</Field>

          <Field name="description">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Descrição"
              errorDisplay={
                <div>
                  <ErrorMessage name="description" />
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
export default Members;