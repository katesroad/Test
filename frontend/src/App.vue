<template>
  <div id="q-app">
    <router-view />
  </div>
</template>
<script>
export default {
  name: "App",
  created() {
    this.loadAddressNames();
    const l6Txs = this.$utils.getL6Txs();
    this.$store.dispatch({
      type: "setnetwork:l6txs",
      l6Txs
    });

    const lBks = this.$utils.getL6Bks();
    this.$store.dispatch({
      type: "setl6bks",
      bks: lBks
    });

    const network = this.$utils.getNetwork();
    if (network) {
      this.$store.dispatch({
        type: "setnetwork",
        network
      });
    }
  },
  methods: {
    async loadAddressNames() {
      const names = await this.$axios.get("/address/names").catch(e => ({}));
      this.$store.dispatch({
        type: "setAddressNames",
        names
      });
    }
  }
};
</script>
