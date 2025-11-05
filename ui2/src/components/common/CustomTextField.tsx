import { Input, Label, TextField } from "react-aria-components"

const CustomTextField: React.FC<{ label: string; value: string; showInput?: boolean }> = ({
  label,
  value,
  showInput = false
}) => (
  <TextField>
    <Label>{label}</Label>
    {showInput ? <Input value={value} /> : <span>{value}</span>}
  </TextField>
)

export default CustomTextField
