<template>
  <div class="block-detail">
    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" />
    </q-inner-loading>
    <blocks-info :block="block" />
    <blocks-txs
      :block="number"
      :txs="block.txs"
      title="Transactions"
      v-if="block.txs"
    />
  </div>
</template>

<script>
import BlocksInfo from "./components/blocks-info";

export default {
  name: "block",
  data() {
    return {
      block: {},
      loading: false
    };
  },
  computed: {
    number() {
      return this.$route.params.number;
    }
  },
  watch: {
    number() {
      this.loadData();
    }
  },
  components: {
    BlocksInfo,
    BlocksTxs: () => import("@/components/transaction-list/blocks-txs.vue")
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loading = true;
      this.$axios.get(`/block/${this.number}`).then(data => {
        this.block = data;
        this.loading = false;
      });
    }
  }
};
</script>
