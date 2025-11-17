import ConfigConventional from "@commitlint/config-conventional"
import { type UserConfig } from "@commitlint/types"

const [typeEnumSeverity, typeEnumRule, typeEnumValues] = ConfigConventional.rules["type-enum"]
const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [typeEnumSeverity, typeEnumRule, [...typeEnumValues, "debug", "wip"]]
  }
}

export default Configuration
