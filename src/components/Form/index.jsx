import React, { useEffect } from 'react';
import { reduxForm } from 'redux-form';

export { default as Input } from './Input';
export { default as Textarea } from './Textarea';

const Form = props => {
  const { pristine, reset, submitting, initialize } = props;

  useEffect(() => {
    if (props.formValues && initialize) {
      initialize(props.formValues);
    }
  }, [props.values, initialize]);

  useEffect(() => {
    if (props.onInit) {
      props.onInit({ reset });
    }
  }, []);

  useEffect(() => {
    if (props.onStatusChange) {
      props.onStatusChange({ pristine, submitting })
    }
  }, [pristine, submitting]); 

  return (
    <form onSubmit={props.onSubmit} className={props.className}>
      {props.children}
    </form>
  );
};

export default reduxForm({
  form: 'default',
})(Form);
