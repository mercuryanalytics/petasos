const initialState = {
  user: null,
  authKey: null,
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER': {
      return {
        ...state,
        user: action.payload,
      };
    }
    case 'SET_AUTH_KEY': {
      return {
        ...state,
        authKey: action.payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default authReducer;
