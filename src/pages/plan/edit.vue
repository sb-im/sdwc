<template>
  <el-card class="sd-card" shadow="never">
    <template #header>
      <div class="sd-card__head">
        <sd-icon value="task/t_edit"></sd-icon>
        <span class="sd-card__title">{{ $t('plan.edit.alter') }}</span>
        <div class="sd-card__action">
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
        </div>
      </div>
    </template>
    <sd-plan-editable :initial="plan" ref="edit"></sd-plan-editable>
  </el-card>
</template>

<script>
import { mapActions } from 'vuex';
import Icon from '@/components/sd-icon.vue';
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
    [Icon.name]: Icon,
    [PlanEditable.name]: PlanEditable
  }
};
</script>
