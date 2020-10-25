<template>
  <span>{{ typeText }} </span>
</template>

<script>
export default {
  name: "anyswap-trade-type",
  props: {
    type: Number
  },
  computed: {
    typeText() {
      let typeText = "";
      switch (this.type) {
        case 9:
          typeText = "Token Swap";
          break;
        case 10:
          typeText = "Add Liquidity";
          break;
        case 11:
          typeText = "Remove Liquidity";
          break;
        default:
          break;
      }
      return typeText;
    }
  }
};
</script>
