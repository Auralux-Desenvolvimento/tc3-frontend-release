import { useContext, useEffect, useRef, useState } from "react";
import ReportCard from "../../components/ReportCard";
import Footer from "../../components/Footer";
import ModeratorNavbar from "../../components/ModeratorNavbar";
import "./style.css";
import '../../assets/css/listPage.css';
import IReportWithId from "../../utils/types/report/IReportWithId";
import getAllReports from "../../services/report/getAllReports";
import PageSelector from "../../components/PageSelector";
import ErrorContext from "../../utils/ErrorContext";
import getCountReports from "../../services/report/getCountReports";
import Sidebar from "../../components/Sidebar";
import { AxiosError } from "axios";
import IAppError from "../../utils/types/API/IAppError";

const options = {
  pending: "Pendentes",
  taken_over: "Assumidas",
  resolved: "Resolvidas"
};

export default function AllReports () {
  const mounted = useRef(false);
  const [ reports, setReports ] = useState<IReportWithId[]>();
  const [ count, setCount ] = useState<number>();
  const [ page, setPage ] = useState<number>(1);
  const [ index, setIndex ] = useState<number>(0);
  const setGlobalError = useContext(ErrorContext)[1];

  useEffect(() => {
    mounted.current = true;

    getCountReports(Object.keys(options)[index] as any).then(response => {
      mounted.current && setCount(response.data);
    }).catch(() => {});

    return () => { mounted.current = false; }
  }, [ index ]);

  useEffect(() => {
    getAllReports(page, Object.keys(options)[index] as any).then(response => {
      mounted.current && setReports(response.data);
    }).catch((error: AxiosError<IAppError>) => {
      if (mounted.current) {
        switch (error.response?.data.code) {
          case 2:
            break;
          default:
            setGlobalError({ value: "Desculpe... Não conseguimos gerar o relatório das denúncias no momento." });
            break;
        }
        setReports([]);
        setCount(0);
      }
    });
  }, [ page, index ]);

  return (
    <div className="all-reports list-page page">
      <ModeratorNavbar className="list-page-navbar" locale="reports" />
      <div className="content-container">
        <Sidebar index={[ index, setIndex ]}  options={Object.values(options)} />
        <div className="content-list">
          { reports?.length 
            ? reports.map(e =>
                <ReportCard
                  key={e.id}
                  report={e}
                />
              ) 
            : <div className="not-found">Ops... Não achamos nenhuma denúncia.</div>
          }
          {
            typeof reports?.length === "number" && reports?.length > 0 &&
            <PageSelector listLength={count} pageState={[ page, setPage ]} />
          }
          <Footer />
        </div>
      </div>
    </div>
  )
}