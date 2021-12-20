import { AxiosError } from 'axios';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers } from 'formik';
import { FC } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import * as yup from 'yup';
import patchPassword from '../../../../../services/moderator/patchPassword';
import IAppError from '../../../../../utils/types/API/IAppError';
import IFormStatus from '../../../../../utils/types/IFormStatus';
import { FloatInput } from '../../../../FloatingLabelInput';
import FormMessage from '../../../../FormMessage';
import Loading from '../../../../Loading';
import { IEditProfileFormValues } from '../../../EditProfile';
import editProfileSchema from '../../../EditProfile/utils/editProfileSchema';
import { ITabProps } from '../../../TabModal';

export interface IFormValues extends IEditProfileFormValues {
  newPassword: string;
  newPasswordConfirmation: string;
}

const Password: FC<ITabProps> = ({ openState }) => {
  const schema = editProfileSchema({
    newPassword: yup.string()
      .required("Campo obrigatório")
      .min(8, "Mínimo de 8 caracteres")
      .max(30, "Máximo de 30 caracteres"),
    newPasswordConfirmation: yup.string()
      .required("Campo obrigatório")
      .oneOf([yup.ref("newPassword"), null], "As senhas não são iguais")      
  });

  function closeModal () {
    openState[1](false);
  }

  async function handleSubmit (
    { newPassword, password }: IFormValues,
    { setErrors, resetForm, setStatus }: FormikHelpers<IFormValues>
  ) {
    try {
      await patchPassword({ newPassword, oldPassword: password });
    } catch (err: any) {
      const error: AxiosError<IAppError> = err;
      switch (error.response?.data.code) {
        case 2:
          return setErrors({
            password: "Senha inválida"
          });
        case 3:
          return setErrors({
            newPasswordConfirmation: "A nova senha não pode ser a mesma que a anterior",
            newPassword: "A nova senha não pode ser a mesma que a anterior",
          });
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus);
      }
    }

    resetForm();
    closeModal();
  }

  return (
    <Formik
      initialValues={{
        newPassword: "",
        newPasswordConfirmation: "",
        password: ""
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ status, isSubmitting }) => (
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