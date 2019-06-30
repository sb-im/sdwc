<template>
  <sd-card icon="edit" :title="$t('plan.edit.alter')">
    <template #action>
      <el-button
        type="success"
        size="medium"
        icon="el-icon-document"
        @click="handleUpdate"
      >{{ $t('plan.edit.save_plan') }}</el-button>
      <el-button
        type="danger"
        size="medium"
        icon="el-icon-delete"
        @click="handleDelete"
      >{{ $t('plan.edit.delete_plan') }}</el-button>
      <el-button
        type="info"
        size="medium"
        icon="el-icon-close"
        @click="handleCancel"
      >{{ $t('common.back') }}</el-button>
    </template>
    <sd-plan-editable :initial="plan" ref="edit"></sd-plan-editable>
  </sd-card>
</template>

<script>
import { mapActions } from 'vuex';

import Card from '@/components/card.vue';
import PlanEditable from '@/components/plan/editable.vue';

export default {
  name: 'sd-plan-edit',
  props: {
    initial: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      plan: Object.assign({}, this.initial)
    };
  },
  methods: {
    ...mapActions([
      'updatePlan',
      'deletePlan'
    ]),
    handleUpdate() {
      const plan = this.$refs.edit.getPlan();
      this.updatePlan(plan)
        .then(() => this.$router.push({ name: 'plan/view', params: { id: this.plan.id } }));
    },
    handleDelete() {
      this.$confirm(this.$t('plan.edit.delete_tips'), {
        type: 'warning',
        title: this.$t('common.system_tips')
      })
        .then(() => this.deletePlan(this.initial.id))
        .then(() => this.$router.push({ name: 'panel' }))
        .catch(() => {/* noop */ });
    },
    handleCancel() {
      this.$router.back();
    }
  },
  components: {
    [Card.name]: Card,
    [PlanEditable.name]: PlanEditable
  }
};
</script>
