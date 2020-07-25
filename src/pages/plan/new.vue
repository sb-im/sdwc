<template>
  <sd-card icon="doc-add" title="plan.edit.add">
    <template #action>
      <el-button type="success" size="medium" icon="el-icon-document" @click="handleCreate">
        <span v-t="'plan.edit.save'"></span>
      </el-button>
    </template>
    <sd-plan-editable :initial="initial" ref="edit"></sd-plan-editable>
  </sd-card>
</template>

<script>
import { mapActions } from 'vuex';

import Card from '@/components/card.vue';
import PlanEditable from '@/components/plan/editable.vue';

export default {
  name: 'sd-plan-new',
  data() {
    return {
      initial: {}
    };
  },
  methods: {
    ...mapActions([
      'createPlan'
    ]),
    handleCreate() {
      const plan = this.$refs.edit.getPlan();
      this.createPlan(plan)
        .then(p => this.$router.push({ name: 'plan/view', params: { id: p.id } }))
        .catch(() => this.$message.error(this.$t('plan.edit.create_failed')));
    }
  },
  components: {
    [Card.name]: Card,
    [PlanEditable.name]: PlanEditable
  }
};
</script>
