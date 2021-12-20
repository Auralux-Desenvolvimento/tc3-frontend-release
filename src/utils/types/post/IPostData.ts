import { RawDraftContentState } from "draft-js";

export default interface IPost {
  title: string;
  content: RawDraftContentState;
  author: string;
}