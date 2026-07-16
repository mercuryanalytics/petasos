import React from "react"
import { render } from "@testing-library/react"
import { Provider } from "react-redux"
import { createStore, combineReducers, applyMiddleware } from "redux"
import thunk from "redux-thunk"
import { MemoryRouter } from "react-router-dom"

import authReducer from "../store/auth/reducers"
import locationReducer from "../store/location/reducers"
import usersReducer from "../store/users/reducers"
import clientsReducer from "../store/clients/reducers"
import projectsReducer from "../store/projects/reducers"
import reportsReducer from "../store/reports/reducers"

const rootReducer = combineReducers({
  authReducer,
  locationReducer,
  usersReducer,
  clientsReducer,
  projectsReducer,
  reportsReducer
})

// Build a fresh store per render so tests never share mutable state. Pass
// preloadedState to seed reducer slices, or a ready-made store to inspect it.
export function makeStore(preloadedState) {
  return createStore(rootReducer, preloadedState, applyMiddleware(thunk))
}

// Render a component inside the providers real app code expects: redux store and
// a router. Returns the store alongside Testing Library's queries.
export function renderWithProviders(ui, { route = "/", preloadedState, store = makeStore(preloadedState) } = {}) {
  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>{children}</MemoryRouter>
    </Provider>
  )
  return { store, ...render(ui, { wrapper: Wrapper }) }
}

// react-final-form-hooks field shape the FormFields components consume.
export function makeField({ input = {}, meta = {} } = {}) {
  return {
    input: {
      name: "field",
      value: "",
      onChange: () => undefined,
      onBlur: () => undefined,
      onFocus: () => undefined,
      ...input
    },
    meta: { dirty: false, submitFailed: false, error: undefined, ...meta }
  }
}
