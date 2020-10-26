<template>
    <VueJsonPretty :data="data"/>
</template>

<script>
import 'vue-json-pretty/lib/styles.css'

export default {
  name: "contract-logs",
  props: {
    data: Object,
  },
  components:  {
    VueJsonPretty: () => import('vue-json-pretty')
  },
};
</script>
