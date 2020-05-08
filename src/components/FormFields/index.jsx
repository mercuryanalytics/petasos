export { default as Input } from './Input';
export { default as Textarea } from './Textarea';
export { default as Checkbox } from './Checkbox';
export { default as Select } from './Select';
export { default as Datepicker } from './Datepicker';

export const Validators = {
  hasValue: (value) => {
    return value !== null && typeof value !== 'undefined' && !!String(value).length;
  },
  isEmail: (value) => {
    return !!/^\w+([+.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value);
  },
};

export default null;
