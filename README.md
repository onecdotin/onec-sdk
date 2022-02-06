# Onec-SDK

### v0.1
The highlight of the release is `Onec.auth`. It saves all the hassle to incorporate web 3.0 based wallet authentication with just a few lines of code.
Not only that Onec SDK integrates the Onec User model into the application, thus you can save the hassle of maintaining user-DB. We can proudly say it as `web3 version of Google's Firebase Auth`.

## Getting Started:
Install Onec-SDK from npm

    npm i onec-sdk

Import in your client application code

     import Onec from "onec-sdk";

Authentication via metamask

    Onec.auth.withMetamask().then((response) => {console.log(response)}).catch((error) => {console.log(error)});

Authentication via WalletConnect

    Onec.auth.withWalletConnect().then((response) => {console.log(response)}).catch((error) => {console.log(error)});


## Demystifying Response Object

Authentication functions return a promise which resolves to a User object or rejects with an error. The User Object has attributes like public address, username, email, createdAt, updatedAt, etc.

** User should sign the login message within 60 seconds otherwise the process will expire.



## Next Release Features Announcement:

 - Improvements in `auth` object like mechanisms for interacting/updating the User object.
 - A new `naas` class which is a rest-client to connect the web apps with Onec's NaaS Suite.


