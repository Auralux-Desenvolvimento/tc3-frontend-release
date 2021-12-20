import ICompleteTeamData from "./ICompleteTeamData";

export default interface IUserTeamData extends ICompleteTeamData {
  isVerified: boolean;
  hasPreferences: boolean;
  isInAgreement: boolean;
}