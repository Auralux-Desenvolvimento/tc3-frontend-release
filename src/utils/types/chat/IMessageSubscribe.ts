export default interface IMessageSubscribe {
  from: string;
  content: string;
  createdAt: Date;
  seen: boolean;
}