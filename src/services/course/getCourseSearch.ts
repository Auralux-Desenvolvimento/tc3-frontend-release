import axios from "axios";

export interface IGetCourseSearchResponse {
  id: string;
  name: string;
  similarity: number;
}

export default function getCourseSearch (name: string) {
    const preFilteredResponse = axios.get<IGetCourseSearchResponse[]>(
      `${process.env.REACT_APP_API_URL}/course/search/${name}`,
      { withCredentials: true }
    );
    return preFilteredResponse;
}