import cloneDeep from "lodash.clonedeep";
import ITeam, { IAgreement } from "../../../../utils/types/chat/ITeam";
import UseState from "../../../../utils/types/UseState";

export default function subscribeAgreementReject (
  id: string,
  [teams, setTeams]: UseState<ITeam[]>
) {
  const i = teams.findIndex(e => e.id === id);
  if (i >= 0) {
    const newTeams = cloneDeep(teams);
    if (newTeams[i].agreement) {
      (newTeams[i].agreement as IAgreement).status = "rejected"
    }
    setTeams(newTeams);
  }
}