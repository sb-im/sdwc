<template>
  <el-card class="plan__edit" shadow="never">
    <div class="sd-node-card__head" slot="header">
      <sd-icon value="task/t_add"></sd-icon>
      <span class="sd-node-card__title">{{ $t('plan.edit.create') }}</span>
      <div class="sd-node-card__action">
        <el-button
          type="success"
          size="medium"
          icon="el-icon-document"
          @click="handleCreate"
        >{{ $t('plan.edit.save_plan') }}</el-button>
      </div>
    </div>
    <sd-plan-editable :initial="initial" ref="edit"></sd-plan-editable>
  </el-card>
</template>

<script>
import { mapActions } from 'vuex';
import Icon from '@/components/sd-icon.vue';
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
        .then(p => this.$router.push({ name: 'plan/view', params: { id: p.id } }));
    }
  },
  components: {
    [Icon.name]: Icon,
    [PlanEditable.name]: PlanEditable
  }
};
</script>
