import { Formik, Form, Field, ErrorMessage, FieldArray, FormikHelpers, FieldProps, FormikErrors, FieldArrayRenderProps } from "formik";
import { FC, ImgHTMLAttributes, useContext, useEffect, useRef, useState } from "react";
import { useThrottledCallback } from 'use-debounce';
import { Link, useHistory } from "react-router-dom";
import { AxiosError } from "axios";
import * as Yup from "yup";
import { ISuggestion, ICurrentSuggestion } from '../../components/SearchInput';
import FloatSearch from "../../components/FloatingLabelInput/FloatSearch";
import ILocationData from "../../utils/types/location/ILocationData";
import postTeam, { IPostTeamParams } from "../../services/team/postTeam";
import { FloatInput } from "../../components/FloatingLabelInput";
import IMemberData from "../../utils/types/member/IMemberData";
import { IGetCourseSearchResponse } from '../../services/course/getCourseSearch';
import IAppError from "../../utils/types/API/IAppError";
import IFormStatus from "../../utils/types/IFormStatus";
import FormMessage from "../../components/FormMessage";
import Loading from '../../components/Loading';
import "../../assets/css/initialPages.css";
import "./style.css";
import IProfanityError from "../../utils/types/API/IProfanityError";
import setupLocations from "../../utils/functions/setupLocations";
import getUserDataWithToken from "../../utils/functions/getUserDataWithToken";
import UserDataContext from "../../utils/UserDataContext";
import urlRegex from "../../utils/regex/urlRegex";
import IAdvisorData from "../../utils/types/advisor/IAdvisorData";
import { Icon } from "@iconify/react";
import SocketContext from "../../utils/SocketContext";
import generateDateFromInput from "../../utils/functions/generateDateFromInput";
import validateAge from "../../utils/functions/validateAge";
import SearchList from "../../components/SearchList";
import handleGetCourses from "../../components/SearchInput/handlers/handleGetCourses";
import { ITag } from "../../components/Tag";
import handleGetKeywords from "../../components/SearchInput/handlers/handleGetKeywords";

interface IFormValues {
  teamName: string;
  teamLogoURL: string;
  email: string;
  password: string;
  passwordConfirm: string;
  state: string;
  city: string;
  course: string;
  hasTheme: "true" | "false";
  teamTheme: string;
  keyword: string;
  members: {
    name: string;
    photoURL: string;
    role: string;
    birthday: string;
    description: string;
  }[];
  advisors: {
    name: string;
    photoURL: string;
    email: string;
  }[];
}

const SignupSchema = Yup.object().shape({
  teamName: Yup.string()
    .min(2, "Mínimo de 2 caracteres")
    .max(50, "Máximo de 50 caracteres")
    .required("Campo obrigatório"),
  teamLogoURL: Yup.string()
    .matches(urlRegex, "URL inválida"),
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
  state: Yup.string().required("Campo obrigatório"),
  city: Yup.string().required("Campo obrigatório"),
  course: Yup.string()
    .min(3, "Mínimo de 3 caracteres")
    .max(254, "Máximo de 254 caracteres"),
  hasTheme: Yup.string().required("Campo Obrigatório"),
  teamTheme: Yup.string().when("hasTheme", {
    is: "true",
    then: Yup.string()
      .min(5, "Mínimo de 5 caracteres")
      .max(254, "Máximo de 254 caracteres")
      .required("Campo obrigatório"),
    otherwise: Yup.string()
      .min(5, "Mínimo de 5 caracteres")
      .max(254, "Máximo de 254 caracteres"),
  }),
  members: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .min(2, "Mínimo de 2 caracteres")
          .max(50, "Máximo de 50 caracteres")
          .required("Campo obrigatório"),
        photoURL: Yup.string().matches(urlRegex, "URL inválida"),
        role: Yup.string()
          .max(50, "Máximo de 50 caracteres")
          .required("Campo obrigatório"),
        birthday: Yup.string()
          .required("Campo obrigatório")
          .test("age", "Um membro não pode ser mais novo que 15 anos", validateAge),
        description: Yup.string()
          .max(254, "Máximo de 254 caracteres"),
      })
    )
    .min(1, "Mínimo de um integrante"),
  advisors: Yup.array()
    .of(
      Yup.object().shape({
        name: Yup.string()
          .min(2, "Mínimo de 2 caracteres")
          .max(254, "Máximo de 254 caracteres")
          .required("Campo obrigatório"),
        photoURL: Yup.string()
          .matches(urlRegex, "URL inválida"),
        email: Yup.string()
          .email("Email Inválido")
          .required("Campo obrigatório"),
      })
    )
    .min(1, "Mínimo de um Orientador")
});

const DemoImage: FC<ImgHTMLAttributes<any>> = ({ src, ...rest }) => {
  return (
    <>{
      src === undefined
      ? <div className={rest.className}>Perfil</div>
      : <img src={src} {...rest} />
    }</>
  );
}

const SignUpUser: FC = () => {
  const [ courseSuggestions, setCourseSuggestions ] = useState<ISuggestion<ITag>[]>([]);
  const [ currentSearch, setCurrentSearch ] = useState<ICurrentSuggestion<IGetCourseSearchResponse>>();
  const [ externalStatus, setExternalStatus ] = useState<IFormStatus>();
  const [ locations, setLocations ] = useState<ILocationData[]>();
  const [ keywordSuggestions, setKeywordSuggestions ] = useState<ISuggestion[]>([]);
  const [ keywordItems, setKeywordItems ] = useState<ITag[]>([]);
  const mounted = useRef<boolean>();
  const history = useHistory();
  const setUserData = useContext(UserDataContext)[1];
  const socket = useContext(SocketContext);
  const debouncedHandleGetCourses = useThrottledCallback((name: string) => handleGetCourses(
    name,
    setCourseSuggestions, 
    mounted
  ), 400);
  const debouncedHandleGetKeywords = useThrottledCallback((name: string) => handleGetKeywords(
    name, 
    setKeywordSuggestions,
    mounted, 
    e => !keywordItems.some(f => e.content === f.label)
  ), 400);

  useEffect(() => {
    mounted.current = true;
    setupLocations(mounted, setLocations, setExternalStatus)
    return () => { mounted.current = false }
  }, []);

  async function handleSubmit (
    {
      city,
      course,
      email,
      hasTheme,
      advisors,
      members,
      password,
      teamLogoURL,
      teamName,
      teamTheme
    }: IFormValues,
    {
      setStatus,
      setErrors
    }: FormikHelpers<IFormValues>
  ) {
    setExternalStatus(undefined);
    
    if (!keywordItems.length) {
      return setErrors({
        keyword: "Selecione ao menos uma palavra-chave"
      });
    }

    const newMembers: IMemberData[] = members.map<IMemberData>(e => {
      let f: IMemberData = e as any;
      f.birthday = generateDateFromInput(e.birthday);
      if (!f.photoURL || f.photoURL.length === 0) {
        delete f.photoURL;
      }
      return f;
    });

    const newAdvisors: IAdvisorData[] = advisors.map<IAdvisorData>(e => {
      let f: IAdvisorData = e as any;
      if (!f.photoURL || f.photoURL.length === 0) {
        delete f.photoURL;
      }
      return f;
    });

    const postData: IPostTeamParams = {
      city,
      course: currentSearch?.value?.id || course,
      email,
      members: newMembers,
      name: teamName,
      password,
      advisors: newAdvisors,
      keywords: keywordItems.map(e => e.label)
    };
    if (hasTheme === "true") {
      postData.theme = teamTheme;
    }
    if (teamLogoURL && teamLogoURL.length > 1) {
      postData.logoURL = teamLogoURL;
    }

    try {
      await postTeam(postData);
    } catch (untypedError) {
      const error: AxiosError<IAppError<IProfanityError>> = untypedError as any;
      const defaultString = "Profanidade detectada! Use outra palavra";
      if (mounted.current) {
        switch (error.response?.data.code) {
          case -2:
            if (error.response?.data.details) {
              const location = error.response.data.details.location as string;
              let errors: FormikErrors<IFormValues> = {};
              switch (location) {
                case "course.name":
                  errors.course = defaultString;
                  break;
                case "team.name":
                  errors.teamName = defaultString;
                  break;
                case "team.themeName":
                  errors.teamTheme = defaultString;
                  break;
                case "keyword.name":
                  errors.keyword = defaultString;
                  break;
              }
              if (location.match(/member(.)*/)) {
                let firstIndex = (location.match(/(?<=\[)\d(?=\])/) as string[])[0];
                const index = Number(firstIndex);
                const property = (location.match(/(?<=\.).*/) as string[])[0];
                if (!isNaN(index)) {
                  errors.members = [];
                  errors.members[index] = {};
                  switch (property) {
                    case "name":
                      (errors as any).members[index].name = defaultString;
                      break;
                    case "role":
                      (errors as any).members[index].role = defaultString;
                      break;
                    case "description":
                      (errors as any).members[index].description = defaultString;
                      break;
                  }
                }
              }
              if (location.match(/advisor(.)*/)) {
                let firstIndex = (location.match(/(?<=\[)\d(?=\])/) as string[])[0];
                const index = Number(firstIndex);
                if (!isNaN(index)) {
                  errors.advisors = [];
                  errors.advisors[index] = {};
                  (errors as any).advisors[index].name = defaultString;
                }
              }
              return setErrors(errors);
            }
            break;
          case 2:
            return setStatus({
              message: "Essa equipe já existe",
              state: "error"
            } as IFormStatus);
          default:
            return setStatus({
              message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
              state: "error"
            } as IFormStatus);
        }
      }
    }
    await getUserDataWithToken(setUserData, history, socket);
    history.push("/preferencias");
  }

  const ButtonAdd: FC<{
    arrayHelpers: FieldArrayRenderProps
  }> = ({ arrayHelpers }) => {
    return (
      <div className="add-container">
        <button
          className="button-add down"
          type="button"
          onClick={() =>
            arrayHelpers.push({
              name: "",
              email: "",
              photoURL: "",
              role: "",
              birthday: "",
              description: ""
            })
          }
        >
          <p className="add">Adicionar</p> +
        </button>
      </div>
    )
  }

  return (
    <div className="form-page register">
      <Formik
        initialValues={{
          teamName: "",
          teamLogoURL: "",
          email: "",
          password: "",
          passwordConfirm: "",
          state: "",
          city: "",
          course: "",
          hasTheme: "false",
          teamTheme: "",
          keyword: "",
          members: [
            {
              name: "",
              photoURL: "",
              role: "",
              birthday: "",
              description: "",
            },
          ],
          advisors: [
            {
              name: "",
              photoURL: "",
              email: "",
            }
          ]
        } as IFormValues}
        validationSchema={SignupSchema}
        onSubmit={handleSubmit}
      >
        {({ values, setFieldValue, status, isSubmitting, errors }) => {
          return (
            <div className="form-container">
              <Form className="form" action="">
                <h1 className="title-initial-page">Cadastrar</h1>
                <Link to="./login" className="link-login">
                  Já é cadastrado? Entre na sua conta agora!
                </Link>
                <Field name="teamName">{({ field }: FieldProps) => (
                  <div>
                  <Icon icon="icons8:asterisk" className="icon-required" />
                  <FloatInput
                    label="Nome da equipe"
                    errorDisplay={
                      <div>
                        <ErrorMessage name="teamName" />
                      </div>
                    }
                  >
                    <input type="text" {...field} />
                  </FloatInput>
                  </div>
                )}</Field>

                <Field name="teamLogoURL">{({ field }: FieldProps) => (
                  <FloatInput
                    label="Link da logo da equipe"
                    errorDisplay={
                      <div>
                        <ErrorMessage name="teamLogoURL" />
                      </div>
                    }
                  >
                    <input type="text" {...field} />
                  </FloatInput>
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


                <hr className="line" />

                <Field name="state">{({ field }: FieldProps) => (
                  <div>
                    <Icon icon="icons8:asterisk" className="icon-required" />
                    <FloatInput
                      label="Estado"
                      errorDisplay={
                        <div>
                          <ErrorMessage name="state" />
                        </div>
                      }
                    >
                      <select {...field}>
                        <option value=""></option>
                        {locations?.map(e => (
                          <option value={e.state} key={e.state}>{e.state}</option>
                        ))}
                      </select>
                    </FloatInput>
                  </div>
                )}</Field>

                <Field name="city">{({ field }: FieldProps) => (
                  <div>
                    <Icon icon="icons8:asterisk" className="icon-required" />
                    <FloatInput
                      label="Cidade"
                      errorDisplay={
                        <div>
                          <ErrorMessage name="city" />
                        </div>
                      }
                    >
                      <select {...field}>
                        <option value=""></option>
                        {locations?.find(e => e.state === values.state)?.cities.map(e => (
                          <option key={e.id} value={e.id}>{e.name}</option>
                        ))}
                      </select>
                    </FloatInput>
                  </div>
                )}</Field>

                <div>
                  <Icon icon="icons8:asterisk" className="icon-required" />
                  <FloatSearch
                    current={[
                      { content: values.course },
                      (value: ICurrentSuggestion) => {
                        setCurrentSearch(value);
                        setFieldValue("course", value.content);
                      }
                    ]}
                    onChange={({ target }) => debouncedHandleGetCourses(target.value)}
                    suggestions={[courseSuggestions, setCourseSuggestions]}
                    id="course"
                    name="course"
                    label="Qual é seu curso?"
                    errorDisplay={
                      <div>
                        <ErrorMessage name="course" />
                      </div>
                    }
                  />
                </div>

                <div>
                  <Icon icon="icons8:asterisk" className="icon-required" />
                  <div className="radio-title" id="radio-group">
                    Você possui um tema?
                  </div>
                  <div
                    className="radio-content"
                    role="group"
                    aria-labelledby="radio-group"
                  >
                    <label>
                      <Field className="radio" type="radio" name="hasTheme" value="true" />
                      Sim
                    </label>
                    <label>
                      <Field className="radio" type="radio" name="hasTheme" value="false" />
                      Não
                    </label>
                    <ErrorMessage name="hasTheme" />
                  </div>
                </div>

                {
                  values.hasTheme === "true" &&
                  <>
                    <Field name="teamTheme">{({ field }: FieldProps) => (
                      <div>
                        <Icon icon="icons8:asterisk" className="icon-required" />
                        <FloatInput
                          label="Qual seu tema?"
                          errorDisplay={
                            <div>
                              <ErrorMessage name="teamTheme" />
                            </div>
                          }
                        >
                          <input type="text" {...field} />
                        </FloatInput>
                      </div>
                    )}</Field>

                    <div>
                      <Icon icon="icons8:asterisk" className="icon-required" />
                      <SearchList 
                        current={[
                          { content: values.keyword },
                          (value: ICurrentSuggestion) => setFieldValue("keyword", value.content)
                        ]}
                        suggestions={[ keywordSuggestions, setKeywordSuggestions ]}
                        items={[ keywordItems, setKeywordItems ]}
                        name="keyword"
                        placeholder="Palavras-chave para o seu tema"
                        onChange={() => debouncedHandleGetKeywords(values.keyword)}
                        error={<ErrorMessage name="keyword" />}
                      />
                    </div>
                  </>
                }

                <hr className="line" />

                <FieldArray
                  name="advisors"
                  render={(arrayHelpers) => (
                    <div className="advisors-container">
                      <div className="advisors-header">
                        <p className="advisor-container-title">Dados do orientador</p>
                        <ButtonAdd arrayHelpers={arrayHelpers}/>
                      </div>

                      {values.advisors.map((advisor, index) => (
                        <div className="advisor-box" key={index}>
                          {values.advisors.length > 1 &&
                            <div className="button-remove-container">
                              <button
                                className="button-remove"
                                type="button"
                                onClick={() =>
                                  values.advisors.length > 1 ? arrayHelpers.remove(index) : null
                                }
                              >
                                -
                              </button>
                            </div>
                          }
                          <div className="content">
                            <DemoImage
                              className="advisor-photo-preview"
                              src={values.advisors[index].photoURL || undefined}
                              alt="Perfil"
                            />

                            <Field name={`advisors.[${index}].photoURL`}>{({ field }: FieldProps) => (
                              <FloatInput
                                label="Link da foto"
                                className="advisor-input"
                                errorDisplay={
                                  <div>
                                    <ErrorMessage name={`advisors.[${index}].photoURL`} />
                                  </div>
                                }
                              >
                                <input type="text" {...field} />
                              </FloatInput>
                            )}</Field>

                            <Field name={`advisors.[${index}].name`}>{({ field }: FieldProps) => (
                              <div className="advisor-input">
                                <Icon icon="icons8:asterisk" className="icon-required-members" />
                                <FloatInput
                                  label="Nome"
                                  errorDisplay={
                                    <div>
                                      <ErrorMessage name={`advisors.[${index}].name`} />
                                    </div>
                                  }
                                >
                                  <input type="text" {...field} />
                                </FloatInput>
                              </div>
                            )}</Field>

                            <Field name={`advisors.[${index}].email`}>{({ field }: FieldProps) => (
                              <div className="advisor-input">
                                <Icon icon="icons8:asterisk" className="icon-required-members" />
                                <FloatInput
                                  label="E-mail"
                                  errorDisplay={
                                    <div>
                                      <ErrorMessage name={`advisors.[${index}].email`} />
                                    </div>
                                  }
                                >
                                  <input type="text" {...field} />
                                </FloatInput>
                              </div>
                            )}</Field>
                          </div>
                        </div>
                      ))}
                      {values.advisors.length > 1 &&
                        <ButtonAdd arrayHelpers={arrayHelpers}/>
                      }
                    </div>
                  )}
                />
                <hr className="line" />

                <FieldArray
                  name="members"
                  render={(arrayHelpers) => (
                    <div className="members-container">
                      <div className="members-header">
                        <p className="members-container-title">Integrantes</p>
                        <ButtonAdd arrayHelpers={arrayHelpers}/>
                      </div>

                      {values.members.map((member, index) => (
                        <div className="member-box" key={index}>
                          {values.members.length > 1 &&
                            <div className="button-remove-container">
                              <button
                                className="button-remove"
                                type="button"
                                onClick={() =>
                                  values.members.length > 1 ? arrayHelpers.remove(index) : null
                                }
                              >
                                -
                              </button>
                            </div>
                          }
                          <div className="content">
                            <DemoImage
                              className="member-photo-preview"
                              src={values.members[index].photoURL || undefined}
                              alt="Perfil"
                            />

                            <Field name={`members.[${index}].photoURL`}>{({ field }: FieldProps) => (
                              <FloatInput
                                label="Link da foto"
                                className="member-input"
                                errorDisplay={
                                  <div>
                                    <ErrorMessage name={`members.[${index}].photoURL`} />
                                  </div>
                                }
                              >
                                <input type="text" {...field} />
                              </FloatInput>
                            )}</Field>

                            <Field name={`members[${index}].name`}>{({ field }: FieldProps) => (
                              <div className="member-input">
                                <Icon icon="icons8:asterisk" className="icon-required-members" />
                                <FloatInput
                                  label="Nome"
                                  errorDisplay={
                                    <div>
                                      <ErrorMessage name={`members[${index}].name`} />
                                    </div>
                                  }
                                >
                                  <input type="text" {...field} />
                                </FloatInput>
                              </div>
                            )}</Field>

                            <Field name={`members.[${index}].role`}>{({ field }: FieldProps) => (
                              <div className="member-input">
                                <Icon icon="icons8:asterisk" className="icon-required-members" />
                                <FloatInput
                                  label="Função"
                                  errorDisplay={
                                    <div>
                                      <ErrorMessage name={`members.[${index}].role`} />
                                    </div>
                                  }
                                >
                                  <input type="text" {...field} />
                                </FloatInput>
                              </div>
                            )}</Field>

                            <Field name={`members.[${index}].birthday`}>{({ field }: FieldProps) => (
                              <div className="member-input">
                                <Icon icon="icons8:asterisk" className="icon-required-members" />
                                <FloatInput
                                  label="Data de nascimento"
                                  errorDisplay={
                                    <div>
                                      <ErrorMessage name={`members.[${index}].birthday`} />
                                    </div>
                                  }
                                >
                                  <input type="date" {...field} />
                                </FloatInput>
                              </div>
                            )}</Field>

                            <Field name={`members.[${index}].description`}>{({ field }: FieldProps) => (
                              <FloatInput
                                label="Descrição"
                                className="member-input"
                                errorDisplay={
                                  <div>
                                    <ErrorMessage name={`members.[${index}].description`} />
                                  </div>
                                }
                              >
                                <textarea {...field}></textarea>
                              </FloatInput>
                            )}</Field>
                          </div>
                        </div>  
                      ))}
                      {values.members.length > 1 &&
                        <div className="add-container">
                          <ButtonAdd arrayHelpers={arrayHelpers}/>
                        </div>
                      }
                    </div>
                  )}
                />
                {(status || externalStatus) &&
                  <FormMessage message={status?.message || externalStatus?.message} state={status?.state || externalStatus?.state} />
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
  );
}
export default SignUpUser;