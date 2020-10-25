<template>
  <div class="contract-creating">
    <span v-if="isERC20Creating">
      Issue {{ data.value }}
      <router-link :to="to" class="text-weight-bold">
        {{ data.symbol }}</router-link
      >
    </span>
    <span v-else>
      create contract:
      <fusion-hash :hash="data.contract" prefix="address" :use-abbrev="true" />
    </span>
  </div>
</template>

<script>
import FusionHash from "@/components/fusion-hash";

export default {
  name: "contract-creating",
  props: {
    data: Object
  },
  computed: {
    isERC20Creating() {
      return !!this.data.symbol;
    },
    to() {
      if (this.data.symbol) return `/token/${this.data.token}`;
      else return `/address/${this.data.contract}`;
    }
  },
  components: {
    FusionHash
  }
};
</script>
