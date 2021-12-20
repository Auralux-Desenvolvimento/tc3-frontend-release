import cloneDeep from "lodash.clonedeep";
import IMessageSubscribe from "../../../../utils/types/chat/IMessageSubscribe";
import ITeam from "../../../../utils/types/chat/ITeam";
import UseState from "../../../../utils/types/UseState";

export default function subscribeMessage (
  message: IMessageSubscribe,
  [ teams, setTeams ]: UseState<ITeam[]>
) {
  const i = teams.findIndex(e => e.id === message.from);
  if (i >= 0) {
    const newTeams = cloneDeep(teams);
    message.createdAt = new Date(message.createdAt);
    newTeams[i].messages.push(message);
    setTeams(newTeams);
  }
}