import { MutableRefObject } from "react";
import { ISuggestion } from "..";
import getKeyword from "../../../services/keyword/getKeyword";
import { SetUseState } from "../../../utils/types/UseState";
import { ITag } from "../../Tag";

export default async function handleGetKeywords (
  name: string,
  setSuggestions: SetUseState<ISuggestion<ITag>[]>,
  mounted?: MutableRefObject<boolean|undefined>,
  filter?: (e: any) => boolean
) {
  let response;
  try {
    response = await getKeyword(name);
  } catch {
    return setSuggestions([]);
  }

  let data = response.data.map<ISuggestion<ITag>>(e => ({
    content: e.name,
    value: {
      label: e.name,
      id: e.id
    }
  }));

  if (filter) {
    data = data.filter(filter);
  }

  if (mounted) {
    mounted.current && setSuggestions(data);
  } else {
    setSuggestions(data);
  }
}