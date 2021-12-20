import { IEditProfileFormValues } from '../..';
import * as yup from 'yup';
import { Field, ErrorMessage, FieldProps, FormikErrors, Formik, Form, FormikProps, FormikHelpers } from 'formik';
import { FloatInput } from "../../../../FloatingLabelInput";
import editProfileSchema from '../../utils/editProfileSchema';
import FloatSearch from '../../../../FloatingLabelInput/FloatSearch';
import { FC, useContext, useState } from 'react';
import { ICurrentSuggestion, ISuggestion } from '../../../../SearchInput';
import { IGetCourseSearchResponse } from '../../../../../services/course/getCourseSearch';
import UseState from '../../../../../utils/types/UseState';
import useThrottledCallback from 'use-debounce/lib/useThrottledCallback';
import patchTeam, { IPatchTeamParams } from '../../../../../services/team/patchTeam';
import { AxiosError } from 'axios';
import IAppError from '../../../../../utils/types/API/IAppError';
import IFormStatus from '../../../../../utils/types/IFormStatus';
import IUserTeamData from '../../../../../utils/types/team/IUserTeamData';
import './style.css';
import yupPasswordCheck from '../../utils/yupPasswordCheck';
import cloneDeep from 'lodash.clonedeep';
import UserDataContext from '../../../../../utils/UserDataContext';
import { ITabProps } from '../../../TabModal';
import FormMessage from '../../../../FormMessage';
import Loading from '../../../../Loading';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import handleGetCourses from '../../../../SearchInput/handlers/handleGetCourses';
import { ITag } from '../../../../Tag';

interface IFormValues extends IEditProfileFormValues {
  name?: string,
  logoURL?: string,
  course?: string,
}

const schema = editProfileSchema({
  name: yup.string()
    .max(50, "Limite de 50 caracteres atingido")
    .required("Forneça um nome"),
  logoURL: yup.string(),
  course: yup.string()
    .required("Forneça um curso")
});

const Team: FC<ITabProps> = ({ openState }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;
  const setCurrentSearch = useState<ICurrentSuggestion<IGetCourseSearchResponse>>()[1];
  const [ suggestions, setSuggestions ] = useState<ISuggestion<ITag>[]>([]);
  const debouncedHandleGetCourses = useThrottledCallback((name: string) => {
    return handleGetCourses(name, setSuggestions);
  }, 400);

  function closeForm () {
    openState[1](false);
  }

  async function handlePhotoRemoval (
    { password }: IFormValues,
    { setTouched, setErrors, setStatus, resetForm }: FormikProps<IFormValues>
  ) {
    const validPassword = await yupPasswordCheck(password, setTouched, setErrors);
    if (!validPassword) {
      return;
    }
    const newTeam = cloneDeep(team);
    const patchData: IPatchTeamParams = { password };
  
    patchData.logoURL = null;
    newTeam.logoURL = undefined;
  
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
    closeForm();
  }  

  async function validate (
    { course, logoURL, name, password }: IFormValues,
  ) {
    const errors: FormikErrors<IFormValues> = {};
    try {
      await schema.validate({ course, logoURL, name, password }, {
        abortEarly: false
      });
    } catch (rawError) {
      const error: yup.ValidationError = rawError as any;
      error.inner.forEach(e => {
        switch (e.path) {
          case "course":
            errors.course = e.message;
            break;
          case "logoURL":
            errors.logoURL = e.message;
            break;
          case "name":
            errors.name = e.message;
            break;
          case "password":
            errors.password = e.message;
            break;
        }
      })
      return errors;
    }
  
    if (
      !(course || logoURL || name)
      || (course === team.course && logoURL === team.logoURL && name === team.name)
    ) {
      errors.course = "Preencha pelo menos um campo.";
      errors.name = "Preencha pelo menos um campo.";
      errors.logoURL = "Preencha pelo menos um campo.";
      return errors;
    }  
  }

  async function handleSubmit (
    { 
      name,
      logoURL,
      course,
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
  
    if (name && team.name !== name) {
      patchData.name = name;
      newTeam.name = name;
    }
  
    if (logoURL && team.logoURL !== logoURL) {
      patchData.logoURL = logoURL;
      newTeam.logoURL = logoURL;
    } else if (logoURL === "") {
      patchData.logoURL = null;
      newTeam.logoURL = undefined;
    }
  
    if (course && team.course !== course) {
      patchData.course = course;
      newTeam.course = course;
    }
  
    try {
      await patchTeam(patchData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code){
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
        case -2:
          switch ((error.response.data.details as { value: string, location: string }).location) {
            case "team.name":
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
    setTeam(newTeam);
    resetForm();
    closeForm();
  }

  return (
    <Formik 
      initialValues={{
        name: team.name || "",
        logoURL: team.logoURL || "",
        course: team.course || "",
        password: ""
      } as IFormValues}
      validate={validate}
      onSubmit={handleSubmit}
    >{({ values, setFieldValue, setTouched, setErrors, setStatus, resetForm, status, isSubmitting }: FormikProps<IFormValues>) => (
      <Form className="form content">
        <SimpleBar className="main">
          <Field name="name">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Alterar nome de equipe"
              errorDisplay={
                <div>
                  <ErrorMessage name="name" />
                </div>
              }
            >
              <input type="text" value={value || ""} {...field} />
            </FloatInput>
          )}</Field>

          <div className="team-photo-wrapper">
            <Field name="logoURL">{({ field: { value, ...field } }: FieldProps) => (
              <FloatInput
                className="photo"
                label="Alterar link da logo da equipe"
                errorDisplay={
                  <div>
                    <ErrorMessage name="logoURL" />
                  </div>
                }
              >
                <input type="text" value={value || ""} {...field} />
              </FloatInput>
            )}</Field>
            <button
              className="responsive-button"
              type="button"
              onClick={() => handlePhotoRemoval(values, { setTouched, setErrors, setStatus, resetForm } as any)}
            >
              Remover foto
            </button>
          </div>

          <FloatSearch
            current={[
              { content: values.course || "" } as ICurrentSuggestion,
              (value: ICurrentSuggestion) => {
                setCurrentSearch(value);
                setFieldValue("course", value.content);
              }
            ] as UseState<ICurrentSuggestion>}
            onChange={({ target }) => debouncedHandleGetCourses(target.value)}
            suggestions={[suggestions, setSuggestions] as UseState<ISuggestion[]>}
            id="course"
            name="course"
            label="Qual é seu curso?"
            errorDisplay={
              <div>
                <ErrorMessage name="course" />
              </div>
            }
          />
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

export default Team;