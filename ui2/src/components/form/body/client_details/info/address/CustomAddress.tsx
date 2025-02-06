import React from "react"
import { Checkbox, Input, Label, TextField } from "react-aria-components"
import { CustomCheckbox } from "../../../../../icons"

import "./custom_address.scss"

type Props = { alternateAddress?: boolean; addressType?: "Mailing" | "Billing" }

const CustomAddress: React.FC<Props> = ({ alternateAddress = false, addressType = "Mailing" }) => {
  return (
    <div className="CustomAddress">
      <h1>{`${addressType} address`}</h1>
      <div>
        {alternateAddress && (
          <Checkbox>
            <CustomCheckbox />
            Same as the mailing address
          </Checkbox>
        )}
        <TextField name="address line 1">
          <Label>Address Line 1 *</Label>
          <Input />
        </TextField>
        <TextField name="address line 2">
          <Label>Address Line 2</Label>
          <Input />
        </TextField>
        <TextField name="city">
          <Label>City *</Label>
          <Input />
        </TextField>
        <TextField name="state">
          <Label>State *</Label>
          <Input />
        </TextField>
        <TextField name="zip code">
          <Label>Zip code *</Label>
          <Input />
        </TextField>
        <TextField name="country">
          <Label>Country</Label>
          <Input />
        </TextField>
      </div>
    </div>
  )
}

export default CustomAddress
