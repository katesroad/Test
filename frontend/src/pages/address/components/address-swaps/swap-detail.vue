<template>
  <div class="row items-center justify-center" style="min-width: 100px">
    <span v-for="pair in fromPairs" :key="pair.token">
      <router-link :to="`/token/${pair.token}`">
        {{ pair.symbol }}
      </router-link>
    </span>
    <img src="svg/swap.svg" alt="fsn swap" style="width: 16px; margin: 0 4px">
    <span v-for="(pair, index) in toPairs" :key="index">
      <router-link :to="`/token/${pair.token}`">
        {{ pair.symbol }}
      </router-link>
    </span>
  </div>
</template>

<script>
export default {
  name: "native-swap-detail",
  props: {
    swap: {
      type: Object,
      required: true
    }
  },
  computed: {
    fromPairs() {
      const { fromPairs } = this.swap;
      return fromPairs;
    },
    toPairs() {
      const { toPairs } = this.swap;
      return toPairs;
    }
  },
  methods: {}
};
</script>
