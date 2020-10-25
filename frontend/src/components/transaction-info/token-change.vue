<template>
  <span class="token-change">
    {{ value }}
    <strong>
      <router-link :to="tokenUrl">{{ data.symbol }}</router-link>
    </strong>
  </span>
</template>

<script>
export default {
  name: "token-change",
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    tokenUrl() {
      return `/token/${this.data.token}`;
    },
    value() {
      return this.$utils.calcQty(this.data.value);
    }
  }
};
</script>
