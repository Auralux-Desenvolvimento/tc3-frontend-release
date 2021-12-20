import { createContext } from "react";
import ITeam from "./types/chat/ITeam";
import UseState from "./types/UseState";

export default createContext<UseState<ITeam[]>>([
  [],
  () => {}
]);