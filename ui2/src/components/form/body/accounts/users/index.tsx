import React from "react"
import ModifyUser from "./modify_user"
import UserInfo from "./user_info"

import "./index.scss"

const Users: React.FC = () => (
  <div className="Users">
    <ModifyUser />
    <UserInfo />
  </div>
)

export default Users
