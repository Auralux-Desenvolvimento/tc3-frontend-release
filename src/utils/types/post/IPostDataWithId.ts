import IPostData from "./IPostData";

export default interface IPostDataWithId extends IPostData {
  id: string;
  createdAt: Date;
}