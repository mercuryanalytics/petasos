import React, { useState } from "react"

import Users from "./users"
import CustomAccountTabs from "./custom_account_tabs"

import "./index.scss"
import DomainInfo from "./domains/domain_info"
import ModifyDomain from "./domains/modify_domain"

const Accounts: React.FC = () => {
  const [showUserTabs, setShowUserTabs] = useState("users")
  const [showUserInfo, setShowUserInfo] = useState("user info")

  return (
    <div className="Accounts">
      <CustomAccountTabs tab1="Users" tab2="Domains" setShowUserTabs={setShowUserTabs} />
      {showUserTabs === "users" ? (
        <>
          <CustomAccountTabs
            className="UserInfoPermissions"
            tab1="User info"
            tab2="Access and Permissions"
            setShowUserInfo={setShowUserInfo}
          />
          <Users showUserInfo={showUserInfo} />
        </>
      ) : (
        <>
          <DomainInfo />
          <ModifyDomain />
        </>
      )}
    </div>
  )
}

export default Accounts
