import axios from "axios";
import IMemberDataWithId from "../../../utils/types/member/IMemberDataWithId";

export interface IPatchMemberParams {
  name?: string;
  photoURL?: string | null;
  role?: string;
  birthday?: Date;
  description?: string | null;
  password: string;
}

export default async function patchMember (id: string, patchData: IPatchMemberParams) {
  const preFilteredResponse = await axios.patch<IMemberDataWithId>(
    `${process.env.REACT_APP_API_URL}/team/members/${id}`,
    patchData,
    {
      withCredentials: true
    }
  );

  preFilteredResponse.data.birthday = new Date(preFilteredResponse.data.birthday);
  return preFilteredResponse;
}  