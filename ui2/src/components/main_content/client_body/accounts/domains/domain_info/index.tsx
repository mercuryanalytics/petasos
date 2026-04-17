import React from "react"

import "./index.scss"

const DomainInfo: React.FC = () => {
  return (
    <div className="DomainInfo">
      <p>
        By adding a new domain you allow all users from that domain to authenticate as a test user and inherit the
        default user permissions.
      </p>
      <p>Edit and admin permissions can be granted to these users only after they have logged in for the first time.</p>
      <p>
        Adding a domain does NOT automatically distribute an invite to all users in the domain. The login URL will have
        to be manually shared with all new domain users who need to access the application.
      </p>
    </div>
  )
}

export default DomainInfo
