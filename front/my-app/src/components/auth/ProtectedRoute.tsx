import React from "react";
import { AuthService } from "../../services/AuthService"
import Login from "./Login";


interface Props {
  component: React.FC;
}

const ProtectedRoute: React.FC<Props> = ({ component }) => {
  const [isAuthenticated, setLoggedIn] = React.useState(true);
  const authService = new AuthService();

  React.useEffect(() => {
    (async () => {
      try {
        if (authService.isLoggedIn()) {
          setLoggedIn(true);
        } else {
          setLoggedIn(false);
        }
      } catch (e) {
        setLoggedIn(false);
      }
    })();
  });

  return (
    isAuthenticated ? (
      React.createElement(component)
    ) : (
      <Login />
    )
  );
};

export default ProtectedRoute;