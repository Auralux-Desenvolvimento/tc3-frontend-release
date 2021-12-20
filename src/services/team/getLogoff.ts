import axios from 'axios';

export default async function getLogoff () {
  const preFilteredResponse = await axios.get(
    `${process.env.REACT_APP_API_URL}/logoff`,
    { 
      withCredentials: true,
    }
  );
  return preFilteredResponse;
}