<template>
  <q-card class="fsn-swap-detail" style="padding: 0 16px 32px 16px">
     <q-card-section style="padding-left: 0">
      <div class="text-h6 row justify-start items-center">
        Swap Detail
      </div>
    </q-card-section>
    <h6>This module is under construction.</h6>
    {{data}}
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
