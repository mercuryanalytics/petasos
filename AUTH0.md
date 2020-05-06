# Email template
```
{% if user.user_metadata.invited_by %}
<!DOCTYPE html>
<html>

<head>
    <style type="text/css">
        /* ======================================= DESKTOP STYLES */
        
        * {
            -webkit-text-size-adjust: none;
        }
        
        body {
            margin: 0 !important;
            padding: 0 !important;
            background-color: #f1f2f5 !important;
            font-family: Helvetica, Arial, sans-serif;
        }
        
        body,
        table,
        td,
        p,
        a {
            -ms-text-size-adjust: 100% !important;
            -webkit-text-size-adjust: 100% !important;
        }
        
        table,
        tr,
        td {
            border-spacing: 0 !important;
            mso-table-lspace: 0px !important;
            mso-table-rspace: 0pt !important;
            border-collapse: collapse !important;
            mso-line-height-rule: exactly !important;
        }
        
        .ExternalClass * {
            line-height: 100%
        }
        
        .mobile-link a,
        .mobile-link span {
            text-decoration: none !important;
            color: inherit !important;
            border: none !important;
        }
        /* ======================================= CUSTOM DESKTOP STYLES */
        
        .w100 {
            width: 100%;
        }
        
        .w20 {
            width: 25%;
        }
        
        .pad-all-20 {
            padding: 20px !important;
        }
    </style>
</head>

<body>
    <!-- WRAPPER-->
    <table class="w100" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" bgcolor="#f1f2f5" style="width: 100%; background-color: #f1f2f5;">
        <tbody>
            <tr>
                <td class="pad-all-20">
                    <!--CONTAINER-->
                    <table class="w100" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="width: 600px; min-width: 600px; margin: 0 auto;">
                        <tbody>
                            <tr>
                                <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:5px;padding-right:5px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:4px;padding-right:4px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px;">
                                    <div class="w100" style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <!-- CONTENT -->
                                    <table class="w100" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" bgcolor="#ffffff" style="width: 20%; background-color: #ffffff; margin: 0 auto; text-align: center">
                                        <tbody>
                                            <tr>
                                                <td>&nbsp;</td>
                                            </tr>
                                            <tr>
                                                <td><img src="{{ user.user_metadata.logo_url }}" style="width: 150px;" /></td>
                                            </tr>

                                            <tr>
                                                <td>
                                                    <h1 style="margin-bottom: 0;">You've been invited to join</h1>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <h1 style="margin-top: 0;">{{ user.user_metadata.invited_to }}</h1>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <p><strong>{{ user.user_metadata.invited_by }}</strong> invited you to join his team on Mercury Analytics</p>
                                                    <p>Tap the button below to access your application.</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <table class="w20" cellspacing="0" cellpadding="0" border="0" align="center" width="600" style="width: 600px; min-width: 600px; margin: 0 auto;">
                                                        <tbody>

                                                            <tr>
                                                                <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;">
                                                                    <div class="w20" style="width: 25%;display:block;height:1px;background-color:#0d7997;line-height:1px;font-size:1px;">&nbsp;</div>
                                                                </td>
                                                            </tr>

                                                            <tr>
                                                                <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px;">
                                                                    <div class="w20" style="width: 25%;display:block;height:1px;background-color:#0d7997;line-height:1px;font-size:1px;">&nbsp;</div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;">
                                                                    <div class="w20" style="width: 25.1%;display:block;height:1px;background-color:#0d7997;line-height:1px;font-size:1px;">&nbsp;</div>
                                                                </td>
                                                            </tr>
                                                            <tr>
                                                                <td style="background: #fff;">
                                                                    <table class="w20" cellspacing="0" cellpadding="0" border="0" align="center" width="25%" bgcolor="#ffffff" style="width: 25%; background-color: #0d7997; margin: 0 auto; text-align: center">
                                                                        <tbody>
                                                                            <tr>
                                                                                <td>
                                                                                    <a href="https://mercury-analytics-frontend.herokuapp.com" style="padding: 8px 12px !important;background: #0d7997 !important;font-size: 14px !important;color: #ffffff !important;text-decoration: none !important;text-decoration: none;display: block !important;">Login with domain</a>
                                                                                </td>
                                                                            </tr>
                                                                        </tbody>
                                                                    </table>
                                                                </td>
                                                            </tr>
                                                        </tbody>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px;background: #fff;">
                                    <div class="w20" style="width: 25.1%;display:block;height:1px;background-color:#0d7997;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px; background: #fff;">
                                    <div class="w20" style="width: 25%;display:block;height:1px;background-color:#0d7997;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>

                            <tr>
                                <td align="center" style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px;background: #fff;">
                                    <div class="w20" style="width: 25%;display:block;height:1px;background-color:#0d7997;line-height:1px;font-size:1px;">&nbsp;</div>
                                </td>
                            </tr>
                            <tr style="background: #fff;">
                                <td>&nbsp;</td>
                            </tr>
                            <tr style="background: #fff;">
                                <td align="center" style="background: #fff;">
                                    <table cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto; font-size: 12px;">
                                        <td style="width: 30px; padding-right: 10px;">
                                            <hr>
                                        </td>
                                        <td>or</td>
                                        <td style="width: 30px; padding-left: 10px;">
                                            <hr>
                                        </td>
                                    </table>
                                </td>
                            </tr>
                            <tr style="background: #fff;">
                                <td>&nbsp;</td>
                            </tr>
                            <tr>
                                <td align="center" style="background: #fff;" ">
                                    <a href="{{ url }} " style="font-size: 14px !important;color: #0d7997 !important;text-decoration: none !important;text-decoration: none; ">Set your password</a>
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="background: #fff; " ">
                                    &nbsp;
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="background: #fff; " ">
                                    &nbsp;
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="background: #fff; font-size: 12px; ">
                                    Responses to this email are not monitored. Please do not reply
                                </td>
                            </tr>
                            <tr style="background-color: #fff; ">
                                <td>
                                    &nbsp;
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="padding-left:1px;padding-right:1px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="padding-left:2px;padding-right:2px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="padding-left:3px;padding-right:3px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="padding-left:4px;padding-right:4px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>
                            <tr>
                                <td align="center " style="padding-left:5px;padding-right:5px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>


                            <tr>
                                <td align="center " style="padding-left:7px;padding-right:7px;height:1px;line-height:1px;font-size:1px; ">
                                    <div class="w100 " style="display:block;height:1px;background-color:#ffffff;line-height:1px;font-size:1px; ">&nbsp;</div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
            <tr>
                <td>&nbsp;</td>
            </tr>
        </tbody>
    </table>
    </td>
    </tr>
    </tbody>
    </table>
</body>

</html>
{% else %}

<html>
  <head>
    <style type="text/css">
      .ExternalClass,.ExternalClass div,.ExternalClass font,.ExternalClass p,.ExternalClass span,.ExternalClass td,img {line-height: 100%;}#outlook a {padding: 0;}.ExternalClass,.ReadMsgBody {width: 100%;}a,blockquote,body,li,p,table,td {-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;}table,td {mso-table-lspace: 0;mso-table-rspace: 0;}img {-ms-interpolation-mode: bicubic;border: 0;height: auto;outline: 0;text-decoration: none;}table {border-collapse: collapse !important;}#bodyCell,#bodyTable,body {height: 100% !important;margin: 0;padding: 0;font-family: ProximaNova, sans-serif;}#bodyCell {padding: 20px;}#bodyTable {width: 600px;}@font-face {font-family: ProximaNova;src: url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.eot);src: url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.eot?#iefix)format("embedded-opentype"),url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-regular-webfont-webfont.woff) format("woff");font-weight: 400;font-style: normal;}@font-face {font-family: ProximaNova;src: url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-semibold-webfont-webfont.eot);src: url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-semibold-webfont-webfont.eot?#iefix)format("embedded-opentype"),url(https://cdn.auth0.com/fonts/proxima-nova/proximanova-semibold-webfont-webfont.woff) format("woff");font-weight: 600;font-style: normal;}@media only screen and (max-width: 480px) {#bodyTable,body {width: 100% !important;}a,blockquote,body,li,p,table,td {-webkit-text-size-adjust: none !important;}body {min-width: 100% !important;}#bodyTable {max-width: 600px !important;}#signIn {max-width: 280px !important;}}
    </style>
  </head>
  <body>
    <center>
      <table
        style='width: 600px;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 0;font-family: "ProximaNova", sans-serif;border-collapse: collapse !important;height: 100% !important;'
        align="center"
        border="0"
        cellpadding="0"
        cellspacing="0"
        height="100%"
        width="100%"
        id="bodyTable"
      >
        <tr>
          <td
            align="center"
            valign="top"
            id="bodyCell"
            style='-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;mso-table-lspace: 0pt;mso-table-rspace: 0pt;margin: 0;padding: 20px;font-family: "ProximaNova", sans-serif;height: 100% !important;'
          >
            <div class="main">
              <p
                style="text-align: center;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%; margin-bottom: 30px;"
              >
                <img
                  src="https://cdn.auth0.com/styleguide/2.0.9/lib/logos/img/badge.png"
                  width="50"
                  alt="Your logo goes here"
                  style="-ms-interpolation-mode: bicubic;border: 0;height: auto;line-height: 100%;outline: none;text-decoration: none;"
                />
              </p>

              <h1>Password Change Request</h1>

              <p>You have submitted a password change request.</p>

              <p>
                If it wasn't you please disregard this email and make sure you can still login to your account. If it
                was you, then <strong>confirm the password change <a href="{{ url }}">click here</a></strong
                >.
              </p>

              <br />
              Thanks!
              <br />

              <strong>{{ application.name }}</strong>

              <br /><br />
              <hr style="border: 2px solid #EAEEF3; border-bottom: 0; margin: 20px 0;" />
              <p style="text-align: center;color: #A9B3BC;-webkit-text-size-adjust: 100%;-ms-text-size-adjust: 100%;">
                If you did not make this request, please contact us by replying to this mail.
              </p>
            </div>
          </td>
        </tr>
      </table>
    </center>
  </body>
</html>
{% endif %}
```
