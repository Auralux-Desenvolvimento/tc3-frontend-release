import axios from 'axios';
import IReportWithId from '../../utils/types/report/IReportWithId';
import IListItemTeamWithId from '../../utils/types/team/IListItemTeamWithId';

export interface IGetReportByIdResponse extends IReportWithId {
  reporter?: IListItemTeamWithId;
  reported: IListItemTeamWithId;
  chatHistory?: {
    createdAt: Date;
    isActive: boolean;
    messages: {
      sender: string;
      content: string;
      createdAt: Date;
    }[];
  }
  moderatorId?: string;
  isResolved: boolean;
}

export default async function getReportById (id: string) {
  const preFilteredResponse = await axios.get<IGetReportByIdResponse>(
    `${process.env.REACT_APP_API_URL}/report/${id}`,
    { 
      withCredentials: true
    }
  );
  if (preFilteredResponse.data.chatHistory) {
    preFilteredResponse.data.chatHistory.createdAt = new Date(preFilteredResponse.data.chatHistory.createdAt);
    preFilteredResponse.data.chatHistory.messages = preFilteredResponse.data.chatHistory.messages.map(e => {
      e.createdAt = new Date(e.createdAt);
      return e;
    });
  }
  preFilteredResponse.data.createdAt = new Date(preFilteredResponse.data.createdAt);
  return preFilteredResponse;
}