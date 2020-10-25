<template>
  <span>
    <strong
      >{{ value }}
      <router-link :to="{ path: `/token/${transfer.token}` }">
        {{ transfer.symbol }}
      </router-link>
      <q-tooltip> {{ transfer.value.toFixed(3) }} {{transfer.symbol}} </q-tooltip>
    </strong>
  </span>
</template>

<script>
export default {
  name: "tx-transfer",
  props: {
    transfer: {
      type: Object,
      required: true
    }
  },
  computed: {
    value() {
      return this.$utils.calcQty(this.transfer.value);
    }
  }
};
</script>
