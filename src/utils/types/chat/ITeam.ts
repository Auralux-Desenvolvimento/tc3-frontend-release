import IMessageSubscribe from "./IMessageSubscribe";

export default interface ITeam {
  id: string;
  name: string;
  connected: boolean;
  logo: string;
  status: keyof typeof Status;
  messages: IMessageSubscribe[];
  agreement?: IAgreement;
  chatId?: string;
  lastSeen: Date;
}

export interface IAgreement {
  agent: string;
  status: keyof typeof Agreement;
}

export enum Status {
  active = "active",
  banned = "banned",
  inAgreement = "inAgreement",
  inactive = "inactive",
}

export enum Agreement {
  pending = "pending",
  rejected = "rejected",
  cancelled = "cancelled",
  active = "active",
}