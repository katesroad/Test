<style lang="scss" scoped>
.label {
  text-transform: capitalize;
}
a {
  word-break: break-all;
}
</style>

<template>
  <div>
    <span v-if="isFsnContract">Fsn Contract</span>
    <router-link
      v-else
      :to="to"
      @mouseover.native="showTip = true"
      @mouseout.native="showTip = false"
      class="ellipsis hash-value"
      >{{ text }}
      <slot> </slot>
      <q-tooltip v-model="showTip">{{ hash }}</q-tooltip>
    </router-link>
  </div>
</template>

<script>
export default {
  name: "fusion-hash",
  props: {
    hash: {
      type: String,
      required: true
    },
    prefix: {
      type: String,
      required: true
    },
    size: Number,
    useAbbrev: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return { showTip: false };
  },
  computed: {
    isFsnContract() {
      return this.hash === "0xffffffffffffffffffffffffffffffffffffffff";
    },
    text() {
      const labels = this.$store.state.addressNames;
      const label = labels[this.hash];
      if (label) return label;
      if (!this.useAbbrev) return this.hash;
      const size = this.size || 5;
      const first5Str = this.hash.substr(0, size);
      const last5Str = this.hash.substr(-size);
      return `${first5Str}...${last5Str}`;
    },
    to() {
      return `/${this.prefix}/${this.hash}`;
    }
  }
};
</script>
