<style lang="scss" scoped>
.log-btn {
  cursor: pointer;
  text-transform: lowercase;
  text-align: left;
  font-weight: bold;
  color: #4f4f4f;
}
</style>
<template>
  <q-card class="tx__contract-detail" style="padding: 0 16px 32px">
    <q-card-section style="padding-left: 0">
      <div class="text-h6 row justify-start items-center">
        Contract Detail
      </div>
    </q-card-section>
    <anyswap-trading v-if="isAnyswapTrade" :tx="tx" />
    <erc20-transfer :tx="tx" v-if="isErc20Transfer" />
    <contract-logs :logs="tx.log" v-if="showLogs" />
    <span
      class="log-btn item-label button"
      @click="showLogs = !showLogs"
      v-if="!showLogs"
      >View logs >
    </span>
  </q-card>
</template>

<script>
import Erc20Transfer from "./erc20-transfer";
import AnyswapTrading from "./anyswap-trade";
import ContractLogs from "./contract-logs";
import KeyValue from "@/components/key-value";

export default {
  name: "contract-detail",
  props: {
    tx: {
      type: Object,
      required: false
    }
  },
  data() {
    return { showLogs: false };
  },
  computed: {
    isErc20Transfer() {
      return this.tx.type === 2 && this.tx.data.token.length === 42;
    },
    isAnyswapTrade() {
      const { data = {} } = this.tx;
      return data.from && !!data.to;
    },
    data() {
      return this.tx.data;
    },
    anyswapData() {
      const { data, erc20Receipts, exchangeReceipts } = this.tx;
      return { data, erc20Receipts, exchangeReceipts };
    }
  },
  components: {
    Erc20Transfer,
    AnyswapTrading,
    ContractLogs
  }
};
</script>
