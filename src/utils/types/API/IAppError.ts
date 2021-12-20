export default interface IAppError<T = any> {
  message: string;
  details?: T;
  code: number;
}