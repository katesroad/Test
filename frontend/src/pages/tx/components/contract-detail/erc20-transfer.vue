<style lang="scss" scoped>
.erc20-transfer {
  font-size: 13px;
  p {
    border-bottom: 1px solid #eee;
    padding: 0.5rem 0;
    margin-top: 0;
  }
  b {
    margin-right: 4px;
    margin-left: 4px;
    color: #4f4f4f;
    &:first-child {
      min-width: 120px;
      margin-right: 8px;
      margin-left: 0;
      &:after {
        content: ":";
      }
    }
  }
  a {
    margin-left: 4px;
    margin-right: 4px;
    word-break: break-all;
  }
}
</style>
<template>
  <div class="erc20-transfer" v-if="tx">
    <p>
      <b>From</b>
      <router-link :to="`/address/${tx.sender}`">{{ tx.sender }}</router-link>
    </p>
    <p>
      <b> Interacted With(To)</b> Contract
      <router-link :to="`/token/${tx.data.token}`">{{
        tx.data.token
      }}</router-link>
      ({{ tx.data.symbol }})
    </p>
    <p class="row justify-start items-center">
      <b> Tokens Transfered </b><b>From</b>
      <fusion-hash prefix="address" :hash="tx.sender" /> <b>To</b>
      <fusion-hash prefix="address" :hash="tx.receiver" /> <b>For</b>
      {{ tx.data.value }}
      <router-link :to="`/token/${tx.data.token}`">{{
        tx.data.symbol
      }}</router-link>
    </p>
  </div>
</template>

<script>
import FusionHash from "@/components/fusion-hash";

export default {
  name: "erc20-transfer",
  props: {
    tx: {
      type: Object,
      required: true
    }
  },
  components: {
    FusionHash
  }
};
</script>
