import { IEditProfileFormValues } from '../..';
import * as yup from 'yup';
import { Field, ErrorMessage, FieldProps, FormikHelpers, FormikProps, Form, Formik } from 'formik';
import { FloatInput } from "../../../../FloatingLabelInput";
import editProfileSchema from '../../utils/editProfileSchema';
import './style.css'
import UseState from '../../../../../utils/types/UseState';
import IUserTeamData from '../../../../../utils/types/team/IUserTeamData';
import patchTeam, { IPatchTeamParams } from '../../../../../services/team/patchTeam';
import { AxiosError } from 'axios';
import IAppError from '../../../../../utils/types/API/IAppError';
import IFormStatus from '../../../../../utils/types/IFormStatus';
import { FC, useContext } from 'react';
import yupPasswordCheck from '../../utils/yupPasswordCheck';
import cloneDeep from 'lodash.clonedeep';
import { ITabProps } from '../../../TabModal';
import FormMessage from '../../../../FormMessage';
import Loading from '../../../../Loading';
import UserDataContext from '../../../../../utils/UserDataContext';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

interface IFormValues extends IEditProfileFormValues {
  theme: string,
  themeDescription?: string,
}

const schema = editProfileSchema({
  theme: yup.string()
    .min(5, "Mínimo de 5 caracteres")
    .max(200, "Máximo de 200 caracteres")
    .required("O tema é obrigatório"),
  hasTheme: yup.string(),
  themeDescription: yup.string()
});

const Theme: FC<ITabProps> = ({ openState }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;

  function closeModal () {
    openState[1](false);
  }

  async function handleSubmit (
    { 
      theme,
      themeDescription,
      password
     }: IFormValues,
    { 
      setStatus,
      setErrors,
      resetForm
     }: FormikHelpers<IFormValues>
  ) {
    const newTeam = cloneDeep(team);
    const patchData: IPatchTeamParams = { password };
  
    if (team.theme === theme && team.themeDescription === themeDescription) {
      return setErrors({
        theme: "Preencha pelo menos um campo.",
        themeDescription: "Preencha pelo menos um campo."
      });
    }
  
    if (theme && team.theme !== theme) {
      patchData.theme = theme;
      newTeam.theme = theme;
    }
  
    if (themeDescription && team.themeDescription !== themeDescription) {
      patchData.themeDescription = themeDescription;
      newTeam.themeDescription = themeDescription;
    } else if (themeDescription === "") {
      patchData.themeDescription = null;
      newTeam.themeDescription = undefined;
    }
  
    try {
      await patchTeam(patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
        case -2:
          switch ((error.response.data.details as { value: string, location: string }).location) {
            case "team.themeName":
              return setErrors({ theme: "Conteúdo impróprio" });
            case "team.themeDescription":
              return setErrors({ themeDescription: "Conteúdo impróprio" });
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
          } as IFormStatus);
      }
    }
    setTeam(newTeam);
    resetForm();
    closeModal();
  }

  async function handleThemeRemoval (
    { password }: IFormValues,
    {
      setErrors, setStatus, resetForm, setTouched
    }: FormikProps<IFormValues>
  ) {
    const validPassword = await yupPasswordCheck(password, setTouched, setErrors);
    if (!validPassword) {
      return;
    }
    const newTeam = cloneDeep(team);
    const patchData: IPatchTeamParams = { password };
  
    patchData.theme = null;
    newTeam.theme = undefined;
    patchData.themeDescription = null;
    newTeam.themeDescription = undefined;
  
    try {
      await patchTeam(patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus)
      }
    }
    setTeam(newTeam);
    resetForm();
    closeModal();
  }

  return (
    <Formik 
      initialValues={{
        password: "",
        theme: team.theme || "",
        themeDescription: team.themeDescription || ""
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ values, setTouched, setErrors, setStatus, resetForm, status, isSubmitting }: FormikProps<IFormValues>) => (
      <Form className="form content">
        <SimpleBar className="theme-container main">
          <div className="theme-wrapper">
            <Field name="theme">{({ field: {value, ...field} }: FieldProps) => (
              <FloatInput
                className="theme-input"
                label="Seu tema"
                errorDisplay={
                  <div>
                    <ErrorMessage name="theme" />
                  </div>
                }
              >
                <input type="text"  value={value || ""} {...field} />
              </FloatInput>
            )}</Field>
            <button
              className="responsive-button"
              onClick={() => handleThemeRemoval(values, { setErrors, setStatus, resetForm, setTouched } as any)}
              type="button"
            >
              Remover tema
            </button>
          </div>
          
          <Field name="themeDescription">{({ field: {value, ...field} }: FieldProps) => (
            <FloatInput
              className="description-input"
              label="Descreva seu tema"
              errorDisplay={
                <div>
                  <ErrorMessage name="themeDescription" />
                </div>
              }
            >
              <textarea value={value || ""} {...field}></textarea>
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
export default Theme;