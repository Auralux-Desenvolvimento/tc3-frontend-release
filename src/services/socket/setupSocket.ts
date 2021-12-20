import { io } from "socket.io-client";
import getChatToken from "../team/getChatToken";

export default async function setupSocket () {
  const URL = process.env.REACT_APP_SOCKETIO_URL as string;
  
  const response = await getChatToken();
  const socket = io(URL, {
    auth: {
      token: response.data
    }
  });

  return socket;
}