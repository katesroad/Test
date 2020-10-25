<template>
  <span class="trade-price" v-if="price">
    {{ price }}
    <router-link :to="`/token/${data.from.token}`">
      <b>{{ data.from.symbol }}</b></router-link
    >
    <b>:</b> 1
    <router-link :to="`/token/${data.to.token}`"
      ><b> {{ data.to.symbol }}</b></router-link
    >
  </span>
</template>

<script>
export default {
  name: "trade-price",
  props: {
    data: {
      type: Object,
      required: true
    }
  },
  computed: {
    price() {
      const { from, to } = this.data;
      return (from.value / to.value).toFixed(3);
    }
  }
};
</script>
