import { ErrorMessage, Field, FieldProps, Form, Formik, FormikConfig } from "formik";
import { FC, useContext } from "react";
import Modal from "react-responsive-modal";
import "../../../assets/css/genericModal.css";
import UseState from "../../../utils/types/UseState";
import * as yup from 'yup';
import { FloatInput } from "../../FloatingLabelInput";
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import UserDataContext from "../../../utils/UserDataContext";
import IUserTeamData from "../../../utils/types/team/IUserTeamData";
import { AxiosError } from "axios";
import IAppError from "../../../utils/types/API/IAppError";
import FormMessage from "../../FormMessage";
import IFormStatus from "../../../utils/types/IFormStatus";
import deleteMember from "../../../services/team/members/deleteMember";
import Loading from "../../Loading";
import cloneDeep from "lodash.clonedeep";

interface props {
  openState: UseState<boolean>;
  currentMember?: string;
}

interface IFormValues {
  password: string;
}

const schema = yup.object().shape({
  password: yup.string()
    .required("A senha é obrigatória")
    .min(8, 'Mínimo de 8 caracteres')
    .max(30, 'Máximo de 30 caracteres'),
});

const DeleteMember: FC<props> = ({ openState: [ open, setOpen ], currentMember }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;

  const handleSubmit: FormikConfig<IFormValues>["onSubmit"] = async (
    { password },
    { setStatus, setErrors, resetForm }
  ) => {
    if (!currentMember) {
      return;
    }
    try {
      await deleteMember(currentMember, password);
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
          } as IFormStatus);
      }
    }
    const newTeam = cloneDeep(team);
    newTeam.members.splice(newTeam.members.findIndex(e => e.id === currentMember), 1);
    setTeam(newTeam);
    resetForm();
    setOpen(false);
  }

  return (
    <Modal 
      classNames={{
        modal: "generic-modal create-member",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false}
    >
      <header>
        <p>Tem certeza disso?</p>
      </header>
      <Formik 
        initialValues={{
          password: ""
        } as IFormValues}
        validationSchema={schema}
        onSubmit={handleSubmit}
      >{({ status, isSubmitting }) => (<>
        <Form className="content">
          <SimpleBar className="main">
            <p>O membro será removido para sempre...</p>
          </SimpleBar>
          <footer>
            {
              status &&
              <FormMessage message={status.message} state={status.state} />
            }
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
              : <button className="responsive-button" type="submit">Confirmar</button>
            }
          </footer>
        </Form>
      </>)}</Formik>
    </Modal>
  );
}
export default DeleteMember;