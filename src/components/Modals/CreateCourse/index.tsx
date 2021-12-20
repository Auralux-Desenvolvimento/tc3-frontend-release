import { ErrorMessage, Field, FieldProps, Form, Formik, FormikConfig, FormikProps } from "formik";
import { FC } from "react";
import Modal from "react-responsive-modal";
import "../../../assets/css/genericModal.css";
import UseState from "../../../utils/types/UseState";
import { FloatInput } from "../../FloatingLabelInput";
import FormMessage from "../../FormMessage";
import Loading from "../../Loading";
import * as yup from 'yup';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import postCourse from "../../../services/course/postCourse";
import { AxiosError } from "axios";
import IAppError from "../../../utils/types/API/IAppError";
import IFormStatus from "../../../utils/types/IFormStatus";
import cloneDeep from "lodash.clonedeep";
import { ICourse } from "../../../pages/Courses";

interface IFormValues {
  name: string;
}

interface props {
  openState: UseState<boolean>;
  coursesState: UseState<ICourse[]>;
}

const postSchema = yup.object().shape({
  name: yup.string()
    .required("Por favor, preencha esse campo.")
    .min(2, "O mínimo de caracteres é 2")
    .max(254, "O máximo de caracteres é 254")
});

const CreateCourse: FC<props> = ({ openState: [ open, setOpen ], coursesState: [courses, setCourses] }) => {
  
  const handleSubmit: FormikConfig<IFormValues>["onSubmit"] = async (
    values,
    { setStatus, resetForm }
  ) => {
    let response;

    try {
      response = await postCourse(values as any);
    } catch (untypedError) {
      return setStatus({
        message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
        state: "error"
      } as IFormStatus);
    }
    
      if(response.data.id) {
        let course: ICourse = {
          id: response.data.id,
          name: response.data.name,
          checked: false
        }
  
        const newCourse = cloneDeep(courses);
        newCourse.push(course);
        setCourses(newCourse);
        resetForm();
        setOpen(false);
      }
  }
  
  return (
    <Modal 
      classNames={{
        modal: "generic-modal create-post",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }} 
      open={open}
      onClose={()=>{setOpen(false)}} 
    >

      <header>
        <p>Criar um novo curso</p>
      </header>
      <Formik
        initialValues={{
          name: ""
        } as IFormValues}
        onSubmit={handleSubmit}
        validationSchema={postSchema}
      >
        {({ status, isSubmitting }: FormikProps<IFormValues>) => (
          <Form className="form create-post-modal content">
            <SimpleBar className="main"> 
              <Field name="name">{({ field }: FieldProps) => (
                <FloatInput
                  label="Nome Do Curso"
                  errorDisplay={
                    <div>
                      <ErrorMessage name="name" />
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
              <FormMessage
                className="generic-error"
                message={status.message}
                state={status.state}
              />
            }
            <div className="controls">
              {
                isSubmitting
                ? <Loading />
                : <button className="responsive-button" type="submit">Criar</button>
              }
            </div>
            </footer>
          </Form>
        )}
      </Formik>
    </Modal>
  );
}

export default CreateCourse;