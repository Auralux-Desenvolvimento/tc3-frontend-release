import cloneDeep from "lodash.clonedeep";
import ITeam from "../../../../utils/types/chat/ITeam";
import UseState from "../../../../utils/types/UseState";

export default function disconnect (
  id: string,
  [ teams, setTeams ]: UseState<ITeam[]>
) {
  const newTeams = cloneDeep(teams);
  for (let i in newTeams) {
    if (newTeams[i].id === id) {
      newTeams[i].connected = false;
      newTeams[i].lastSeen = new Date();
      break;
    }
  }
  setTeams(newTeams);
}