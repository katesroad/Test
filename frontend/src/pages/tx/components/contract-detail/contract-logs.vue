<template>
  <div class="contract-logs">
    <json-pretty :data="logs" />
  </div>
</template>

<script>

export default {
  name: "contract-logs",
  props: {
    logs: Array
  },
  components: {
    JsonPretty: () => import('@/components/json-pretty')
  }
};
</script>
