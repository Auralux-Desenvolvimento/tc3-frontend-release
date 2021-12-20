import { AxiosError } from "axios";
import getLogin from "../../services/login/getLogin";
import logoff from "../../services/team/getLogoff";
import IAppError from "../types/API/IAppError";
import IUserModeratorData from "../types/moderator/IUserModeratorData";
import IUserTeamData from "../types/team/IUserTeamData";
import { SetUseState } from "../types/UseState";
import { setCredentials } from "./manageUserLoginState";
import { MutableRefObject } from "react";
import { History } from 'history';
import { Socket } from "socket.io-client";

export default async function getUserDataWithToken (
  setUserState: SetUseState<IUserTeamData | IUserModeratorData | undefined | false>,
  history: History,
  socket: MutableRefObject<Socket | undefined>
) {
  try {
    const response = await getLogin();
    setUserState(response.data);
    setCredentials(true);
    return response.data;
  } catch (err: any) {
    const error: AxiosError<IAppError> = err;
    switch (error.response?.data.code) {
      case -3:
        await logoff();
        socket.current?.disconnect();
        history.replace("/banido");
        break;
    }
    setUserState(false);
    setCredentials(false);
  }
}