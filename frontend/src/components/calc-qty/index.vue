<template>
  <div>
    <span class="calc-qty">{{qtyText}}</span>
    <q-tooltip v-if="tooltip">
      {{qty}}
    </q-tooltip>
  </div>
</template>

<script>
export default {
  name: 'cacl-qty',
  props: {
    qty: [Number, String],
    tooltip: Boolean
  },
  computed: {
    qtyText () {
      if(this.qty) {
        return this.calcQty(+this.qty);
      }
      return 0;
    }
  },
  methods: {
    calcQty(value) {
      return this.$utils.calcQty(value);
    },
  }
}
</script>