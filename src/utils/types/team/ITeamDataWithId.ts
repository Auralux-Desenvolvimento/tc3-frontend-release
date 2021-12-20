import ITeamData from "./ITeamData";

export default interface ITeamDataWithId extends ITeamData {
  id: string;
}