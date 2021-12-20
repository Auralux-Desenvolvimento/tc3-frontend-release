import { Link } from "react-router-dom";
import SingleMessage from "../../components/SingleMessage";
import './style.css';

export default function Ban () {
  return (
    <div className="ban-page page">
      <SingleMessage
        title="Ops, parece que você foi banido."
      >
        <p className="description">Um de nossos moderadores baniu sua conta por alguma conduta inapropriada.</p>
        <Link to="/" className="responsive-button">Voltar a tela inicial</Link>
      </SingleMessage>
    </div>
  )
}