import { FC, useEffect, useRef, useState } from "react"
import UseState from "../../../utils/types/UseState"
import Modal from 'react-responsive-modal';
import "react-responsive-modal/styles.css";
import "../../../assets/css/genericModal.css";
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikErrors } from "formik";
import { FloatInput } from "../../FloatingLabelInput";
import ILocationData from "../../../utils/types/location/ILocationData";
import setupLocations from "../../../utils/functions/setupLocations";
import IFormStatus from "../../../utils/types/IFormStatus";
import FormMessage from "../../FormMessage";
import Loading from "../../Loading";
import { ICurrentSuggestion, ISuggestion } from "../../SearchInput";
import { IGetCourseSearchResponse } from "../../../services/course/getCourseSearch";
import cloneDeep from "lodash.clonedeep";
import './style.css';
import FloatSearch from "../../FloatingLabelInput/FloatSearch";
import { useThrottledCallback } from "use-debounce/lib";
import { IGetTeamParams } from "../../../services/team/getTeam";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import handleGetCourses from "../../SearchInput/handlers/handleGetCourses";
import { ITag } from "../../Tag";

interface IFormValues {
  city: string;
  state: string;
  course: string;
}

interface props {
  openState: UseState<boolean>;
  searchParamsState: UseState<IGetTeamParams>;
}

const ModeratorFilter: FC<props> = ({
  openState,
  searchParamsState
}) => {
  const [ open, setOpen ] = openState;
  const mounted = useRef<boolean>();
  const [locations, setLocations] = useState<ILocationData[]>();
  const [externalStatus, setExternalStatus] = useState<IFormStatus>();
  const [currentSearch, setCurrentSearch] = useState<ICurrentSuggestion<IGetCourseSearchResponse>>({ content: "" });
  const [suggestions, setSuggestions] = useState<ISuggestion<ITag>[]>([]);
  const [searchParams, setSearchParams] = searchParamsState;
  const debouncedHandleGetCourses = useThrottledCallback((name: string) => {
    return handleGetCourses(name, setSuggestions, mounted);
  }, 400);

  useEffect(() => {
    mounted.current = true;
    setupLocations(mounted, setLocations, setExternalStatus)
    return () => { mounted.current = false }
  }, []);

  function handleSubmit (
    { city, state }: IFormValues
  ) {
    const newSearchParams = cloneDeep(searchParams);
    if (state === "") {
      newSearchParams.city = undefined;
    } else if (city !== "") {
      newSearchParams.city = city;
    } 
    newSearchParams.course = currentSearch?.value?.id;
    setSearchParams(newSearchParams);
    setOpen(false);
  }

  function clearSearch () {
    setSearchParams({ page: searchParams.page });
    setOpen(false);
  }

  function validateForm ({ city, state }: IFormValues) {
    let errors: FormikErrors<IFormValues> = {};
    if (!currentSearch?.value && currentSearch?.content !== "") {
      errors = {
        course: "Selecione um curso válido"
      };
    }
    if (state !== "" && city === "") {
      errors = {
        city: "Selecione uma cidade"
      };
    }
    return errors;
  }
  
  const state = locations?.find(e => e.cities.some(e => e.id === searchParams.city));
  return (
    <Modal    
      classNames={{
        modal: "generic-modal moderator-filter-container",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }}
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false} 
    >
      <header>
        <p>Filtrar por:</p>
      </header>
      <Formik
        initialValues={{
          state: state?.id || "",
          city: state?.cities.find(e => e.id === searchParams.city)?.id || "",
          course: currentSearch.content
        } as IFormValues}
        onSubmit={handleSubmit}
        validate={validateForm}
        enableReinitialize
      >{({ values, status, setFieldValue, isSubmitting }) => (
        <Form className="form content">
          <SimpleBar className="main">
            <FloatSearch
              current={[
                { content: values.course } as ICurrentSuggestion,
                (value: ICurrentSuggestion) => {
                  setCurrentSearch(value);
                  setFieldValue("course", value.content);
                }
              ] as UseState<ICurrentSuggestion>}
              onChange={({ target }) => debouncedHandleGetCourses(target.value)}
              suggestions={[suggestions, setSuggestions] as UseState<ISuggestion[]>}
              id="course"
              name="course"
              label="Curso"
              errorDisplay={
                <div>
                  <ErrorMessage name="course" />
                </div>
              }
            />

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
          </SimpleBar>

          <footer>
            {(status || externalStatus) &&
              <FormMessage message={status?.message || externalStatus?.message} state={status?.state || externalStatus?.state} />
            }

            {isSubmitting
              ? <Loading position="left"/>
              : <div className="controls">
                  <button className="responsive-button filter" type="submit">Filtrar</button>
                  <button
                    className="responsive-button clear-search"
                    type="button"
                    onClick={clearSearch}
                  >
                    Limpar
                  </button>
                </div>
            }
          </footer>
        </Form>
      )}</Formik>
    </Modal>
  );
}

export default ModeratorFilter;