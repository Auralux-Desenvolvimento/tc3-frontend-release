import { AxiosResponse } from "axios";
import IUserModeratorData from "../types/moderator/IUserModeratorData";
import IUserTeamData from "../types/team/IUserTeamData";

export default function isModerator (user: IUserModeratorData|IUserTeamData|AxiosResponse|false|undefined) {
  return !!user && !!(user as IUserModeratorData).isModerator;
}