import { LitAbility, LitActionResource } from "@lit-protocol/auth-helpers";
import { LitNodeClient } from "@lit-protocol/lit-node-client";
import { AuthSig, SessionSigsMap } from "@lit-protocol/types";

export const getSessionSigsLitAction = async (
  getLitClient: () => Promise<LitNodeClient>,
  getAuthSig: () => Promise<AuthSig>,
  getPkpPublicKey: () => string,
  getExpirationMs: () => number = () => 60 * 60 * 1000
): Promise<SessionSigsMap> => {
  const litNodeClient = await getLitClient();
  const authSig = await getAuthSig();

  // Set resources to allow for signing of any message.
  const resourceAbilities = [
    {
      resource: new LitActionResource("*"),
      ability: LitAbility.PKPSigning,
    },
  ];
  // Get the session key for the session signing request
  // will be accessed from local storage or created just in time.
  const sessionKeyPair = litNodeClient.getSessionKey();

  // Request a session with the callback to sign
  // with an EOA wallet from the custom auth needed callback created above.
  const sessionSigs = await litNodeClient.getSessionSigs({
    chain: "ethereum",
    expiration: new Date(Date.now() + getExpirationMs()).toISOString(),
    resourceAbilityRequests: resourceAbilities,
    // Form the authNeededCallback to create a session with
    // the wallet signature.
    authNeededCallback: async (params) => {
      const response = await litNodeClient.signSessionKey({
        statement: params.statement,
        authMethods: [
          {
            authMethodType: 1,
            // use the authSig created above to authenticate
            // allowing the pkp to sign on behalf.
            accessToken: JSON.stringify(authSig),
          },
        ],
        pkpPublicKey: getPkpPublicKey(),
        expiration: params.expiration,
        resources: params.resources,
        chainId: 1,
      });
      return response.authSig;
    },
  });

  return sessionSigs;
};
