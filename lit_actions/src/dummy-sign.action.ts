/**
 * NAME: dummy
 */

const go = async () => {
  const response = "sum: " + (1 + 1);

  await LitActions.ethPersonalSignMessageEcdsa({
    message: response,
    publicKey,
    sigName: "dummySign",
  });

  await LitActions.setResponse({ response: JSON.stringify({ sum: response }) });
};

go();
