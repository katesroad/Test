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
    mcap: { price: 0.46 },
    txCount: { all: 3137778, anyswap: 0 },
    txProgress: 0,
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
      let {type, txs = []} = payload;
      if(!type) txs = payload; 
      commit("l6txs", txs);
      utils.setL6Txs(txs);
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
