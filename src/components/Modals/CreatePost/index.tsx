import { convertToRaw, EditorState } from "draft-js";
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from "formik";
import { FC, useEffect, useRef } from "react";
import Modal from "react-responsive-modal";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import UseState from "../../../utils/types/UseState";
import { FloatInput } from "../../FloatingLabelInput";
import FormMessage from "../../FormMessage";
import Loading from "../../Loading";
import StyledEditor from "../../StyledEditor";
import * as yup from 'yup';
import './style.css';
import IFormStatus from "../../../utils/types/IFormStatus";
import postPost, { IPostPostParams } from "../../../services/post/postPost";
import { AxiosError } from "axios";
import IAppError from "../../../utils/types/API/IAppError";
import cloneDeep from "lodash.clonedeep";
import IPostDataWithId from "../../../utils/types/post/IPostDataWithId";

interface props {
  openState: UseState<boolean>;
  postsState: UseState<IPostDataWithId[]>;
}

interface IFormValues {
  title: string;
  content: EditorState;
}

const postSchema = yup.object().shape({
  title: yup.string()
    .required("Por favor, preencha esse campo.")
    .min(2, "O mínimo de caracteres é 2")
    .max(254, "O máximo de caracteres é 254"),
  content: yup.object()
    .required("Por favor, preencha esse campo.")
});

const CreatePost: FC<props> = ({ openState: [ open, setOpen ], postsState: [ posts, setPosts ] }) => {
  const content = EditorState.createEmpty();
  const mounted = useRef(false);
  
  function closeModal () {
    setOpen(false);
  }

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; }
  }, []);

  async function handleSubmit (
    { title, content: contentState }: IFormValues,
    { setErrors, setStatus, resetForm }: FormikHelpers<IFormValues>
  ) {
    const content = contentState.getCurrentContent();
    if (!content.hasText() && mounted.current) {
      return setStatus({
        message: "Insira algo para enviar um novo portfólio...",
        state: "error"
      } as IFormStatus);
    }

    const postContent = convertToRaw(content);
    const postData: IPostPostParams = {
      title,
      content: postContent
    };
    let newPost;
    try {
      newPost = (await postPost(postData)).data;
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case 1:
          if (mounted.current) {
            setStatus({
              message: "Erro de validação. Revise o que inseriu, por favor.",
              state: "error"
            });
          }
          break;
        default:
          setStatus({
            message: "Ops, ocorreu um erro inesperado. Tente novamente mais tarde.",
            state: "error"
          });
      }
      return;
    }

    if (mounted.current) {
      const newPosts = cloneDeep(posts);
      newPosts.push(newPost);
      setPosts(newPosts);

      resetForm();
      closeModal();
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
      focusTrapped={false}
    > 
      <header>
        <p>Criar uma nova postagem</p>
      </header>
      <Formik
        initialValues={{
          title: "",
          content
        } as IFormValues}
        onSubmit={handleSubmit}
        validationSchema={postSchema}
      >
        {({ values, setFieldValue, status, isSubmitting }: FormikProps<IFormValues>) => (
          <Form className="form create-post-modal content">
            <SimpleBar className="post-content main">
              <Field name="title">{({ field }: FieldProps) => (
                <FloatInput
                  label="Título"
                  errorDisplay={
                    <div>
                      <ErrorMessage name="title" />
                    </div>
                  }
                >
                  <input {...field} />
                </FloatInput>
              )}</Field>

              <StyledEditor 
                editorState={values.content}
                onChange={(editorState) => {
                  mounted.current && setFieldValue("content", editorState || values.content)
                }}
              />
              <ErrorMessage name="content" />
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
  )
}

export default CreatePost;