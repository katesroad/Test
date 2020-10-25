<template>
  <div style="min-width: 148px; margin: 0 auto">
    <div class="row items-center" v-if="isTrading">
      <transfer-info :transfer="pair.from" />
      <img src="svg/swap.svg" alt="swap" style="width: 16px; margin: 0 4px" />
      <transfer-info :transfer="pair.to" />
    </div>
    <div class="row items-center" v-if="isLiquidityTx">
      <span style="margin-right: 4px;">
        {{ pairText }}
      </span>
      <router-link :to="{ path: `/token/${pair.from.token}` }">
        {{ pair.from.symbol }}
      </router-link>
      <img
        src="svg/swap.svg"
        alt="anyswap"
        style="width: 16px; margin: 0 4px"
      />
      <router-link :to="{ path: `/token/${pair.to.token}` }">
        {{ pair.to.symbol }}
      </router-link>
    </div>
  </div>
</template>

<script>
import TransferInfo from "./transfer-info";

export default {
  name: "exchange-liquidity",
  props: {
    tx: {
      type: Object,
      required: true
    }
  },
  computed: {
    isLiquidityTx() {
      return [10, 11].includes(this.tx.type);
    },
    isTrading() {
      return !this.isLiquidityTx;
    },
    pair() {
      return this.tx.data;
    },
    pairText() {
      if (this.tx.type === 10) return "Add Pair ";
      if (this.tx.type === 11) return "Remove Pair ";
      return "";
    }
  },
  components: {
    TransferInfo
  }
};
</script>
