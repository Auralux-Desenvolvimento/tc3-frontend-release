export enum ReportType {
  chat = "chat",
  team = "team"
}

export default interface IReport {
  reporter?: {
    id: string;
    name: string;
  };
  reported: {
    id: string;
    name: string;
    logoURL?: string | undefined;
  };
  type: keyof typeof ReportType;
  message: string;
  createdAt: Date;
}