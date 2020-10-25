// import something here

function getLocalStorage(key) {
  const value = localStorage.getItem(key);
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function storeToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export const utils = {
  setNetwork(network) {
    storeToLocalStorage("network", network);
  },
  getNetwork() {
    return getLocalStorage("network");
  },
  setL6Txs(txs) {
    storeToLocalStorage("l6txs", txs);
  },
  getL6Txs() {
    return getLocalStorage("l6txs");
  },
  setMcap(mcap) {
    storeToLocalStorage("mcap", mcap);
  },
  getMcap() {
    return getLocalStorage("mcap");
  },
  setL6Bks(bks) {
    storeToLocalStorage('l6bks', bks);
  },
  getL6Bks() {
    return getLocalStorage("l6bks");
  },
  calcQty(value) {
    const oneM = 1000000;
    const oneK = 1000;
    if (value >= oneM) {
      return (value / oneM).toFixed(1) + " M";
    } else if (value > oneK) {
      return (value / oneK).toFixed(1) + " k";
    }
    return value.toFixed(1);
  },
  isFSNToken(hash) {
    return hash === '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
  }
};

export default async ({ Vue }) => {
  Vue.prototype.$utils = utils;
};
