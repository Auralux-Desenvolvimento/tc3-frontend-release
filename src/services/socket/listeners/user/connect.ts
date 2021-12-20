import cloneDeep from "lodash.clonedeep";
import ITeam from "../../../../utils/types/chat/ITeam";
import UseState from "../../../../utils/types/UseState";

export default function connect (
  id: string,
  [ teams, setTeams ]: UseState<ITeam[]>
) {
  const newTeams = cloneDeep(teams);
  const i = newTeams.findIndex(e => e.id === id);
  if (i >= 0) {
    newTeams[i].connected = true;
    setTeams(newTeams);
  }
}