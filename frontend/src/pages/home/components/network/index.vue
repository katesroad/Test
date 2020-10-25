<template>
  <div class="row">
    {{ network }}
    <token-price class="col-12 col-sm-6 col-md-3 token-price" />
    <token-mcap class="col-12 col-sm-6 col-md-3 token-mcap" />
    <network-state class="col-12 col-sm-6 col-md-3 network-state" :network="network" />
    <txs-stats class="col-12 col-sm-6 col-md-3 txs-stats" />
  </div>
</template>

<script>
import TxsStats from "./txs-stats";
import TokenMcap from "./token-mcap";
import TokenPrice from "./token-price";
import NetworkState from "./network-state";

export default {
  name: "network",
  computed: {
    network() {
      return this.$store.state.network;
    }
  },
  components: {
    TxsStats,
    TokenMcap,
    TokenPrice,
    NetworkState
  }
};
</script>
