/**
 *
 * NAME: dummy
 *
 */

"use strict";
(() => {
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __commonJS = (cb, mod) => function __require() {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  };
  var __async = (__this, __arguments, generator) => {
    return new Promise((resolve, reject) => {
      var fulfilled = (value) => {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      };
      var rejected = (value) => {
        try {
          step(generator.throw(value));
        } catch (e) {
          reject(e);
        }
      };
      var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
      step((generator = generator.apply(__this, __arguments)).next());
    });
  };

  // lit_actions/src/dummy-sign.action.ts
  var require_dummy_sign_action = __commonJS({
    "lit_actions/src/dummy-sign.action.ts"(exports) {
      var go = () => __async(exports, null, function* () {
        const response = "sum: " + (1 + 1);
        yield LitActions.ethPersonalSignMessageEcdsa({
          message: response,
          publicKey,
          sigName: "dummySign"
        });
        yield LitActions.setResponse({ response: JSON.stringify({ sum: response }) });
      });
      go();
    }
  });
  require_dummy_sign_action();
})();
