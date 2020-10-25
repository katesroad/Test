<style lang="scss" scoped>
b {
  margin: 0 4px;
}
a {
  margin: 0 4px;
}
</style>
<template>
  <div class="anyswap-trade" v-if="tx">
    <div class="fsn-pair" v-if="isFsnPair">
      <key-value prop="Action">
        <span class="row justify-center items-center">
          <b>From</b>
          <fusion-hash prefix="address" :hash="tx.sender" />
          <b>Transfer</b> {{ tx.data.from.value }}
          <router-link :to="`/token/${tx.data.from.token}`">{{
            tx.data.from.symbol
          }}</router-link>
          <b>To</b>
          <fusion-hash
            prefix="address"
            :hash="tx.exchangeReceipts[0].exchange"
          />
        </span>
      </key-value>
      <key-value prop="Action">
        <span class="row justify-center items-center">
          <b>From</b>
          <fusion-hash prefix="address" :hash="tx.receiver" />
          <b>Transfer</b> {{ tx.data.to.value }}
          <router-link :to="`/token/${tx.data.to.token}`">{{
            tx.data.to.symbol
          }}</router-link>
          <b>To</b>
          <fusion-hash prefix="address" :hash="tx.sender" />
        </span>
      </key-value>
    </div>
  </div>
</template>

<script>
import KeyValue from "@/components/key-value";
import FusionHash from "@/components/fusion-hash";

export default {
  name: "anyswap-trade",
  props: {
    tx: {
      type: Object,
      required: true
    }
  },
  computed: {
    isFsnPair() {
      return this.tx.exchangeReceipts.length === 1;
    }
  },
  components: {
    KeyValue,
    FusionHash
  }
};
</script>
