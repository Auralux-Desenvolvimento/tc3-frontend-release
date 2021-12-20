import axios from "axios";
import ICourseData from "../../utils/types/course/ICourseData";

export default function getCourse (page: number, name?: string) {
  const preFilteredResponse = axios.get<ICourseData[]>(
    `${process.env.REACT_APP_API_URL}/course`,
    {
      withCredentials: true,
      params: { name, page }
    }
  );
  return preFilteredResponse;
}