import React, { useState } from "react"
import { Checkbox, Input, Label } from "react-aria-components"

import { CustomCheckbox } from "../../../icons"

import TextField from "../../text_field/CustomTextField"

type Props = { alternateAddress?: boolean; addressType: "Mailing" | "Billing"; value?: string }

const CustomAddress: React.FC<Props> = ({ alternateAddress = false, addressType, value }) => {
  const [disabled, setDisabled] = useState(false)
  const [currentAddress, setCurrentAddress] = useState({
    address_line_1: "",
    address_line_2: "",
    city: "",
    state: "",
    zip_code: "",
    country: ""
  })

  return (
    <div className="CustomAddress">
      <h1>{`${addressType} address`}</h1>
      <div>
        {alternateAddress && (
          <Checkbox
            onChange={() => {
              setDisabled(current => !current)
            }}
          >
            <CustomCheckbox />
            <Label>Same as the mailing address</Label>
          </Checkbox>
        )}
        <TextField
          label="Address Line 1 *"
          name="address line 1"
          value={value ?? (!disabled ? currentAddress.address_line_1 : "")}
          isDisabled={disabled}
        >
          {(value, onChange) => (
            <Input
              type="text"
              value={value}
              {...(onChange && {
                onChange: event => {
                  onChange(event)
                  setCurrentAddress(currentAddress => ({ ...currentAddress, address_line_1: event.target.value }))
                }
              })}
            />
          )}
        </TextField>
        <TextField label="Address Line 2" name="address line 2" value="N/A" isDisabled={disabled}>
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="City *" name="city" value="N/A" isDisabled={disabled}>
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="State *" name="state" value="N/A" isDisabled={disabled}>
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="Zip code *" name="zip code" value="N/A" isDisabled={disabled}>
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
        <TextField label="Country" name="country" value="N/A" isDisabled={disabled}>
          {(value, onChange) => <Input type="text" value={value} onChange={onChange} />}
        </TextField>
      </div>
    </div>
  )
}

export default CustomAddress
