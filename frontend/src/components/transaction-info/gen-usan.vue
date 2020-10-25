<template>
  <router-link :to="to">
    {{ usan }}
  </router-link>
</template>

<script>
export default {
  name: "tx-usan",
  props: {
    usan: {
      type: Number,
      required: true
    }
  },
  computed: {
    to() {
      return `/address/${this.usan}`;
    }
  }
};
</script>
