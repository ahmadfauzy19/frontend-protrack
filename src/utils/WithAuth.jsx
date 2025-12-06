// src/utils/withAuth.js
import React from "react";
import { AuthContext } from "../contexts/AuthProvider";

const withAuth = (Component) => {
  return function Wrapper(props) {
    return (
      <AuthContext.Consumer>
        {(authContext) => <Component {...props} auth={authContext} />}
      </AuthContext.Consumer>
    );
  };
};

export default withAuth;
