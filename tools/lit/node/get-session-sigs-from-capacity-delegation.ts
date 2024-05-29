import { SessionSigsMap, AuthSig } from "@lit-protocol/types";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { LitAbility, LitPKPResource } from "@lit-protocol/auth-helpers";

export const getSessionSigsFromCapacityDelegation = async (
  getLitClient: () => Promise<LitNodeClient>,
  getAuthSig: () => Promise<AuthSig>,
  getCapacityDelegationAuthSig: () => AuthSig,
  getActionPublicKey: () => string,
  getExpirationMs: () => number = () => 60 * 60 * 1000,
  getStatement: () => string = () => "Some custom statement."
): Promise<SessionSigsMap> => {
  const litNodeClient = await getLitClient();
  const pkpPublicKey = getActionPublicKey();

  const capacityDelegationAuthSig = await getCapacityDelegationAuthSig();

  const pkpSessionSigs = await litNodeClient.getSessionSigs({
    // pkpPublicKey, // public key of the wallet which is delegated
    expiration: new Date(Date.now() + getExpirationMs()).toISOString(), // 24 hours
    chain: "ethereum",
    resourceAbilityRequests: [
      {
        resource: new LitPKPResource("*"),
        ability: LitAbility.PKPSigning,
      },
    ],
    authNeededCallback: async ({
      expiration,
      resources,
      resourceAbilityRequests,
    }) => {
      console.log("expiration:");
      console.log(expiration);
      console.log("resources:");
      console.log(resources);
      console.log("resourceAbilityRequests:");
      console.log(resourceAbilityRequests);

      // -- validate
      if (!expiration) {
        throw new Error("expiration is required");
      }

      if (!resources) {
        throw new Error("resources is required");
      }

      if (!resourceAbilityRequests) {
        throw new Error("resourceAbilityRequests is required");
      }

      const response = await litNodeClient.signSessionKey({
        statement: getStatement(),
        authMethods: [
          {
            authMethodType: 1,
            // use the authSig created above to authenticate
            // allowing the pkp to sign on behalf.
            accessToken: JSON.stringify(await getAuthSig()),
          },
        ], // authMethods for signing the sessionSigs
        pkpPublicKey, // public key of the wallet which is delegated
        expiration: expiration,
        resources: resources,
        chainId: 1,

        // optional (this would use normal siwe lib, without it, it would use lit-siwe)
        resourceAbilityRequests: resourceAbilityRequests,
      });

      console.log("response:", response);

      return response.authSig;
    },
    capacityDelegationAuthSig, // here is where we add the delegation to our session request
  });

  console.log("generated session with delegation ", pkpSessionSigs);
  throw new Error("sfsg");

  return pkpSessionSigs;
};
