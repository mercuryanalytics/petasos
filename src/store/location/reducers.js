const initialState = {
  data: {
    create: false,
    account: null,
    client: null,
    project: null,
    report: null,
  },
};

const locationReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOCATION_DATA': {
      return {
        ...state,
        data: { ...initialState.data, ...action.payload },
      };
    }
    default: {
      return state;
    }
  }
};

export default locationReducer;
