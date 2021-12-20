import { IEditProfileFormValues } from '../..';
import * as yup from 'yup';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikHelpers, FormikProps } from 'formik';
import editProfileSchema from '../../utils/editProfileSchema';
import { FC, HTMLAttributes, useContext, useEffect, useRef } from 'react';
import patchTeam from '../../../../../services/team/patchTeam';
import IUserTeamData from '../../../../../utils/types/team/IUserTeamData';
import UseState from '../../../../../utils/types/UseState';
import { AxiosError } from 'axios';
import IAppError from '../../../../../utils/types/API/IAppError';
import IFormStatus from '../../../../../utils/types/IFormStatus';
import StyledEditor from '../../../../StyledEditor';
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js';
import "./style.css"
import yupPasswordCheck from '../../utils/yupPasswordCheck';
import cloneDeep from 'lodash.clonedeep';
import { ITabProps } from '../../../TabModal';
import UserDataContext from '../../../../../utils/UserDataContext';
import FormMessage from '../../../../FormMessage';
import { FloatInput } from '../../../../FloatingLabelInput';
import Loading from '../../../../Loading';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

interface IFormValues extends IEditProfileFormValues {
  portfolio: EditorState;
}

const schema = editProfileSchema({
  portfolio: yup.object()
  .required()
});

const RemovePortfolio: FC<HTMLAttributes<HTMLButtonElement>> = ({
  className,
  onClick
}) => {
  return (
    <button
      className={`rdw-option-wrapper ${className ? className : ""}`}
      type="button"
      onClick={onClick}
      // {...rest}
    >
      Remover portfólio
    </button>
  );
}

const Portfolio: FC<ITabProps> = ({ openState }) => {
  const [ team, setTeam ] = useContext(UserDataContext) as UseState<IUserTeamData>;
  const mounted = useRef(false);
  const portfolio = team.portfolio
    ? EditorState.createWithContent(convertFromRaw(team.portfolio))
    : EditorState.createEmpty()
  ;

  function closeModal () {
    openState[1](false);
  }

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; }
  }, []);

  async function handleSubmit (
    { portfolio, password }: IFormValues,
    { setErrors, setStatus, resetForm }: FormikHelpers<IFormValues>
  ) {
    const content = portfolio.getCurrentContent();
    if (!content.hasText() && mounted.current) {
      return setStatus({
        message: "Insira algo para enviar um novo portfólio...",
        state: "error"
      } as IFormStatus);
    }
    const richText = convertToRaw(content);
    const newTeam = cloneDeep(team);
    newTeam.portfolio = richText;
    try {
      await patchTeam({
        portfolio: richText,
        password
      });
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case 2:
          if (mounted.current) {
            return setErrors({
              password: "Senha incorreta"
            });
          }
          break;
        case -2:
          if (mounted.current) {
            return setStatus({
              message: "Profanidade detectada!",
              state: "error"
            } as IFormStatus);
          }
          break;
        default:
          if (mounted.current) {
            return setStatus({
              message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
              state: "error"
            } as IFormStatus);
          }
      }
    }
    mounted.current && setTeam(newTeam);
    mounted.current && resetForm();
    mounted.current && closeModal()
  }

  async function handlePortfolioRemoval (
    { password }: IFormValues,
    { setStatus, setErrors, resetForm, setTouched }: FormikProps<IFormValues>,
  ) {
    const validPassword = await yupPasswordCheck(password, setTouched, setErrors);
    if (!validPassword) {
      return;
    }
    const newTeam = cloneDeep(team);
    newTeam.portfolio = undefined;
    try {
      await patchTeam({
        portfolio: null,
        password
      });
    } catch (untypedError) {
      const error: AxiosError<IAppError> = untypedError as any;
      switch (error.response?.data.code) {
        case 2:
          if (mounted.current) {
            return setErrors({
              password: "Senha incorreta"
            });
          }
          break;
        default:
          if (mounted.current) {
            return setStatus({
              message: "Oops... Encontramos um erro inesperado, tente novamente mais tarde.",
              state: "error"
            } as IFormStatus);
          }
          break;
      }
    }
    mounted.current && setTeam(newTeam);
    mounted.current && resetForm();
    mounted.current && closeModal();
  }

  return (
    <Formik 
      initialValues={{
        password: "",
        portfolio
      } as IFormValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >{({ values, setFieldValue, setTouched, setErrors, setStatus, resetForm, status, isSubmitting }: FormikProps<IFormValues>) => (
      <Form className="form portfolio-modal content">
        
        <SimpleBar className="portfolio main">
          <ErrorMessage name="portfolio" />
          <StyledEditor 
            editorState={values.portfolio}
            onChange={(editorState) => {
              mounted.current && setFieldValue("portfolio", editorState || values.portfolio)
            }}
            toolbarCustomButtons={[
              <RemovePortfolio onClick={() => handlePortfolioRemoval(values, { setStatus, setErrors, resetForm, setTouched } as any)} />
            ]}
          />
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
export default Portfolio;