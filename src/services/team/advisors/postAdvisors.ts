import axios from "axios";
import IAdvisorData from "../../../utils/types/advisor/IAdvisorData";
import IAdvisorDataWithId from "../../../utils/types/advisor/IAdvisorDataWithId";

export interface IPostAdvisorsParams extends IAdvisorData {
  password: string;
}

export default async function postAdvisors (postData: IPostAdvisorsParams) {
  const preFilteredResponse = await axios.post<IAdvisorDataWithId>(
    `${process.env.REACT_APP_API_URL}/team/advisors`,
    postData,
    {
      withCredentials: true
    }
  );

  return preFilteredResponse;
}  