import { AxiosError } from "axios";
import { useContext, useEffect, useRef, useState } from "react";
import Footer from "../../components/Footer";
import InlineCourseCard from "../../components/InlineCourseCard";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import PageSelector from "../../components/PageSelector";
import Searchbar from "../../components/Searchbar";
import deleteCourse from "../../services/course/deleteCourse";
import getCourse from "../../services/course/getCourse";
import getCourseCount from "../../services/course/getCourseCount";
import ErrorContext from "../../utils/ErrorContext";
import IAppError from "../../utils/types/API/IAppError";
import ICourseData from "../../utils/types/course/ICourseData";
import cloneDeep from "lodash.clonedeep";

import "./style.css";
import MergeCourses from "../../components/Modals/MergeCourses";
import CreateCourse from "../../components/Modals/CreateCourse";

export interface ICourse extends ICourseData {
  checked: boolean;
}

export default function Courses () {
  const [ courses, setCourses ] = useState<ICourse[]>([]);
  const setGlobalError = useContext(ErrorContext)[1];
  const [ count, setCount ] = useState<number>();
  const [ search, setSearch ] = useState("");
  const [ open, setOpen ] = useState(false);
  const [ openCreateCourse, setOpenCreateCourse ] = useState(false);
  const [ page, setPage ] = useState(1);

  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    handleSearch();

    return () => { mounted.current = false; }
  }, [ page ]);

  async function handleSearch (name?: string | null) {
    if (name === undefined) {
      name = search === ""
        ? undefined
        : search
      ;
    } else if (name === null) {
      name = undefined;
    }

    try {
      const newCourses = (await getCourse(page, name)).data.map<ICourse>(e => ({
        checked: false,
        ...e
      }));
      mounted.current && setCourses(newCourses);
    } catch (err: any) {
      const error: AxiosError<IAppError> = err;
      if (mounted.current) {
        if (error.response?.data.code === 2) {
          setGlobalError({
            value: "Não achamos nenhum curso com esse nome"
          });
        } else {
          setGlobalError({
            value: "Oops... Encontramos um erro inesperado, tente novamente mais tarde."
          });
        }
        setCourses([]);
        setCount(0)
      }
      return;
    }

    try {
      const count = (await getCourseCount(name)).data;
      mounted.current && setCount(count);
    } catch {
      return;
    }
  }

  function handleClear () {
    handleSearch(null)
  }

  async function handleRemoveCourse(id: string) {
    try {
      await deleteCourse(id);
    } catch (err: any) {
      const error: AxiosError<IAppError> = err;
      switch (error.response?.data.code) {
        case 2:
          setGlobalError({ value: "Já existem pessoas cursando esse curso, tente uní-lo com outro" });
          break;
        default:
          setGlobalError({value: "Oops... Encontramos um erro inesperado, tente novamente mais tarde."});
      }
      return;
    }

    if(courses && courses.length > 0) {
      let newCouse = cloneDeep(courses);
      newCouse = newCouse.filter(e => e.id !== id);
      setCourses(newCouse);
    }
  }

  function handleCheckboxSelection (state: boolean, index: number) {
    if (mounted.current) {
      const newCourses = cloneDeep(courses);
      newCourses[index].checked = state;
      setCourses(newCourses);
    }
  }

  const checked = courses.filter(e => !!e.checked);
  
  return (
    <>
      <div className="courses-page page">
        <ModeratorNavbar locale="courses">
          <Searchbar
            onSearch={handleSearch}
            searchState={[ search, setSearch ]}
            onClear={handleClear}
          />
        </ModeratorNavbar>

        <div className="content">
          <div className="button-area">
            <button className="responsive-button" onClick={() => setOpenCreateCourse(true)}>Criar Curso</button>
            {
              checked.length > 1 &&
              <button className="responsive-button .merge" onClick={() => setOpen(true)}>Unir</button>
            }
            
          </div>
          <div className="course-list">{
            courses && courses.length > 0
            ? courses.map((e, i) => (
              <InlineCourseCard 
                key={e.id} 
                onRemove={() => handleRemoveCourse(e.id)}
                courseState={[
                  e,
                  (course: ICourseData) => {
                    if (mounted.current) {
                      const newCourses = cloneDeep(courses);
                      newCourses[i] = {
                        checked: false,
                        ...course
                      };
                      setCourses(newCourses);
                    }
                  }
                ]}
                checkboxState={[
                  courses[i].checked,
                  (state: boolean) => {
                    handleCheckboxSelection(state, i);
                  }
                ]}
              />
            ))
            : <p className="not-found">Nenhum Curso Encontrado</p>
          }</div>
        </div>

        {
          courses && courses.length > 0
          ? <PageSelector pageState={[ page, setPage ]} listLength={count} />
          : null
        }
        <Footer />
      </div>
      <MergeCourses coursesState={[ courses, setCourses ]} openState={[ open, setOpen ]} />
      <CreateCourse coursesState={[ courses, setCourses ]} openState={[ openCreateCourse, setOpenCreateCourse ]} />
    </>
  );
}