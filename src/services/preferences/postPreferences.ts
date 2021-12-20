import axios from "axios";

export interface IPostPreferencesParams {
  city?: string;
  state?: string;
  hasTheme?: boolean;
  courses: string[];
  keywords?: string[];
}

export default function postPreferences (postData: IPostPreferencesParams) {
  const preFilteredResponse = axios.post(
    `${process.env.REACT_APP_API_URL}/team/preferences`,
    postData,
    { withCredentials: true }
  );
  return preFilteredResponse;
}  