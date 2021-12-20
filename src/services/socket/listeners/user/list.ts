import ITeam from "../../../../utils/types/chat/ITeam";
import { SetUseState } from "../../../../utils/types/UseState";

export default function list (
  currentTeams: ITeam[],
  setTeams: SetUseState<ITeam[]>
) {
  currentTeams.map(e => {
    e.messages.map(f => {
      f.createdAt = new Date(f.createdAt);
      return f;
    });
    e.lastSeen = new Date(e.lastSeen);
    return e;
  });
  setTeams(currentTeams);
}