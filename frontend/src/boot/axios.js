import axios from "axios";

const isDEV = process.env.DEV;
const FSN365_CONFIG = {
  prod: "https://api.fsn365.com",
  local: "https://api.fsn365.com",
};
const fsn365 = axios.create({
  baseURL: isDEV ? FSN365_CONFIG.local : FSN365_CONFIG.prod,
  timeout: 3000,
});
const RPC_CONFIG = {
  mainnet: "https://fsn.dev/api",
  testnet: "https://testnet.fsn.dev/api",
};



fsn365.interceptors.request.use((config) => {
  const { url, method, params } = config;
  let msg = `${method} ${url}`;
  if (params) {
    msg += `data: ${JSON.stringify(params)}`;
  }
  console.log(msg);
  return config;
});
fsn365.interceptors.response.use(
  (res) => {
    const resData = res.data;
    const url = res.config.url;
    console.log(`Got ${url}, cost:${resData.cost} ms. \n`);
    return resData.data || {};
  },
  (err) => Promise.reject(err)
);

const rpc = axios.create({
  baseURL: RPC_CONFIG.mainnet,
  timeout: 3000,
  headers: { "Content-Type": "application/json" },
});

const getAddressTlBalances = (address) => {
  return rpc.post('/', {
    jsonrpc: '2.0',
    id: 1,
    method: 'fsn_getAllTimeLockBalances',
    params: [address, 'latest']
  }).then(res => res.data)
  .then(data => data.result)
  .catch((e) => {
    console.log(e);
    return {};
  });
};

export default async ({ app, router, Vue }) => {
  Vue.prototype.$axios = fsn365;
  Vue.prototype.rpcGetAddressTlBalance = getAddressTlBalances;
};
