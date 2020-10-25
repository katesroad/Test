<template>
  <div>
    <span class="row justify-start items-center tx-ctn" v-if="iconAtFront">
      <tx-icon :tx="tx" />
      <tx-info :tx="tx" />
    </span>
    <!-- anyswap -->
    <span v-if="iconAtCenter" class="row justify-start items-center tx-ctn">
      <anyswap-tx :tx="tx" />
    </span>
    <!-- fsn native swap -->
    <swap-info :tx="tx" v-if="isFsnSwap" />
  </div>
</template>

<script>
import TxIcon from "@/components/tx-icon";
import TxInfo from "./tx-info";
import AnyswapTx from "./anyswap-tx";
import SwapInfo from "./swap-info";

export default {
  name: "transaction-info",
  props: {
    tx: {
      type: Object,
      default: () => ({ type: undefined, data: {} })
    }
  },
  computed: {
    iconAtFront() {
      return !this.iconAtCenter && !this.isFsnSwap;
    },
    iconAtCenter() {
      return [9, 10, 11].includes(this.tx.type);
    },
    isFsnSwap() {
      return !!this.tx.data.swap;
    }
  },
  components: {
    TxIcon,
    TxInfo,
    AnyswapTx,
    SwapInfo
  }
};
</script>
