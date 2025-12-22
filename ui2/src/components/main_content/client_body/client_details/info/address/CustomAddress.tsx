import React from "react"
import { Checkbox, Input, Label } from "react-aria-components"
import { CustomCheckbox } from "../../../../../icons"
import TextField from "../../../../../common/text_field/CustomTextField"

type Props = { alternateAddress?: boolean; addressType: "Mailing" | "Billing" }

const CustomAddress: React.FC<Props> = ({ alternateAddress = false, addressType }) => {
  return (
    <div className="CustomAddress">
      <h1>{`${addressType} address`}</h1>
      <div>
        {alternateAddress && (
          <Checkbox>
            <CustomCheckbox />
            <Label>Same as the mailing address</Label>
          </Checkbox>
        )}
        <TextField label="Address Line 1 *" name="address line 1" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="Address Line 2" name="address line 2" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="City *" name="city" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="State *" name="state" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="Zip code *" name="zip code" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="Country" name="country" value="N/A">
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
      </div>
    </div>
  )
}

export default CustomAddress
