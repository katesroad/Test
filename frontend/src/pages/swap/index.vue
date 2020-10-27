<template>
  <q-card class="fusion-swap row items-center" style="padding: 16px">
    <h6 class="row items-center col-12" style="margin:0">
      Swap Detail
    </h6>
    <json-pretty :data="data" />
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
  components: {
    JsonPretty: () => import('@/components/json-pretty')
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
