import IInterest from "../../../../utils/types/interest/IInterest";
import { SetUseState } from "../../../../utils/types/UseState";

export default function subscribeAllInterest (allInterests: IInterest[], setInterest: SetUseState<IInterest[]>) {
  setInterest(allInterests);
}