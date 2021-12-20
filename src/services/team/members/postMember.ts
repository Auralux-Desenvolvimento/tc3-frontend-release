import axios from "axios";
import IMemberData from "../../../utils/types/member/IMemberData";
import IMemberDataWithId from "../../../utils/types/member/IMemberDataWithId";

export interface IPostMemberParams extends IMemberData {
  password: string;
}

export default async function postMember (postData: IPostMemberParams) {
  const preFilteredResponse = await axios.post<IMemberDataWithId>(
    `${process.env.REACT_APP_API_URL}/team/members`,
    postData,
    {
      withCredentials: true
    }
  );

  preFilteredResponse.data.birthday = new Date(preFilteredResponse.data.birthday);
  return preFilteredResponse;
}  