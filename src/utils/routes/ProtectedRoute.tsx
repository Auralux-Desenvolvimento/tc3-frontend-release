import { useContext } from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import LoadingPage from '../../pages/LoadingPage';
import UserDataContext from '../UserDataContext';

function ProtectedRoute (rest: RouteProps) {
  const user = useContext(UserDataContext)[0];

  if (user && user.isVerified) {
    return <Route { ...rest } />
  } else if (typeof user === "undefined") {
    return <LoadingPage/>;
  } else {    
    return (
      <Redirect 
        to={{
          pathname: "/login",
        }} 
      />
    );
  }
}
export default ProtectedRoute;