import { Socket } from "socket.io-client";
import { IAlert } from "../../utils/AlertContext";
import IMessageSubscribe from "../../utils/types/chat/IMessageSubscribe";
import ITeam from "../../utils/types/chat/ITeam";
import IInterest from "../../utils/types/interest/IInterest";
import IUserModeratorData from "../../utils/types/moderator/IUserModeratorData";
import IUserTeamData from "../../utils/types/team/IUserTeamData";
import UseState from "../../utils/types/UseState";
import subscribeAgreement from "./listeners/agreement/subscribeAgreement";
import subscribeAgreementAccept from "./listeners/agreement/subscribeAgreementAccept";
import subscribeAgreementCancel from "./listeners/agreement/subscribeAgreementCancel";
import subscribeAgreementCancelled from "./listeners/agreement/subscribeAgreementCancelled";
import subscribeAgreementPropose from "./listeners/agreement/subscribeAgreementPropose";
import subscribeAgreementReject from "./listeners/agreement/subscribeAgreementReject";
import subscribeAllInterest from "./listeners/interest/subscribeAllInterests";
import subscribeInterest from "./listeners/interest/subscribeInterest";
import subscribeMatch from "./listeners/interest/subscribeMatch";
import subscribeMessage from "./listeners/message/subscribeMessage";
import subscribeSeen from "./listeners/message/subscribeSeen";
import connect from "./listeners/user/connect";
import disconnect from "./listeners/user/disconnect";
import list from "./listeners/user/list";

export default async function socketRouter (
  [ teams, setTeams ]: UseState<ITeam[]>,
  [ interest, setInterest ]: UseState<IInterest[]>,
  [ alert, setAlert ]: UseState<IAlert|undefined>,
  user: false | IUserTeamData | IUserModeratorData | undefined,
  socket: Socket
) {
  socket.offAny()
  
  //debugging only
  socket.onAny((event, ...args) => {
    console.log(event, args);
  });

  socket.on("connect", () => {
    console.log("connected");
  })

  socket.off("user/list");
  socket.off("user/connect");
  socket.off("user/disconnect");
  socket.off("user/message");
  socket.off("user/agreement/propose");
  socket.off("user/agreement/accept");
  socket.off("user/agreement/cancel");
  socket.off("user/agreement/cancelled");
  socket.off("user/agreement");
  socket.off("user/agreement/reject");
  socket.off("user/interest");
  socket.off("user/interest/all");
  socket.off("user/match");
  socket.off("user/message/seen");
  
  socket.on("user/list", (currentTeams: ITeam[]) => list(currentTeams, setTeams));
  socket.on("user/connect", (id: string) => connect(id, [ teams, setTeams ]));
  socket.on("user/disconnect", (id: string) => disconnect(id, [ teams, setTeams ]));
  socket.on("user/message", (message: IMessageSubscribe) => subscribeMessage(message, [ teams, setTeams ]));
  socket.on("user/agreement/propose", (id: string) => subscribeAgreementPropose(id, [ teams, setTeams ]));
  socket.on("user/agreement/accept", (id: string) => subscribeAgreementAccept(id, [ teams, setTeams ], [ alert, setAlert ], user));
  socket.on("user/agreement/cancel", (id: string) => subscribeAgreementCancel(id, [ teams, setTeams ]));
  socket.on("user/agreement/cancelled", (id: string) => subscribeAgreementCancelled(id, [ teams, setTeams ]));
  socket.on("user/agreement", (id: string) => subscribeAgreement(id, [ teams, setTeams ]));
  socket.on("user/agreement/reject", (id: string) => subscribeAgreementReject(id, [ teams, setTeams ]));  
  socket.on("user/interest", (newInterest: IInterest) => subscribeInterest(newInterest, [ interest, setInterest ]));
  socket.on("user/interest/all", (allInterests: IInterest[]) => subscribeAllInterest(allInterests, setInterest));
  socket.on("user/match", (newMatch: ITeam) => subscribeMatch(newMatch, [ teams, setTeams ], [ interest, setInterest ]));
  socket.on("user/message/seen", (chatId: string) => subscribeSeen(chatId, [ teams, setTeams ]));
}