import { FC, useState, HTMLAttributes, ReactElement, HTMLProps, cloneElement, ReactNode, useEffect } from "react";
import SearchInput, { ISearchInputProps } from "../../SearchInput";

import '../style.css';
import './style.css';

interface props extends ISearchInputProps {
  label: string;
  labelProps?: HTMLAttributes<HTMLLabelElement>;
  errorDisplay?: ReactElement<HTMLProps<HTMLDivElement>>;
  icon?: ReactNode;
}

const FloatSearch: FC<props> = ({
  current,
  suggestions,
  id,
  label,
  labelProps,
  errorDisplay,
  className,
  icon,
  ...rest
}) => {
  const [ active, setActive ] = useState<boolean>(!!(current[0].content.length > 0));
  const innerId = id || "search-input";
  const innerClassName = `input ${className ? className : ""}`
  let errorClassName: string|undefined = "";
  if (errorDisplay) {
    errorClassName = (errorDisplay as ReactElement<HTMLProps<HTMLDivElement>>).props.className;
  }

  useEffect(() => {
    setActive(!!(current[0].content.length > 0));
  }, [ current[0].content ]);

  let labelClassName = "";
  let restLabel = {};
  if (labelProps) {
    const { className: labelClassNameInner, ...restLabelInner } = labelProps;
    labelClassName = labelClassNameInner || "";
    restLabel = restLabelInner;
  }

  const errorProps: (Partial<React.HTMLProps<HTMLDivElement>> & React.Attributes) = errorDisplay
  ? { className: `error ${errorClassName}` }
  : {};

  return (
    <div className="float-input float-search">
      <SearchInput
        className={innerClassName}
        current={current}
        suggestions={suggestions}
        id={innerId}
        icon={icon}
        {...rest}
      >
        <label 
          htmlFor={innerId} 
          className={`label ${active ? "top" : ""} ${labelClassName}`}
          {...restLabel}
        >
          {label}
        </label>
        {errorDisplay ? cloneElement(errorDisplay, errorProps) : null}
      </SearchInput>
    </div>
  );
}
export default FloatSearch;