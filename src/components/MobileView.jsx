import React from 'react';
import defaultLogo from "../static/images/logo.png";
import {useSelector} from "react-redux";

export function MobileView(props) {
  const partner = useSelector(state => state.authReducer.partner);
  const partnerClient = useSelector(state => !partner ? null :
    (state.clientsReducer.clients.filter(c => c.subdomain === partner)[0] || null));

  return (
    <>
      <img src={partnerClient?.logo_url || defaultLogo} alt='logo'/>
      <div style={{display: 'flex', 'alignItems': 'center', flexDirection: 'column', 'margin': '50px', 'justifyContent': 'center'}}>
        <h2>Our Workbench, Research Results Website and other Tools are optimized for access on Desktop, Laptop and
          Tablet.</h2>
        <br />
        <p>If you need assistance, please contact Mercury at 202-386-6322</p>
      </div>
    </>
  );
}
