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
