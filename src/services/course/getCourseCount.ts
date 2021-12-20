import axios from "axios";

export default function getCourseCount (name?: string) {
  const preFilteredResponse = axios.get<number>(
    `${process.env.REACT_APP_API_URL}/course/count`,
    {
      withCredentials: true,
      params: { name }
    }
  );
  return preFilteredResponse;
}