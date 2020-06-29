# Report Access Manager - How To

#### Adding a new Generic Account (Generic User):
A Generic Account is a User which is not associated with any of the Clients (even though he might be attributed Access and Permissions over some Client's data), meaning he/she will not show up in any of the Clients' Acounts list.
One can only create such generic Accounts from the **Super Admin** interface (https://www.researchresultswebsite.com/super-user) using the **+ Add User** actionlink to trigger an invite for the new User. If the User is not already in the system an invite email will be sent to the User.
This will create a Generic Account which is not associated with any of the Clients - at least until he is manually added in one of Client's Accounts List or his Domain is added in one of the Client's Domain lists (and the user logs is again). 
Use this kind of accounts for admins and other Administration Users.

#### Adding a new Client Account (Client User):
A Client Account is a user which is associated with a Client, meaning he/she will show up in that Client's Accounts List;
There are two ways to add an Account to a Client:
1. Invite the User using the **+ Add User** actionlink from the Client's User management screen (Select Client in main screen -> Accounts Tab -> Users sub-tab);
If the User is not already in the system (as a Generic User or an Account associated with other client(s), he/she will also receive an invitation email);
2. Add the User's domain using the **+ Add Domain** actionlink from the Client's Domain managemen screen (Select Client in main screen -> Accounts Tab -> Domains sub-tab). When adding a new domain under a Client, the users of that domain will not receive any kind of invitation, instead they will have to login in the app using their Google / Microsoft login.
Be aware, by adding a domain to a client, all users form that specific domain will be able to login in the application and inherit the Client's default access rigths (the User Template);

#### Updating an Account's Access and Permissions:
There are several ways to update an Account's Access and Permissions (automatic/manual):
- When the Account is created as a Generic Account that account will have no default access or permissions. The only functions such an account can perform is password update - this is until the account is being granted specific access and permissions;
- When createing a Client Account (regardless whether it's a new account to the system or an existing account), the account will inherit Client's **User Template** (if it is enabled for the Client) which is a collection of View, Edit and Admin rights on the Client's data;
- When a Client Admin wants to update an Account's (belonging to that client) access and permissions they can do so from the Client's Access and Permissions view (Select Client in main screen -> Accounts Tab -> Users sub-tab -> select User -> Access and Permissions subtab);
- When a SuperAdmin wants to update any Account's access and permissions they can do so from the SuperAdmin's Access and Permissions view (Select Super Admin view from the main screen's header -> search and select User -> Access and Permissions tab).
In addition to updating Access and Permission for any Account on any Client's data, Super Admins can also add Super Admin rights and Grant Dynamic Permissions (Global / Data specific Permissions used by other apps) to the Account;
