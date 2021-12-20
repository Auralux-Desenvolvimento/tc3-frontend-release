import { Field, Form, Formik, FormikConfig } from "formik";
import { FC, useEffect, useRef } from "react";
import Modal from "react-responsive-modal";
import "../../../assets/css/genericModal.css";
import UseState from "../../../utils/types/UseState";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import FormMessage from "../../FormMessage";
import IFormStatus from "../../../utils/types/IFormStatus";
import Loading from "../../Loading";
import { ICourse } from "../../../pages/Courses";
import postMergeCourse from "../../../services/course/postMergeCourse";
import './style.css';
import { cloneDeep } from "lodash";

interface props {
  openState: UseState<boolean>;
  coursesState: UseState<ICourse[]>;
}

interface IFormValues {
  courses?: string;
}

const MergeCourses: FC<props> = ({ openState: [ open, setOpen ], coursesState: [ rawCourses, setCourses ] }) => {
  const courses = rawCourses.filter(e => !!e.checked);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; }
  }, []);

  const handleSubmit: FormikConfig<IFormValues>["onSubmit"] = async (
    { courses: primary },
    { setStatus, resetForm }
  ) => {
    if (!primary) {
      return setStatus({
        message: "Selecione um curso",
        state: "error"
      } as IFormStatus);
    }

    const secondaries = courses.filter(e => e.id !== primary).map<string>(e => e.id);

    try {
      await postMergeCourse({ primary, secondaries });
    } catch {
      return mounted.current && setStatus({
        message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde."
      } as IFormStatus);
    }

    if (mounted.current) {
      let newCourses = cloneDeep(rawCourses);
      newCourses = newCourses
        .filter(e => !secondaries.includes(e.id))
        .map(e => {
          e.checked = false;
          return e;
        });
      setCourses(newCourses);
  
      resetForm();
      setOpen(false);
    }
  }

  return (
    <Modal 
      classNames={{
        modal: "generic-modal merge-courses",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false}
    >
      <header>
        <p>Qual curso você quer manter?</p>
      </header>
      <Formik 
        initialValues={{} as IFormValues}
        onSubmit={handleSubmit}
      >{({ status, isSubmitting }) => (<>
        <Form className="content">
          <SimpleBar className="main">
            <div className="courses">{courses.map(e => (
              <div className="course-option" key={e.id}>
                <Field name="courses" id={e.id} type="radio" value={e.id} />
                <label htmlFor={e.id} className="course">{e.name}</label>
              </div>
            ))}</div>
          </SimpleBar>
          <footer>
            {
              status &&
              <FormMessage message={status.message} state={status.state} />
            }
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
export default MergeCourses;