import { AxiosError } from 'axios';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers } from 'formik';
import cloneDeep from 'lodash.clonedeep';
import { FC, useContext } from 'react';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';
import * as yup from 'yup';
import patchModerator from '../../../../../services/moderator/patchModerator';
import IAppError from '../../../../../utils/types/API/IAppError';
import IFormStatus from '../../../../../utils/types/IFormStatus';
import IUserModeratorData from '../../../../../utils/types/moderator/IUserModeratorData';
import UseState from '../../../../../utils/types/UseState';
import UserDataContext from '../../../../../utils/UserDataContext';
import { FloatInput } from '../../../../FloatingLabelInput';
import FormMessage from '../../../../FormMessage';
import Loading from '../../../../Loading';
import { IEditProfileFormValues } from '../../../EditProfile';
import editProfileSchema from '../../../EditProfile/utils/editProfileSchema';
import { ITabProps } from '../../../TabModal';

export interface IFormValues extends IEditProfileFormValues {
  name: string;
}


const Name: FC<ITabProps> = ({ openState }) => {
  const [ moderator, setModerator ] = useContext(UserDataContext) as UseState<IUserModeratorData>;
  const schema = editProfileSchema({
    name: yup.string()
      .required("O nome é obrigatório")
      .min(2, "Mínimo de 2 caracteres")
      .max(45, "Máximo de 45 caracteres")
      .test("sameName", "Você não pode trocar para o mesmo nome", (value) => {
        return value !== moderator.name;
      })
  });

  function closeModal () {
    openState[1](false);
  }

  async function handleSubmit (
    values: IFormValues,
    { setErrors, resetForm, setStatus }: FormikHelpers<IFormValues>
  ) {
    try {
      await patchModerator(values);
    } catch (err: any) {
      const error: AxiosError<IAppError> = err;
      switch (error.response?.data.code) {
        case 2:
          return setErrors({
            password: "Senha inválida"
          });
        case 3:
          return setErrors({
            name: "Você não pode trocar para o mesmo nome"
          });
        default:
          return setStatus({
            message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
            state: "error"
          } as IFormStatus);
      }
    }

    const newModerator = cloneDeep(moderator);
    newModerator.name = values.name;
    setModerator(newModerator);
    resetForm();
    closeModal();
  }

  return (
    <Formik
      initialValues={{
        name: "",
        password: ""
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ status, isSubmitting }) => (
      <Form className="form content">
        <SimpleBar className="main">
          <Field name="name">{({ field: { value, ...field } }: FieldProps) => (
            <FloatInput
              label="Novo nome"
              errorDisplay={
                <div>
                  <ErrorMessage name="name" />
                </div>
              }
            >
              <input type="text" value={value || ""} {...field}/>
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
export default Name;