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
  data () {
    return { bks: [] }
  },
  computed: {
    txs() {
      return this.$store.state.l6txs;
    },
    latestBlock() {
      return this.$store.state.latestBlock;
    },
  },
  watch: {
    latestBlock() {
      let newBks = [...this.bks];
      const firstBlock = newBks[0] || this.latestBlock;
      const latestBlock = this.latestBlock;
      if (firstBlock.height !== latestBlock.height) {
        newBks = [latestBlock].concat(newBks).slice(0, 6);
      } else {
        newBks[0] = this.latestBlock;
      }
      this.bks = [...newBks];
    },
    bks () {
      this.saveL6Bks();
    }
  },
  components: {
    Blocks,
    Txs
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      if (this.bks.length * this.txs.length !== 0) return;
      this.$axios.get("/network/latest").then(data => {
        const { txs, bks =[]} = data;
        this.$store.dispatch({
          type: "setnetwork:l6txs",
          txs
        });
        if(bks.length) {
          this.bks = bks;
          this.saveL6Bks();
        } else {
          const bks = this.getL6Bks();
          this.bks = bks;
        }
      });
    },
    saveL6Bks() {
      localStorage.setItem('l6bks', JSON.stringify(this.bks));
    },
    getL6Bks() {
      return JSON.parse(localStorage.getItem('l6bks')) || [];
    }
  }
};
</script>
