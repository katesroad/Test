<template>
  <q-card class="fusion-swap row items-center">
    <h6 class="justify-center row items-center col-12">
      This page is under construction
    </h6>
    <div style="padding: 16px 32px;">
      {{ data }}
    </div>
  </q-card>
</template>

<script>
export default {
  name: "fusion-swap",
  data() {
    return {
      data: {}
    };
  },
  watch: {
    hash() {
      this.loadData(this.$route.params.hash);
    }
  },
  created() {
    this.loadData(this.$route.params.hash);
  },
  methods: {
    async loadData(hash) {
      const swap = await this.$axios.get(`/swap/${hash}`).catch(e => ({}));
      this.data = swap;
    }
  }
};
</script>
