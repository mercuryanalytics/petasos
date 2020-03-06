import React from 'react';
import { reduxForm } from 'redux-form';

export { default as Input } from './Input';
export { default as Textarea } from './Textarea';

const Form = props => {
  const { handleSubmit, pristine, reset, submitting } = props;

  return (
    <form onSubmit={handleSubmit} className={props.className}>
      {props.children}
    </form>
  );
};

export default reduxForm({
  form: 'formsReducer',
})(Form);
