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
  validateAuth0Password: (value) => {
    if (value.length < 8) {
      return 'Password must be at least 8 characters long.';
    } else {
      let matches = 0;
      /[a-z]/.test(value) && matches++;
      /[A-Z]/.test(value) && matches++;
      /[0-9]/.test(value) && matches++;
      /[ !"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/.test(value) && matches++;
      if (matches < 3) {
        return [
          'The password must contain at least 3 of the following 4 types of characters:',
          '- Lower case letters (a-z)',
          '- Upper case letters (A-Z)',
          '- Numbers (0-9)',
          '- Special characters (e.g. !@#$%^&*)',
        ];
      }
    }
    return null;
  },
};

export default null;
