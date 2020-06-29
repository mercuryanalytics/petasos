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
2. Add the User's domain using the **+ Add Domain** actionlink from the Client's Domain managemen screen (Select Client in main screen -> Accounts Tab -> Domains sub-tab);
Be aware, by adding a domain to a client, all users form that specific domain will be able to login in the application and inherit the Client's default access rigths (the User Template);

