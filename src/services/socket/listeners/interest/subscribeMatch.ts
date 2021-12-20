import cloneDeep from "lodash.clonedeep";
import ITeam from "../../../../utils/types/chat/ITeam";
import IInterest from "../../../../utils/types/interest/IInterest";
import UseState from "../../../../utils/types/UseState";

export default function subscribeMatch (
  newMatch: ITeam,
  [ teams, setTeams ]: UseState<ITeam[]>, 
  [ interest, setInterest ]: UseState<IInterest[]>
) {
  let newInterest = cloneDeep(interest);
  newInterest = newInterest.filter(e => e.id !== newMatch.id);
  setInterest(newInterest);

  const newTeams = cloneDeep(teams);
  newTeams.push(newMatch);
  setTeams(newTeams);
}