import { MutableRefObject } from "react";
import getCourseSearch from "../../../services/course/getCourseSearch";
import { SetUseState } from "../../../utils/types/UseState";
import { ISuggestion } from "..";
import { ITag } from "../../Tag";

export default async function handleGetCourses (
  name: string,
  setSuggestions: SetUseState<ISuggestion<ITag>[]>,
  mounted?: MutableRefObject<boolean|undefined>,
  filter?: (e: any) => boolean
) {
  let response;
  try {
    response = await getCourseSearch(name);
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