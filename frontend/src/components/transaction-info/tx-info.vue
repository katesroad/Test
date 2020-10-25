<style lang="scss" scoped>
.tx-info {
  text-align: left;
}
</style>

<template>
  <span class="tx-info">
    <transfer-info v-if="isTransfer" :transfer="data" />
    <timelock-transfer :data="data" v-if="isTimeLock" />
    <gen-usan :usan="data.usan" v-if="isGenUsan" />
    <token-change :data="data" v-if="isTokenUpdate" />
    <contract-creating v-if="isContractCreating" :data="tx.data" />
  </span>
</template>

<script>
import TransferInfo from "./transfer-info";
import TimelockTransfer from "./timelock-transfer";
import GenUsan from "./gen-usan";
import TokenChange from "./token-change";
import ContractCreating from "./contract-creating";

export default {
  name: "tx-info",
  props: {
    tx: {
      type: Object,
      default: () => ({ data: {} })
    }
  },
  computed: {
    data() {
      return this.tx.data;
    },
    isTransfer() {
      return [2, 19].includes(this.tx.type);
    },
    isSwap() {
      return !!this.tx.data.swap;
    },
    isTimeLock() {
      return this.tx.type === 3;
    },
    isGenUsan() {
      return !!this.tx.data.usan;
    },
    isContractApproval() {
      return this.tx.type === 17;
    },
    isTokenUpdate() {
      return this.tx.type === 4 || this.tx.type === 1;
    },
    isContractCreating() {
      return this.tx.type === 20;
    },
    isLiqudityChange() {
      return [15, 16].includes(this.tx.type);
    }
  },
  components: {
    TransferInfo,
    TimelockTransfer,
    GenUsan,
    TokenChange,
    ContractCreating
  }
};
</script>
