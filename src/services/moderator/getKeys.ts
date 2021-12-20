import axios from "axios";

export interface IGetKeysResponse {
  key: string;
  issuer?: {
    name: string;
    email: string;
  };
  receiver?: {
    name: string;
    email: string;
  };
}

export default async function getKeys (page: number) {
  const preFilteredResponse = axios.get<IGetKeysResponse[]>(
    `${process.env.REACT_APP_API_URL}/moderator/keys`,
    {
      withCredentials: true,
      params: { page }
    }
  );
  return preFilteredResponse;
}