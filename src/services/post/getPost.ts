import axios from "axios";
import IPostDataWithId from "../../utils/types/post/IPostDataWithId";

export default async function getPost (page: number) {
  const preFilteredResponse = await axios.get<IPostDataWithId[]>(
    `${process.env.REACT_APP_API_URL}/post`,
    {
      withCredentials: true,
      params: { page }
    }
  );
  preFilteredResponse.data = preFilteredResponse.data.map(e => {
    e.createdAt = new Date(e.createdAt);
    return e;
  });
  return preFilteredResponse;
}