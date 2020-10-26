<template>
  <div class="tx" v-if="tx.type">
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <tx-detail :tx="tx" />
    <contract-detail v-if="isErc20Tx" :tx="tx" />
    <swap-detail v-if="isFsnSwap" :hash="tx.data.swap" />
  </div>
</template>

<script>
import TxDetail from "./components/tx-detail";
import ContractDetail from "./components/contract-detail";
import SwapDetail from "./components/swap-detail";

export default {
  name: "tx",
  data() {
    return {
      tx: {},
      loading: false,
    };
  },
  computed: {
    hash() {
      return this.$route.params.hash;
    },
    isErc20Tx() {
      const { data = {} } = this.tx;
      if (this.tx.type === -2 || this.tx.type === "BuyTicketFunc") return false;
      if (data.from || data.token.length === 42) return true;
      else return false;
    },
    isFsnSwap() {
      return [4, 5, 6].includes(this.tx.type);
    },
    contractDetail() {
      const { data = {} } = this.tx;
      return data;
    },
  },
  watch: {
    hash() {
      this.loadData();
    },
  },
  components: {
    TxDetail,
    ContractDetail,
    SwapDetail,
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      this.loading = true;
      await this.$axios
        .get(`/tx/${this.hash}`)
        .then((tx) => {
          const { data = {}, ...others } = tx;
          this.tx = { ...others, data };
        })
        .catch((e) => ({}));
      this.loading = false;
    },
  },
};
</script>
