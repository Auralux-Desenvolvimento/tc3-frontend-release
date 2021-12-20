import IListItemTeamWithId from "./IListItemTeamWithId";

export default interface IFavouriteList extends IListItemTeamWithId {
  isFavourite?: boolean;
}