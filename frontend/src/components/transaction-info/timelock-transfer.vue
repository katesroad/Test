<style lang="scss">
.tl-transfer {
  line-height: 1.01;
  small {
    display: block;
  }
}
</style>
<template>
  <span class="tl-transfer">
    <transfer-info :transfer="transferData" />
    <small>
      {{days}}
    </small>
  </span>
</template>

<script>
import TransferInfo from "./transfer-info";

export default {
  name: "timelock-transfer",
  props: {
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    transferData() {
      const { token, symbol, value } = this.data;
      return { token, symbol, value };
    },
    days() {
      const { startTime, endTime } = this.data;
      if (endTime === 18446744073709552000) return `(~forever)`;
      const days = (endTime - startTime) / 86400;
      if (days <= 1) {
        const hrs = (endTime - startTime) / 60;
        if (hrs < 1) return `(<1 hour)`;
        else if (hrs < 2) return `(${hrs.toFixed(2)} hours)`;
        else if (hrs < 24) return `(${hrs.toFixed(2)} hours)`;
        else return `(1 day)`;
      } else if (days <= 30) {
        return `(${days.toFixed(2)} days)`;
      } else {
      }

      const months = days / 30;
      if (months <= 1) return `(${months.toFixed(2)} month )`;
      else if (months <= 12) return `(${months.toFixed(2)} months)`;
      else {
      }
      const years = months / 12;
      if (years < 2) {
        return `(${years.toFixed(2)} year)`;
      }
      return `(${years.toFixed(2)} years)`;
    }
  },
  components: {
    TransferInfo
  },
  methods: {
    getMonthStr(rMonths) {
      if (rMonths < 2) return `${rMonths.toFixed(2)} month`;
      else return `${rMonths.toFixed(2)} months`;
    }
  }
};
</script>
