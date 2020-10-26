<style lang="scss">
@import "./style.scss";
</style>

<template>
  <div class="row justify-between">
    <txs :txs="txs" class="col-12 col-md-6" />
    <blocks :blocks="bks" class="col-md-6 col-12" />
  </div>
</template>

<script>
import Blocks from "../blocks";
import Txs from "../txs";

export default {
  name: "home-latest",
  computed: {
    txs() {
      return this.$store.state.l6txs;
    },
    bks() {
      return this.$store.state.l6bks;
    },
  },
  components: {
    Blocks,
    Txs
  },
  created() {
    this.loadData();
  },
  methods: {
    async loadData() {
      if (this.bks.length * this.txs.length !== 0) return;
      let {txs = [], bks = []} = await this.$axios.get("/network/latest");
      if(txs.length===0) { 
        txs = this.$utils.getL6Txs()
      }
      if(bks.length===0) { 
        bks = this.$utils.getL6Bks()
      }
      this.$store.dispatch({
        type: "setnetwork:l6txs",
        txs
      });
      this.$store.dispatch({
        type: "setnetwork:l6bks",
        bks
      });
    },
  }
};
</script>
