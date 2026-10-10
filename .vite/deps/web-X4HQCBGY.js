import {
  WebPlugin
} from "./chunk-276NRVVW.js";
import "./chunk-BUSYA2B4.js";

// node_modules/@capgo/native-purchases/dist/esm/web.js
var NativePurchasesWeb = class extends WebPlugin {
  async restorePurchases() {
    console.error("restorePurchases only mocked in web");
  }
  async getProducts(options) {
    console.error("getProducts only mocked in web " + options);
    return { products: [] };
  }
  async getProduct(options) {
    console.error("getProduct only mocked in web " + options);
    return { product: {} };
  }
  async purchaseProduct(options) {
    console.error("purchaseProduct only mocked in web" + options);
    return { transactionId: "transactionId" };
  }
  async isBillingSupported() {
    console.error("isBillingSupported only mocked in web");
    return { isBillingSupported: false };
  }
  async getPluginVersion() {
    console.warn("Cannot get plugin version in web");
    return { version: "default" };
  }
  async getPurchases(options) {
    console.error("getPurchases only mocked in web " + options);
    return { purchases: [] };
  }
  async manageSubscriptions() {
    console.error("manageSubscriptions only mocked in web");
  }
  async acknowledgePurchase(_options) {
    console.error("acknowledgePurchase only mocked in web");
  }
  async consumePurchase(_options) {
    throw new Error("consumePurchase is only available on Android");
  }
  async getStorefront() {
    console.error("getStorefront only mocked in web");
    return { countryCode: "" };
  }
  async getAppTransaction() {
    console.error("getAppTransaction only mocked in web");
    return {
      appTransaction: {
        originalAppVersion: "1.0.0",
        originalPurchaseDate: (/* @__PURE__ */ new Date()).toISOString(),
        bundleId: "com.example.app",
        appVersion: "1.0.0",
        environment: null
      }
    };
  }
  async isEntitledToOldBusinessModel(_options) {
    console.error("isEntitledToOldBusinessModel only mocked in web");
    return {
      isOlderVersion: false,
      originalAppVersion: "1.0.0"
    };
  }
};
export {
  NativePurchasesWeb
};
//# sourceMappingURL=web-X4HQCBGY.js.map
