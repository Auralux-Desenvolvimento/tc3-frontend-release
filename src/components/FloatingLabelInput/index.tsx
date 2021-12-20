import { 
  FC, 
  useState,
  HTMLAttributes,
  isValidElement,
  cloneElement,
  ReactElement,
  HTMLProps,
  useEffect
} from 'react';
import "./style.css";

interface IFloatElement<Type> extends HTMLAttributes<HTMLDivElement> {
  label: string;
  labelProps?: HTMLAttributes<HTMLLabelElement>;
  errorDisplay?: ReactElement<HTMLProps<HTMLDivElement>>;
  children: ReactElement<HTMLProps<Type>>;
}

const FloatInput: FC<IFloatElement<HTMLInputElement>> = ({
  label,
  className,
  children,
  errorDisplay,
  labelProps,
  ...rest
}) => {
  const [ active, setActive ] = useState<boolean>(children.props.value?.length > 0);

  useEffect(() => {
    setActive(children.props.value?.length > 0);
  }, [ children.props.value ]);

  //children props
  const {
    className: childrenClassName,
    id: childrenId,
  } = (children as ReactElement<HTMLProps<HTMLInputElement>>).props;

  //error props
  let errorClassName;
  if (errorDisplay) {
    errorClassName = errorDisplay.props.className;
  }
  
  //the props to be injected into the element
  const props = {
    className: `input ${active ? "active" : ""} ${childrenClassName ? childrenClassName : ""}`,
  } as (Partial<React.HTMLProps<HTMLInputElement>> & React.Attributes);

  //sets the variables from the label's props
  let labelClassName = "";
  let restLabel = {};
  if (labelProps) {
    const { className: labelClassNameInner, ...restLabelInner } = labelProps;
    labelClassName = labelClassNameInner || "";
    restLabel = restLabelInner;
  }

  //the props that will be injected into the errorDisplay  
  const errorProps: (Partial<React.HTMLProps<HTMLDivElement>> & React.Attributes) = errorDisplay
  ? { className: `error ${errorClassName ? errorClassName : ""}` }
  : {}

  return (
    <div className={`float-input ${className ? className : ""}`} {...rest}>
      {//checks if the input is valid and injects props into it
        isValidElement(children) 
        && cloneElement(children, props)
      }
      <label 
        htmlFor={childrenId} 
        className={`label ${active ? "top" : ""} ${labelClassName}`}
        {...restLabel}
      >
        {label}
      </label>
      {errorDisplay ? cloneElement(errorDisplay, errorProps) : null}
    </div>
  );
}

export { FloatInput };