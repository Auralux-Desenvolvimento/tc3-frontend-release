import axios from "axios";
import { RawDraftContentState } from "draft-js";
import IPostDataWithId from "../../utils/types/post/IPostDataWithId";

export interface IPostPostParams {
  title: string;
  content: RawDraftContentState;
}

export default async function postPost (postData: IPostPostParams) {
  const preFilteredResponse = await axios.post<IPostDataWithId>(
    `${process.env.REACT_APP_API_URL}/post`,
    postData,
    { withCredentials: true }
  );

  preFilteredResponse.data.createdAt = new Date(preFilteredResponse.data.createdAt);

  return preFilteredResponse;
}