<template>
  <div>
    <div class="plan">
      <sd-card icon="doc-add" title="plan.edit.add">
        <template #action>
          <el-button type="success" size="medium" icon="el-icon-document-checked" @click="handleCreate">
            <span v-t="'common.save'"></span>
          </el-button>
          <el-button type="info" size="medium" icon="el-icon-close" @click="handleCancel">
            <span v-t="'common.cancel'"></span>
          </el-button>
        </template>
        <sd-plan-editable ref="edit" :initial="initial" @waypoint-change="handleWaypointChange"></sd-plan-editable>
      </sd-card>
      <sd-map icon="map-waypoint" title="map.waypoint" fit v-bind="map"></sd-map>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';

import Card from '@/components/card.vue';
import SdMap from '@/components/map/map.vue';
import PlanEditable from '@/components/plan/editable.vue';

import { waypointsToMapProps } from './common';

export default {
  name: 'sd-plan-new',
  data() {
    return {
      /** @type {Partial<SDWC.PlanInfo>} */
      initial: {
        name: '',
        node_id: null,
        files: { waypoint: '' },
        extra: {}
      },
      map: {
        /** @type {SDWC.LatLng[]} */
        boundary: [],
        /** @type {SDWC.MapPolyline[]} */
        polylines: [],
        /** @type {SDWC.MarkerBase[]} */
        markers: []
      }
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
        .catch(e => this.$message.error(this.$t('plan.edit.create_failed', { code: e.status })));
    },
    handleCancel() {
      this.$router.push({ name: 'plan/list' });
    },
    handleWaypointChange(wp) {
      this.map = waypointsToMapProps(wp);
    }
  },
  components: {
    [Card.name]: Card,
    [SdMap.name]: SdMap,
    [PlanEditable.name]: PlanEditable
  }
};
</script>
