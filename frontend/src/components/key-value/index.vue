<style lang="scss">
@import "./style.scss";
</style>

<template>
  <div class="key-value justify-start row items-center">
    <span class="key">{{ prop }}</span>
    <span :class="valueClasses">
      <slot>
        <span @click="toggleValueDetail">{{ value }}</span>
      </slot>
    </span>
    <q-dialog v-model="showMore">
      <q-card>
        <q-card-section>
          <div class="text-h6">{{ prop }}</div>
        </q-card-section>
        <q-card-section class="q-pt-none">
          <p class="value-detail">
            {{ value }}
          </p>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="OK" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import FusionHash from "@/components/fusion-hash";
import TimeAgo from "vue2-timeago";

export default {
  name: "key-value",
  props: {
    prop: String,
    value: {
      type: [String, Number]
    },
    type: {
      type: String,
      required: false
    },
    toolTip: Boolean,
    ellipsis: Boolean,
    viewMore: Boolean
  },
  data() {
    return { showMore: false };
  },
  computed: {
    isHash() {
      const reg = /^0x([A-Fa-f0-9]{64})$/;
      const contractReg = /^0x([A-Fa-f0-9]{40})$/;
      const isHash = reg.test(this.value) || contractReg.test(this.value);
      return isHash && this.type;
    },
    isTimestamp() {
      return this.type === "timestmap" && this.value;
    },
    valueClasses() {
      let classes = "value";
      if (this.ellipsis) classes += " ellipsis";
      if (this.viewMore) classes += " has-more";
      return classes;
    }
  },
  methods: {
    toggleValueDetail() {
      if (!this.viewMore) return;
      this.showMore = !this.showMore;
    }
  }
};
</script>
