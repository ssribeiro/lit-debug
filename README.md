# Debug Calling Lit Action

The purpose of this repo is to share an implementation error and ask for Lit Protocol support guidance.

This code was created to follow the Lit Protocol documentation strictly.

# What are we trying to do?

Everything is suppose to run on the NodeJS side, for a while:

> Deploy a Lit Action

> Mint&Grant&Burn a PKP to a lit action.

> Buy Capacity Credits

> Delegate to a Lit Action

> Call a Lit Action using the delegation.

# STEPS

We need two wallets to do this.

First you gonna need a wallet with LIT tokens, the LIT_MINTER_PRIVATE_KEY.
And a second wallet, on the side calling the lit action, the LIT_ACTION_CALLER_PRIVATE_KEY.

Fullfill the .env file with the values.

```
// If you have nvm installed
nvm i
nvm use

npm i

getlit setup
// and follow instructions

// altogether
npm run all

// or step by step
getlit build
npm run deploy-lit-action
npm run buy-capacity-credits
npm run delegate-to-action
npm run call-simple-lit-action
```

# Current Error

# We kindly ask the Lit Support team to provide feedback on fixing this error.
