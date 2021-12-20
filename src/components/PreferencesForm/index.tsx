import { AxiosError } from "axios";
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikErrors, FormikHelpers } from "formik";
import { FC, HTMLAttributes, useEffect, useRef, useState } from "react";
import { useThrottledCallback } from "use-debounce/lib";
import preferencesPost, { IPostPreferencesParams } from "../../services/preferences/postPreferences";
import setupLocations from "../../utils/functions/setupLocations";
import IAppError from "../../utils/types/API/IAppError";
import IFormStatus from "../../utils/types/IFormStatus";
import ILocationData from "../../utils/types/location/ILocationData";
import { ITag } from "../Tag";
import { FloatInput } from "../FloatingLabelInput";
import FormMessage from "../FormMessage";
import Loading from "../Loading";
import { ICurrentSuggestion, ISuggestion } from "../SearchInput";
import './style.css';
import handleGetCourses from "../SearchInput/handlers/handleGetCourses";
import SearchList from "../SearchList";
import handleGetKeywords from "../SearchInput/handlers/handleGetKeywords";

interface IPreferencesValues {
  city: string;
  state: string;
  hasTheme: "true" | "false" | "";
  course: string;
  keyword: string;
}

interface PreferenceFormProps extends HTMLAttributes<HTMLDivElement> {
  h1Title?: string;
  labelLocal: string;
  labelTheme: string;
  labelCourse: string;
  button: string;
  onSubmit: (() => void)|(() => Promise<void>)
}

const PreferencesForm: FC<PreferenceFormProps> = ({
  h1Title,
  labelLocal,
  labelCourse,
  labelTheme,
  button,
  onSubmit
}) => {
  const [ externalStatus, setExternalStatus ] = useState<IFormStatus>();
  const [ locations, setLocations ] = useState<ILocationData[]>();
  const mounted = useRef<boolean>();
  const [ courseSuggestions, setCourseSuggestions ] = useState<ISuggestion<ITag>[]>([]);
  const [ coursesItems, setCoursesItems ] = useState<ITag[]>([]);
  const [ keywordSuggestions, setKeywordSuggestions ] = useState<ISuggestion[]>([]);
  const [ keywordItems, setKeywordItems ] = useState<ITag[]>([]);
  const debouncedHandleGetCourses = useThrottledCallback((name: string) => handleGetCourses(
    name, 
    setCourseSuggestions, 
    mounted, 
    e => !coursesItems.some(f => e.value.id === f.id)
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

  function validateForm () {
    const errors: FormikErrors<IPreferencesValues> = {};

    if (!coursesItems.length) {
      errors.course = "Selecione no mínimo um curso";
    }

    return errors;
  }
  
  async function handleSubmit (
    {
      city,
      state,
      hasTheme
    }: IPreferencesValues,
    {
      setStatus,
      setErrors
    }: FormikHelpers<IPreferencesValues>
  ) {
    const postData: IPostPreferencesParams = {
      courses: coursesItems.map(e => e.id as string)
    };

    if (keywordItems.length) {
      postData.keywords = keywordItems.map(e => e.id as string);
    }

    if (city) {
      postData.city = city;
    } else if (state) {
      postData.state = state;
    }

    if (hasTheme) {
      if (hasTheme === "true") {
        postData.hasTheme = true;
      } else if (hasTheme === "false") {
        postData.hasTheme = false;
      }
    }

    try {
      await preferencesPost(postData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;

      switch (error.response?.data.code) {
        case 2:
          return setErrors({
            city: "Cidade inválida"
          });
        case 3:
          return setErrors({
            state: "Estado inválido"
          });
        case 4:
          return setErrors({
            course: "Curso inválido"
          })
        case 5:
          return setErrors({
            course: "Palavra-chave inválida"
          })
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus);
      }
    }
    await onSubmit();
  }

  return (
    <Formik
      initialValues={{
        state: "",
        city: "",
        hasTheme: "",
        course: "",
        keyword: ""
      } as IPreferencesValues}
      onSubmit={handleSubmit}
      validate={validateForm}
    >{({ values, status, setFieldValue, isSubmitting }) => (
      <div className="form-container">
        <Form className="form">
          <h1 className="title-initial-page">{h1Title}</h1>

          <div className="input-title">
            <p className="label-pref">{labelCourse}</p>
          </div>
          <div className="course-search">
            <SearchList 
              current={[
                { content: values.course },
                (value: ICurrentSuggestion) => setFieldValue("course", value.content)
              ]}
              suggestions={[ courseSuggestions, setCourseSuggestions ]}
              items={[ coursesItems, setCoursesItems ]}
              name="course"
              placeholder="Digite um curso por vez"
              onChange={() => debouncedHandleGetCourses(values.course)}
              error={<ErrorMessage name="course" />}
              strict
            />
          </div>

          <div className="input-title">
            <p className="label-pref">{labelLocal}</p>
            <p className="optional-section">(Opcional) Você pode selecionar somente o estado, se desejar</p>
          </div>
          <Field name="state">{({ field }: FieldProps) => (
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
                  <option value={e.id} key={e.id}>{e.state}</option>
                ))}
              </select>
            </FloatInput>
          )}</Field>

          <Field name="city">{({ field }: FieldProps) => (
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
                {locations?.find(e => e.id === values.state)?.cities.map(e => (
                  <option key={e.id} value={e.id}>{e.name}</option>
                ))}
              </select>
            </FloatInput>
          )}
          </Field>

          <div className="input-title-wrapper">
            <div className="input-title">
              <div className="label-pref" id="radio-group">
                {labelTheme}
              </div>
              <p className="optional-section">(Opcional)</p>
            </div>
            <ErrorMessage name="hasTheme">{msg => 
              <div className="title-error">{msg}</div>
            }</ErrorMessage>
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
          </div>

          {
            values.hasTheme === "true" &&
            <>
              <div className="input-title">
                <p className="label-pref">Selecione palavras-chave para temas que você tem interesse:</p>
                <p className="optional-section">(Opcional)</p>
              </div>
              <SearchList 
                current={[
                  { content: values.keyword },
                  (value: ICurrentSuggestion) => setFieldValue("keyword", value.content)
                ]}
                suggestions={[ keywordSuggestions, setKeywordSuggestions ]}
                items={[ keywordItems, setKeywordItems ]}
                name="keyword"
                placeholder="Digite uma palavra-chave por vez"
                onChange={() => debouncedHandleGetKeywords(values.keyword)}
                error={<ErrorMessage name="keyword" />}
                strict
              />
            </>
          }

          {(status || externalStatus) &&
            <FormMessage message={status?.message || externalStatus?.message} state={status?.state || externalStatus?.state} />
          }

          {isSubmitting
            ? <Loading position="left"/>
            : <button className="responsive-button" type="submit">{button}</button>
          }

        </Form>
      </div>
    )}</Formik>
  )
}

export default PreferencesForm;