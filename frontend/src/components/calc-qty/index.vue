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
    tooltip: Boolean,
    fixed: {
      type: Number,
      default: 1
    }
  },
  computed: {
    qtyText () {
      if(this.qty) {
        return this.calcQty(+this.qty, +this.fixed);
      }
      return 0;
    }
  },
  methods: {
    calcQty(value, fixed) {
      return this.$utils.calcQty(value, fixed);
    },
  }
}
</script>