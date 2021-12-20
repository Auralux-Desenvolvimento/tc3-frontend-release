import { createContext } from "react";
import IUserModeratorData from "./types/moderator/IUserModeratorData";
import IUserTeamData from "./types/team/IUserTeamData";
import UseState from "./types/UseState";

export default createContext<UseState<IUserTeamData|IUserModeratorData|false|undefined>>([
  undefined,
  () => {}
]);