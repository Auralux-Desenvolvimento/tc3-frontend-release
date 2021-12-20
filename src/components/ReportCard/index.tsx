import { FC, HTMLAttributes } from "react";
import { Link } from "react-router-dom";
import Image from "../Image";
import userPlaceholder from '../../assets/img/user-placeholder.svg';
import IReportWithId from "../../utils/types/report/IReportWithId";
import "./style.css";

interface props extends HTMLAttributes<HTMLDivElement> {
  report: IReportWithId,
}

const ReportCard: FC<props> = ({
  report
}) => {
  return (
    <Link className="report-card-container" to={`/denuncia/${report.id}`}>
      <Image className="photo" src={report.reported.logoURL} alt={report.reported.name} fallback={userPlaceholder} /> 
      <h1 className="name-team">{report.reported.name}</h1>
      <h3 className="type-report">{`${report.type === 'team' ? "EQUIPE" : "CHAT"}`}</h3>
      <p className="description-report"><strong>Mensagem:</strong>{report.message}</p>

      <button
        className="responsive-button"
      >
        Analisar
      </button>
    </Link>
  );
}

export default ReportCard;