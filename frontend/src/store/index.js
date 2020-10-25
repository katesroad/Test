import Vue from "vue";
import Vuex from "vuex";
import VueSocketIO from "vue-socket.io";
import { utils } from "../boot/utils";
import { TRANSACTION_TYPES } from "./tx-types";
import * as ROW_OPTIONS_FOR_PAGE from "./row-options";
import { ADDRESS_NAMES } from "./address-names";

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    network: {},
    addressNames: ADDRESS_NAMES,
    verifiedTokens: {},
    TRANSACTION_TYPES,
    latestBlock: {},
    l6txs: [],
    mcap: { price: 0.46 },
    txCount: { all: 3137778, anyswap: 0 },
    txProgress: 0,
    l6bks: [],
    ROW_OPTIONS_FOR_PAGE
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
    latestBlock(state, payload) {
      state.latestBlock = payload;
    },
    l6txs(state, payload) {
      let txs;
      if (payload.length) txs = payload;
      else txs = payload.txs || [];
      const newTxs = [...txs, ...state.l6txs];
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
      const { bks } = payload;
      state.l6bks = bks;
    }
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
    ["setnetwork:block"]({ commit }, payload) {
      commit("latestBlock", payload);
    },
    ["setnetwork:l6txs"]({ commit }, payload) {
      commit("l6txs", payload);
      utils.setL6Txs(payload);
    },
    ["settx:count"]({ commit }, payload) {
      commit("txCount", payload);
    },
    ["setmcap"]({ commit }, payload) {
      commit("mcap", payload);
      utils.setMcap(payload);
    },
    setl6bks({ commit }, payload) {
      const { bks = [] } = payload;
      if (bks.length) {
        utils.setL6Bks(bks);
      } else {
        utils.setL6Bks(payload);
      }
      commit("l6bks", payload);
    },
    setAddressNames({ commit }, { names = {} }) {
      commit("addressNames", names);
    },
    setVerifiedTokens({ commit }, { tokens = {} }) {
      commit("verifiedTokens", tokens);
    }
  }
});

Vue.use(
  new VueSocketIO({
    debug: false,
    connection: "https://fsn365.katecc.com",
    vuex: {
      store,
      actionPrefix: "set",
      mutationPrefix: "set"
    }
  })
);

// https://quasar.dev/quasar-cli/vuex-store#Adding-a-Vuex-Module.
export default function() {
  return store;
}
