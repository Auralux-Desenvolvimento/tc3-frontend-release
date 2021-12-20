import cloneDeep from "lodash.clonedeep";
import { IAlert } from "../../../../utils/AlertContext";
import ITeam from "../../../../utils/types/chat/ITeam";
import IUserModeratorData from "../../../../utils/types/moderator/IUserModeratorData";
import IUserTeamData from "../../../../utils/types/team/IUserTeamData";
import UseState from "../../../../utils/types/UseState";

export default function subscribeAgreementAccept (
  id: string,
  [ teams, setTeams ]: UseState<ITeam[]>,
  [ _, setAlert ]: UseState<IAlert|undefined>,
  user: false | IUserTeamData | IUserModeratorData | undefined
) {
  const newTeams = cloneDeep(teams);
  newTeams.map(e => {
    if (e.id === id) {
      if (e.agreement) {
        e.agreement.status = "active";
        if (user) {
          setAlert({
            title: "Você está em um acordo!",
            message: "Parabéns! Você acaba de iniciar um acordo com uma equipe. Para acessar o email dos orientadores da equipe parceira vá até o perfil dela."
          });
          localStorage.setItem("isInNewAgreement", user.id);
        }
      }
    } else {
      e.status = "inAgreement";
    }
    return e;
  });
  setTeams(newTeams);
}