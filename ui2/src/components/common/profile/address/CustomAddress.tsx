import React from "react"
import { Checkbox, Label } from "react-aria-components"

import { CustomCheckbox } from "../../../icons"

import TextField from "../../text_field/CustomTextField"

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
        <TextField label="Address Line 1 *" name="address line 1" />
        <TextField label="Address Line 2" name="address line 2" />
        <TextField label="City *" name="city" />
        <TextField label="State *" name="state" />
        <TextField label="Zip code *" name="zip code" />
        <TextField label="Country" name="country" />
      </div>
    </div>
  )
}

export default CustomAddress
