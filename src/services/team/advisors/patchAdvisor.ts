import axios from "axios";
import IAdvisorDataWithId from "../../../utils/types/advisor/IAdvisorDataWithId";

export interface IPatchAdvisorParams {
  name?: string;
  photoURL?: string | null;
  email?: string;
  password: string;
}

export default async function patchAdvisor (id: string, patchData: IPatchAdvisorParams) {
  const preFilteredResponse = await axios.patch<IAdvisorDataWithId>(
    `${process.env.REACT_APP_API_URL}/team/advisors/${id}`,
    patchData,
    {
      withCredentials: true
    }
  );

  return preFilteredResponse;
}  