<style lang="scss" scoped>
img {
  width: 16px;
  margin: 0 4px;
}
span {
  font-size: 12px;
}
b {
  color: #353535;
}
</style>
<template>
  <span class="row items-center justify-center">
    <b>
      {{ actionType }}
    </b>
    <img src="svg/swap.svg" />
    <fusion-hash :hash="swap" prefix="swap" />
  </span>
</template>

<script>
import FusionHash from "../../components/fusion-hash";

export default {
  name: "swap-link",
  props: {
    tx: {
      type: Object,
      required: true
    }
  },
  computed: {
    swap() {
      return this.tx.data.swap;
    },
    actionType() {
      if ([9, 11].includes(this.tx.type)) return "Take";
      if (this.type === 6) return "Recall";
      return "Make";
    }
  },
  components: {
    FusionHash
  }
};
</script>
