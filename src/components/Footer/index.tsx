import { FC } from 'react';
import './style.css';

const Footer: FC = ({ children }) => {
  return (
    <div className="component-footer">
      <div className="children">{children}</div>
      <hr />
      <p>Todos os direitos reservados à Auralux</p>
    </div>
  );
}

export default Footer;