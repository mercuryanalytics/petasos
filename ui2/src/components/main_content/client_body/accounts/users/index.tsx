import React from "react"
import ModifyUser from "./modify_user"
import UserInfo from "./user_info"
import AccessPermissions from "./access_permissions"

import "./index.scss"

const Users: React.FC<{ showUserInfo: string }> = ({ showUserInfo }) => (
  <div className="Users">
    <ModifyUser />
    {showUserInfo === "user info" ? <UserInfo /> : <AccessPermissions />}
  </div>
)

export default Users
