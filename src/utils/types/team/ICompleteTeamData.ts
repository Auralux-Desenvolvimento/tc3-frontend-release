import IAdvisorDataWithId from "../advisor/IAdvisorDataWithId";
import IMemberDataWithId from "../member/IMemberDataWithId";
import ITeamDataWithId from "./ITeamDataWithId";

export default interface ICompleteTeamData extends ITeamDataWithId {
  members: IMemberDataWithId[];
  advisors: IAdvisorDataWithId[];
}