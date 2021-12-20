import xLg from "@iconify-icons/bi/x-lg";
import { Icon } from "@iconify/react";
import { FC, HTMLAttributes, MouseEvent } from "react";
import "./style.css";

export interface ITag  {
  label: string;
  id?: string;
}

export type ITagProps = HTMLAttributes<HTMLDivElement> & ITag & {
  handleDelete?(event: MouseEvent<HTMLButtonElement>): void;
}

const Tag: FC<ITagProps> = ({
  label: name,
  handleDelete,
  className,
  ...rest
}) => {
  return (
    <div className={`tag-container ${className ? className : ""}`} {...rest}>
      <p className="tag">{name}</p>
      {
        !!handleDelete &&
        <button
          className="remove-tag"
          onClick={handleDelete}
          type="button"
        >
          <Icon icon={xLg} width="10" height="10"/>
        </button>
      }
    </div>
  );
}

export default Tag;