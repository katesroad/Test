import axios from "axios";

axios.defaults.baseURL = "https://fsn365.katecc.com";
axios.defaults.headers.post["Content-Type"] = "application/json";

axios.interceptors.request.use(config => {
  const { url, method, params, data } = config;
  let msg = `${method}ing ${url}`;
  if (params) {
    msg += ` params:` + JSON.stringify(params);
  }
  if (data) {
    msg += "data:" + JSON.stringify(data);
  }
  console.log(msg);
  return config;
});

axios.interceptors.response.use(
  response => {
    const url = response.config.url;
    console.log(`got ${url}, cost:`, response.data.cost + "ms\n\n");
    return response.data.data || {};
  },
  error => {
    console.log(error);
    return Promise.reject(error);
  }
);

export default async ({ app, router, Vue }) => {
  Vue.prototype.$axios = axios;
};
