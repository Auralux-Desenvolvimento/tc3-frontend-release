import cloneDeep from "lodash.clonedeep";
import IInterest from "../../../../utils/types/interest/IInterest";
import UseState from "../../../../utils/types/UseState";

export default function subscribeInterest (subscribeInterest: IInterest, [ interest, setInterest ]: UseState<IInterest[]>) {
  const newInterest = cloneDeep(interest);
  newInterest.push(subscribeInterest);
  setInterest(newInterest);
}