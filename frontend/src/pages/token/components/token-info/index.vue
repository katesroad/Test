<style lang="scss" scoped>
.page {
  &-icon {
    display: block;
    width: 48px;
    height: 48px;
    line-height: 48px;
    border-radius: 4px;
    background-color: rgba(31, 65, 200, 0.2);
  }
}
.token-name {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
</style>

<template>
  <q-card class="tokens__info info-card row bg-white" v-if="token.hash">
    <div class="page-header">
      <span class="page-icon text-center">
        {{ token.symbol }}
      </span>
      <div class="token-name">
        <strong
          >{{ token.name }}
          <small class="item-label" v-if="token.verified">Verified</small>
        </strong>
        <span class="is-hash">{{ token.hash }}</span>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-md-6">
        <div class="key-info">
          <key-value prop="Total Supply" :value="supply" />
          <key-value prop="verified" :value="verified" />
          <key-value prop="Decimals" :value="token.precision" />
          <key-value prop="Changeable" :value="changeable" />
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="other-info">
          <key-value prop="Issuer" :tool-tip="true">
            <fusion-hash
              prefix="address"
              :use-abbrev="false"
              :hash="token.issuer"
              v-if="token.issuer"
            />
          </key-value>
          <key-value prop="Issue At">
            <fsn365-datetime
              :timestamp="token.create_at"
              v-if="token.create_at"
            />
          </key-value>
          <key-value prop="Transactions" :value="token.txs" />
          <key-value prop="Holders" :value="token.holders" />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import Fsn365Datetime from "@/components/fsn365-datetime";
import KeyValue from "@/components/key-value";
import FusionHash from "@/components/fusion-hash";

export default {
  name: "token-info",
  props: {
    token: {
      type: Object,
      required: true
    },
    loading: { type: Boolean }
  },
  computed: {
    changeable() {
      if(this.token.hash.length === 42) return 'Not Sure';
      if (this.token.canchange) return "Yes";
      else return "No";
    },
    verified() {
      if (this.token.verified) return "Yes";
      else return "No";
    },
    supply() {
      return this.token.qty + "  " + this.token.symbol;
    }
  },
  components: {
    KeyValue,
    FusionHash,
    Fsn365Datetime
  }
};
</script>
