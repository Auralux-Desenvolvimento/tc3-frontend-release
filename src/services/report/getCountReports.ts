import axios from 'axios';
import { ReportSearchType } from './getAllReports';

export default async function getCountReports (type: keyof typeof ReportSearchType = "pending") {
  const preFilteredResponse = await axios.get<number>(
    `${process.env.REACT_APP_API_URL}/report/count`,
    {
      withCredentials: true,
      params: { type }
    }
  );
  return preFilteredResponse;
}