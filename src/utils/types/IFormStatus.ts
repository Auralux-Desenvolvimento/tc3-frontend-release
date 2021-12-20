import { FormMessageState } from "../../components/FormMessage";

export default interface IFormStatus {
  state: keyof typeof FormMessageState;
  message: string;
  locale?: string;
}