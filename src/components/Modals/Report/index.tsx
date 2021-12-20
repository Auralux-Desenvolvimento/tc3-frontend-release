import { FC } from 'react';
import { ErrorMessage, Field, FieldProps, Form, Formik, FormikConfig } from 'formik';
import Modal from 'react-responsive-modal';
import UseState from '../../../utils/types/UseState';
import "../../../assets/css/genericModal.css";
import './style.css';
import { FloatInput } from '../../FloatingLabelInput';
import * as Yup from 'yup';
import postReport, { IPostReportParams } from '../../../services/report/postReport';
import FormMessage from '../../FormMessage';
import IFormStatus from '../../../utils/types/IFormStatus';
import Loading from '../../Loading';

interface props {
  openState: UseState<boolean>;
  reportedId: string;
  chatId?: string;
}

interface IFormValues {
  message: string;
}

const Report: FC<props> = ({
  openState,
  reportedId,
  chatId
}) => {
  const [ open, setOpen ] = openState;

  const ReportSchema = Yup.object().shape({
    message: Yup.string()
      .min(10, 'Mínimo de 10 caracteres')
      .max(250, 'Máximo de 250 caracteres')
      .required("Descrição obrigatória."),
  });

  const handleReport: FormikConfig<IFormValues>["onSubmit"] = async (
    { message }: IFormValues,
    { setStatus }
  ) => {
    try {
      if (reportedId) {
        let postData: IPostReportParams;
        if (chatId) {
          postData = { reportedId, message, chatId }
        } else {
          postData = { reportedId, message }
        }
        await postReport(postData)
      }
      setOpen(false);
    } catch {
      setStatus({
        message: "Algo deu errado. Tente novamente mais tarde",
        state: "error"
      } as IFormStatus);
    }
  }

  return (
    <Modal 
      classNames={{
        modal: "generic-modal report-modal",
        closeIcon: "close-icon-modal",
        closeButton: "close-modal",
        modalContainer: "generic-modal-container"
      }} 
      open={open} 
      onClose={()=>{setOpen(false)}} 
      focusTrapped={false} 
      center
    >
      <Formik 
        initialValues={{message: ""} as IFormValues}
        onSubmit={handleReport}
        validationSchema={ReportSchema}
      >{({ status, isSubmitting }) => (<Form className="report-form">
          <header>
            <p>Denunciar equipe</p>
          </header>
          <main className="message-container">
            <Field name="message">{({ field }: FieldProps) => (
              <FloatInput
                label="Digite aqui o motivo da denúncia"
                className="member-input"
                errorDisplay={
                  <div>
                    <ErrorMessage name="message" />
                  </div>
                }
              >
                <textarea {...field}></textarea>
              </FloatInput>
            )}</Field>
          </main>
          <footer>
            {
              status &&
              <FormMessage message={status.message} state={status.state} />
            }
            {
              isSubmitting
              ? <Loading />
              : <button className="responsive-button" type="submit">Denunciar</button>
            }
          </footer>
        </Form>)}
      </Formik>
    </Modal>
  )
}

export default Report;