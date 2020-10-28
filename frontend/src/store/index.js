import Vue from "vue";
import VueSocketIO from "vue-socket.io";
import Vuex from "vuex";
import { utils } from "../boot/utils";
import { ADDRESS_NAMES } from "./address-names";
import * as ROW_OPTIONS_FOR_PAGE from "./row-options";
import { TRANSACTION_TYPES } from "./tx-types";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    network: {},
    addressNames: ADDRESS_NAMES,
    verifiedTokens: {},
    TRANSACTION_TYPES,
    latestBlock: {},
    l6txs: [],
    l6bks: [],
    mcap: { price: 0.46 },
    txCount: { all: 3137778, anyswap: 0 },
    txProgress: 0,
    ROW_OPTIONS_FOR_PAGE,
  },
  mutations: {
    network(state, payload) {
      state.network = payload;
    },
    addressNames(state, payload) {
      state.addressNames = { ...ADDRESS_NAMES, ...payload };
    },
    verifiedTokens(state, payload) {
      state.verifiedTokens = payload;
    },
    l6txs(state, payload) {
      const newTxs = [...payload, ...state.l6txs];
      state.l6txs = newTxs.slice(0, 6);
    },
    mcap(state, payload) {
      state.mcap = payload;
    },
    txCount(state, payload) {
      state.txCount = payload;
    },
    txProgress(state, payload) {
      state.txProgress = payload;
    },
    l6bks(state, payload) {
      state.l6bks = payload;
    },
  },
  actions: {
    ["setnetwork"]({ commit }, payload) {
      const { type, network } = payload;
      if (type) {
        commit("network", network);
        utils.setNetwork(network);
      } else {
        commit("network", payload);
        utils.setNetwork(payload);
      }
    },
    ["setnetwork:block"](context, payload) {
      const { state, dispatch} = context;
      let { l6bks = [] } = state;
      if(l6bks.length==0) {
        l6bks = utils.getL6Bks() || [];
      }
      const firstBk = l6bks[0] || payload;
      const newBks = [...l6bks];
      if(firstBk.height === payload.height) {
        newBks[0] = payload
      } else {
        newBks.unshift(payload);
      }
      dispatch({
        type: 'setnetwork:l6bks',
        bks: newBks.slice(0, 6)
      })
    },
    ["setnetwork:l6txs"]({ commit }, payload) {
      let { type, txs = [] } = payload;
      if (!type) txs = payload;
      commit("l6txs", txs);
      utils.setL6Txs(txs);
    },
    ["setnetwork:l6bks"]({ commit }, payload) {
      let { type, bks = [] } = payload;
      if (!type) bks = payload;
      commit("l6bks", bks);
      utils.setL6Bks(bks);
    },
    ["settx:count"]({ commit }, payload) {
      commit("txCount", payload);
    },
    ["setmcap"]({ commit }, payload) {
      commit("mcap", payload);
      utils.setMcap(payload);
    },
    setAddressNames({ commit }, { names = {} }) {
      commit("addressNames", names);
    },
    setVerifiedTokens({ commit }, { tokens = {} }) {
      commit("verifiedTokens", tokens);
    },
  },
});

Vue.use(
  new VueSocketIO({
    debug: false,
    connection: "https://api.fsn365.com",
    vuex: {
      store,
      actionPrefix: "set",
      mutationPrefix: "set",
    },
  })
);

// https://quasar.dev/quasar-cli/vuex-store#Adding-a-Vuex-Module.
export default function () {
  return store;
}
