import { IEditProfileFormValues } from '../..';
import * as yup from 'yup';
import { Field, FormikHelpers, ErrorMessage, FieldProps, FormikProps, Form, Formik } from 'formik';
import { FloatInput } from "../../../../FloatingLabelInput";
import editProfileSchema from '../../utils/editProfileSchema';
import updatePassword, { IPostUpdatePasswordParams } from '../../../../../services/team/updatePassword/postUpdatePassword';
import { AxiosError } from 'axios';
import IAppError from '../../../../../utils/types/API/IAppError';
import IFormStatus from '../../../../../utils/types/IFormStatus';
import { ITabProps } from '../../../TabModal';
import { FC } from 'react';
import FormMessage from '../../../../FormMessage';
import Loading from '../../../../Loading';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

interface IFormValues extends IEditProfileFormValues {
  newPassword: string,
  newPasswordConfirmation: string
}

const schema = editProfileSchema({
  newPassword: yup.string()
    .required("Campo obrigatório")
    .min(8, "Mínimo de 8 caracteres")
    .max(30, "Máximo de 30 caracteres"),
  newPasswordConfirmation: yup.string()
    .required("Campo obrigatório")
    .oneOf([yup.ref("newPassword"), null], "As senhas não são iguais")
});

const Password: FC<ITabProps> = ({ openState }) => {
  function closeModal () {
    openState[1](false);
  }
  
  async function handleSubmit (
    { password, newPassword }: IFormValues,
    { setStatus, setErrors }: FormikHelpers<IFormValues>
  ) {
    const postData: IPostUpdatePasswordParams = { 
      oldPassword: password,
      newPassword
    }
  
    try {
      await updatePassword(postData);
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code){
        case 2:
          return setErrors({
            password: "Senha incorreta"
          });
        case 3:
          return setStatus({
            message: "A nova senha não pode ser a mesma que a anterior",
            state: "error"
          } as IFormStatus);
        case -1:
          return setStatus({
            message: "Ops... Parece que você não está logado! Faça login para realizar essa ação.",
            state: "error"
          } as IFormStatus);
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus);
      }
    }
  
    closeModal();
  }

  return (
    <Formik 
      initialValues={{
        newPassword: "",
        newPasswordConfirmation: "",
        password: "",
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ status, isSubmitting }: FormikProps<IFormValues>) => (
      <Form className="form content">
        <SimpleBar className="main">
          <Field name="newPassword">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Insira sua nova senha"
              errorDisplay={
                <div>
                  <ErrorMessage name="newPassword" />
                </div>
              }
            >
              <input type="password" value={value || ""} {...field} />
            </FloatInput>
          )}</Field>

          <Field name="newPasswordConfirmation">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Confirme sua nova senha"
              errorDisplay={
                <div>
                  <ErrorMessage name="newPasswordConfirmation" />
                </div>
              }
            >
              <input type="password" value={value || ""} {...field} />
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
export default Password;