<template>
  <span>{{ timeStr }}</span>
</template>

<script>
export default {
  name: "fsn365-datetime",
  props: {
    timestamp: {
      type: Number,
      required: true
    }
  },
  computed: {
    timeStr() {
      if (this.timestamp === 18446744073709552000) return `forever`;
      const datetime = new Date(this.timestamp * 1000);
      let atDay = datetime.getDay() + 1;
      let atMonth = datetime.getMonth() + 1;
      const atYear = datetime.getFullYear();
      let atHr = datetime.getHours() + 1;
      let atM = datetime.getMinutes() + 1;
      if (atM < 10) {
        atM = "0" + atM;
      }
      if (atMonth < 10) {
        atMonth = "0" + atMonth;
      }
      if (atHr < 10) {
        atHr = "0" + atHr;
      }
      if (atDay < 10) {
        atDay = "0" + atDay;
      }
      return `${atYear}-${atMonth}-${atDay} ${atHr}:${atM}`;
    }
  }
};
</script>
