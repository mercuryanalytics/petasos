// react-final-form-hooks field shape the FormFields components consume.
export const makeField = ({ input = {}, meta = {} } = {}) => ({
  input: {
    name: "field",
    value: "",
    onChange: () => undefined,
    onBlur: () => undefined,
    onFocus: () => undefined,
    ...input
  },
  meta: { dirty: false, submitFailed: false, error: undefined, ...meta }
})
