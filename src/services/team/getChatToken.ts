import axios from 'axios';

export default async function getChatToken () {
  const preFilteredResponse = await axios.get<string>(
    `${process.env.REACT_APP_API_URL}/team/chat-token`,
    { 
      withCredentials: true,
    }
  );
  return preFilteredResponse;
}