import { createContext } from 'react';

const AuthContext = createContext({
  name: 'User',
  setName: () => {},
  isLoggedin: false,
  setIsLoggedIn: () => {},
  userId : '',
  setUserId : () => {}
});

export default AuthContext;
