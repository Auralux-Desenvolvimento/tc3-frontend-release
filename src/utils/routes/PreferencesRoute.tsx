import { useContext } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage';
import isModerator from '../functions/isModerator';
import IUserTeamData from '../types/team/IUserTeamData';
import UserDataContext from '../UserDataContext';

function PreferencesRoute (rest: RouteProps) {
  const user = useContext(UserDataContext)[0];

  if (typeof user === "undefined") {
    return <LoadingPage/>;
  } else if (!!user) {
    if (!isModerator(user)) {
      if (!(user as IUserTeamData).hasPreferences) {
        return <Route { ...rest } />
      } else {    
        return (
          <Redirect 
            to={{
              pathname: "/login",
            }} 
          />
        );
      }
    } else {    
      return (
        <Redirect 
          to={{
            pathname: "/denuncias",
          }} 
        />
      );
    }
  } else {
    return (
      <Redirect 
        to={{
          pathname: "/",
        }} 
      />
    );
  }
}
export default PreferencesRoute;