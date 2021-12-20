import { RawDraftContentState } from "draft-js";
import IListItemTeam from "./IListItemTeam";


export default interface ITeamData extends IListItemTeam {
  themeDescription?: string;
  portfolio?: RawDraftContentState;
}