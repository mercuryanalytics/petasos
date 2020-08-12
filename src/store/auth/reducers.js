const initialState = {
  user: null,
  isSocialLogin: false,
  authKey: null,
  authUser: null,
  partner: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER': {
      return {
        ...state,
        user: action.payload,
      };
    }
    case 'SET_IS_SOCIAL_LOGIN': {
      return {
        ...state,
        isSocialLogin: action.payload,
      };
    }
    case 'SET_AUTH_KEY': {
      return {
        ...state,
        authKey: action.payload,
      };
    }
    case 'SET_AUTH_USER': {
      return {
        ...state,
        authUser: action.payload,
      };
    }
    case 'SET_PARTNER': {
      return {
        ...state,
        partner: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default authReducer;
