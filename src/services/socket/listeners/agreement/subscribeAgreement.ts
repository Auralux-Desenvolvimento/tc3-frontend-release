import cloneDeep from "lodash.clonedeep";
import ITeam from "../../../../utils/types/chat/ITeam";
import UseState from "../../../../utils/types/UseState";

export default function subscribeAgreement (
  id: string,
  [teams, setTeams]: UseState<ITeam[]>
) {
  const i = teams.findIndex(e => e.id === id);
  if (i >= 0) {
    const newTeams = cloneDeep(teams);
    newTeams[i].status = "inAgreement";
    setTeams(newTeams);
  }
}