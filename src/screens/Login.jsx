import React from 'react';
import { useHistory } from 'react-router-dom';
import Routes from '../utils/routes';
import { getLogo, isLoggedIn, login } from '../App';
import { Redirect } from 'react-router-dom';
import Loader from '../components/Loader';

const Login = () => {
  const history = useHistory();
  const from = history.location.hash.substr(1);

  if (!isLoggedIn()) {
    getLogo().then((logo) => {
      login({
        from: from,
        logo: logo,
      });
    }, () => {});
  } else {
    return <Redirect to={from || Routes.Home} />;
  }

  return <Loader />;
};

export default Login;
