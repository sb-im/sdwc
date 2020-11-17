<template>
  <div class="plan">
    <sd-card icon="doc-edit" title="plan.edit.edit">
      <template #action>
        <el-button type="success" size="medium" icon="el-icon-document" @click="handleUpdate">
          <span v-t="'common.save'"></span>
        </el-button>
        <el-button type="danger" size="medium" icon="el-icon-delete" @click="handleDelete">
          <span v-t="'common.delete'"></span>
        </el-button>
        <el-button type="info" size="medium" icon="el-icon-close" @click="handleCancel">
          <span v-t="'common.cancel'"></span>
        </el-button>
      </template>
      <sd-plan-editable ref="edit" :initial="plan" @waypoint-change="handleWaypointChange"></sd-plan-editable>
    </sd-card>
    <sd-map icon="map-waypoint" title="map.waypoint" fit v-bind="map"></sd-map>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import Card from '@/components/card.vue';
import SdMap from '@/components/map/map.vue';
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
      plan: Object.assign({}, this.initial),
      map: {
        boundary: [],
        path: [],
        markers: []
      }
    };
  },
  methods: {
    ...mapActions([
      'updatePlan',
      'deletePlan',
      'getMapPath'
    ]),
    handleUpdate() {
      const plan = this.$refs.edit.getPlan();
      this.updatePlan(plan)
        .then(() => this.$router.push({ name: 'plan/view', params: { id: this.plan.id } }))
        .catch(e => this.$message.error(this.$t('plan.edit.update_failed', { code: e.status })));
    },
    handleDelete() {
      this.$confirm(this.$t('plan.edit.delete_tips'), {
        type: 'warning'
      })
        .then(() => this.deletePlan(this.initial.id))
        .then(() => this.$router.push({ name: 'panel' }))
        .catch(() => {/* noop */ });
    },
    handleCancel() {
      this.$router.back();
    },
    handleWaypointChange(map) {
      this.map = map;
    }
  },
  created() {
    this.getMapPath(this.plan.map_path)
      .then(r => {
        this.map.boundary = r.boundary || [];
        this.map.path = r.path;
        this.map.markers = r.actions;
      });
  },
  components: {
    [Card.name]: Card,
    [SdMap.name]: SdMap,
    [PlanEditable.name]: PlanEditable
  }
};
</script>
