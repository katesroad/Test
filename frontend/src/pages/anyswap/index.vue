<style lang="scss" scoped>
.page-tit {
  font-size: 20px;
  margin: 0 auto 20px auto;
  font-size: 20px;
}
.q-tab-panel {
  padding: 0;
}
</style>

<template>
  <div>
    <h6 class="page-tit">
      Anyswap Tracker
    </h6>
    <q-card class="bg-white" style="text-align:center; padding:3rem;">
      <h2>This module is under construction</h2>
    </q-card>
    <q-card v-if="false">
      <q-tabs v-model="tab" class="text-primary primary bg-white" align="left">
        <q-tab name="trade" label="Trade" no-ripple />
        <q-tab name="pairs" label="Pairs" no-ripple />
        <q-tab name="tokens" label="Tokens" no-ripple />
      </q-tabs>
      <q-separator />
      <q-tab-panels v-model="tab">
        <q-tab-panel name="trade"> <anyswap-trade name="trade"/></q-tab-panel>
        <q-tab-panel name="pairs">
          <pair-supported name="pairs" />
        </q-tab-panel>
        <q-tab-panel name="tokens">
          <token-supported name="tokens" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
  </div>
</template>

<script>
import AnyswapTrade from "./components/anyswap-trade";

export default {
  name: "anyswap",
  data() {
    return {
      tab: "trade"
    };
  },
  components: {
    AnyswapTrade,
    TokenSupported: () => import("./components/anyswap-tokens"),
    PairSupported: () => import("./components/anyswap-pairs")
  }
};
</script>
