<template>
  <div class="contract-logs">
    <key-value prop="logs">
      <ul>
        <li v-for="(item, i) in logs" :key="i">
          <span>{{ item }} </span>
        </li>
      </ul>
    </key-value>
  </div>
</template>

<script>
import KeyValue from "@/components/key-value";

export default {
  name: "contract-logs",
  props: {
    logs: Array
  },
  components: {
    KeyValue
  }
};
</script>
