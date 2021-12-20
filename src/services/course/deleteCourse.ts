import axios from "axios";

export default function deleteCourse (id: string) {
  const preFilteredResponse = axios.delete(
    `${process.env.REACT_APP_API_URL}/course/${id}`,
    {
      withCredentials: true,
      params: { id }
    }
  );
  return preFilteredResponse;
}