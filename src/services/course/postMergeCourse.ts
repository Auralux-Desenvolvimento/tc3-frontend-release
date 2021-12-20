import axios from "axios";

interface IPostMergeCourseParams {
  primary: string;
  secondaries: string[];
}

export default function postMergeCourse (data: IPostMergeCourseParams) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/course/merge`,
    data,
    { withCredentials: true }
  );
  return preFilteredResponse;
}