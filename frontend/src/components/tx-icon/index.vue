<style scoped>
img {
  margin-right: 4px;
  max-width: 24px;
}
</style>

<template>
  <img :alt="typeText" :src="typeIcon" />
</template>

<script>
export default {
  name: "tx-type",
  props: {
    tx: {
      type: Object,
      default: () => ({ type: undefined, data: {} })
    }
  },
  computed: {
    typeText() {
      const { type } = this.tx;
      return this.$store.state.TRANSACTION_TYPES[this.tx.type];
    },
    typeIcon() {
      const { type, data = {} } = this.tx;
      let svg = "";
      switch (type) {
        case -2:
          svg = "ticket.svg";
          break;
        case 0:
          svg = "usan.svg";
          break;
        case 1:
          svg = "issue.svg";
          break;
        case 2:
          svg = "transfer.svg";
          break;
        case 3:
          svg = "tl.svg";
          break;
        case 4: {
          if (data.isInc) {
            svg = "issue.svg";
          } else {
            svg = "destory.svg";
          }
          break;
        }
        case 19:
          svg = "transfer.svg";
          break;
        case 15:
        case 16:
        case 20:
          svg = "swap.svg";
          break;
        default:
          svg = "";
      }
      const src = `svg/${svg}`;
      return src;
    }
  }
};
</script>
