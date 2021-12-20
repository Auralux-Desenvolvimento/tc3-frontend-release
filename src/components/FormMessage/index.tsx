import { FC } from 'react';

import './style.css';

export enum FormMessageState {
  success = "success",
  error = "error",
  warning = "warning"
}

interface props extends React.HTMLAttributes<HTMLDivElement> {
  message: string;
  state: keyof typeof FormMessageState;
}

const FormMessage: FC<props> = ({
  message,
  state,
  className,
  ...rest
}) => {
  return (
    <div className={`${className ? className : ""} form-message ${FormMessageState[state]}`} {...rest}>
      <strong>{message}</strong>
    </div>
  );
}

export default FormMessage;