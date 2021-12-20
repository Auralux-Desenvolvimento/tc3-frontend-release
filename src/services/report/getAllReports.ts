import axios from 'axios';
import IReportWithId from '../../utils/types/report/IReportWithId';

export enum ReportSearchType {
  pending = "pending",
  taken_over = "taken_over",
  resolved = "resolved"
}

export default async function getAllReports (
  page: number, 
  type: keyof typeof ReportSearchType = "pending"
) {
  const preFilteredResponse = await axios.get<IReportWithId[]>(
    `${process.env.REACT_APP_API_URL}/report`,
    { 
      withCredentials: true,
      params: { page, type }
    }
  );
  return preFilteredResponse;
}