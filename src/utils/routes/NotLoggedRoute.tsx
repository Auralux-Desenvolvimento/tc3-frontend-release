import { useContext } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import isModerator from '../functions/isModerator';
import UserDataContext from '../UserDataContext';

function NotLoggedRoute (rest: RouteProps) {
  const user = useContext(UserDataContext)[0];

  if (user && user.isVerified) {
    if (isModerator(user)) {
      return (
        <Redirect 
          to={{
            pathname: "/denuncias",
          }} 
        />
      );
    } else {
      return (
        <Redirect 
          to={{
            pathname: "/equipes",
          }} 
        />
      );
    }
  } else {
    return <Route { ...rest } />
  }
}
export default NotLoggedRoute;