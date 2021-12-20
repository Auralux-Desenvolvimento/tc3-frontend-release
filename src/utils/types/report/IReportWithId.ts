import IReport from "./IReport";

export default interface IReportWithId extends IReport {
  id: string;
}