import axios from "axios";

export interface IPostReportParams {
  reportedId: string;
  message: string;
  chatId?: string;
}

export default async function postReport (postData: IPostReportParams) {
  const preFilteredResponse = await axios.post(
    `${process.env.REACT_APP_API_URL}/report`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}