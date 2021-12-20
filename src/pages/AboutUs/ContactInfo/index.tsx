import { FC } from "react";
import "./style.css";

interface IContactInfoProps {
  data: {
    element: JSX.Element;
    link: string;
  }[];
}

const ContactInfo: FC<IContactInfoProps> = ({ data }) => {
  return (
    <div className="contact-info">{data.map(({ element, link }) => (
      <a key={Math.random()} href={link} target="_blank">
        { element }
      </a>
    ))}</div>
  );
}
export default ContactInfo;