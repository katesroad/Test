<template>
  <q-card class="fsn-swap-detail">
    <span class="card-tit">Swap Detail</span>
  </q-card>
</template>

<script>
export default {
  name: "fsn-swap-detail",
  props: {
    hash: {
      type: String,
      required: true
    }
  },
  data() {
    return { data: {} };
  },
  watch: {
    hash() {
      this.getSwapDetail();
    }
  },
  created() {
    this.getSwapDetail();
  },
  methods: {
    getSwapDetail() {
      const hash = this.hash;
      return this.$axios
        .get(`/swap/${hash}`)
        .then(data => {
          this.data = data;
        })
        .catch(e => {
          const msg = `Get information for swap:${hash} failed.`;
          this.showNotify(msg);
        });
    },
    showNotify(msg) {
      this.$q.notify({
        message: msg,
        position: "top",
        color: "warning"
      });
    }
  }
};
</script>
