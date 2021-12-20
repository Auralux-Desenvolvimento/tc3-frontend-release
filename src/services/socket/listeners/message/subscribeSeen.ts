import ITeam from "../../../../utils/types/chat/ITeam";
import UseState from "../../../../utils/types/UseState";
import cloneDeep from "lodash.clonedeep";

export default function subscribeSeen (
  chatId: string,
  [ teams, setTeams ]: UseState<ITeam[]>
) {
  const i = teams.findIndex(e => e.chatId === chatId);
  if (i >= 0) {
    const newTeams = cloneDeep(teams);
    for (let message of newTeams[i].messages) {
      message.seen = true;
    }
    setTeams(newTeams);
  }
}