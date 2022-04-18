<template>
  <div>
    <sd-card class="plan-list" icon="new-view" title="plan.list.list" dense>
      <template #action>
        <el-button type="success" size="medium" icon="el-icon-plus" @click="handleNew">
          <span v-t="'plan.edit.add'"></span>
        </el-button>
      </template>
      <el-table
        ref="table"
        stripe
        :data="tableData"
        :height="tableHeight"
        :row-class-name="getRowClassName"
      >
        <el-table-column>
          <template #header>
            <span v-t="'plan.name'"></span>
          </template>
          <template v-slot="{ row }">
            <router-link :to="{ name: 'plan/view', params: { id: row.id } }" v-slot="{ href }">
              <el-link v-text="row.name" :href="href"></el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column :filters="nodeFilters" :filter-method="handleFilterByNode">
          <template #header>
            <span v-t="'plan.node'"></span>
          </template>
          <template v-slot="{ row }">
            <router-link :to="{ name: 'node', params: { id: row.node_id } }" v-slot="{ href }">
              <el-link v-text="row.node" :href="href"></el-link>
            </router-link>
          </template>
        </el-table-column>
        <el-table-column prop="created" :formatter="dateFormatter" sortable>
          <template #header>
            <span v-t="'plan.list.created'"></span>
          </template>
        </el-table-column>
        <el-table-column width="120px" sortable :sort-method="sortByRunning">
          <template #header>
            <span v-t="'plan.list.state'"></span>
          </template>
          <template v-slot="{ row }">
            <el-tag
              size="medium"
              :effect="row.running ? 'dark' : 'plain'"
              :type="row.running ? '' : 'info'"
              v-t="`plan.list.${row.running ? 'running' : 'idle'}`"
            ></el-tag>
          </template>
        </el-table-column>
      </el-table>
    </sd-card>
  </div>
</template>

<script>
import throttle from 'lodash/throttle';

import Card from '@/components/card.vue';

/**
 * @typedef {{ id: number, name: string, node: string, node_id: string, created: Date, running: boolean }} PlanListItem
 */

export default {
  name: 'sd-plan-list',
  data: () => ({
    tableHeight: 500,
  }),
  computed: {
    /** @returns {SDWC.PlanState} */
    plans() { return this.$store.state.plan; },
    /** @returns {SDWC.Node[]} */
    nodes() { return this.$store.state.node; },
    /** @returns {PlanListItem[]} */
    tableData() {
      /** @type {PlanListItem[]} */
      const result = [];
      for (const p of this.plans.info) {
        result.push({
          id: p.id,
          name: p.name,
          node_id: p.node_id,
          node: this.nodes.find(n => n.info.id === p.node_id)?.info.name ?? this.$t('common.none'),
          created: new Date(p.created_at),
          running: this.plans.running.find(r => r.id === p.id)?.running !== undefined
        });
      }
      return result;
    },
    /** @returns {{ text: string, value: string }[]} */
    nodeFilters() {
      return this.nodes.map(n => ({ text: n.info.name, value: n.info.id }));
    }
  },
  methods: {
    handleNew() {
      this.$router.push({ name: 'plan/new' });
    },
    /**
     * @param {{ row: PlanListItem }} _
     * @returns {string}
     */
    getRowClassName({ row }) {
      return row.running ? 'is-running' : '';
    },
    /**
     * @param {string} value
     * @param {PlanListItem} row
     * @param {any} column
     * @returns {boolean}
     */
    handleFilterByNode(value, row /*, column */) {
      return row.node_id == value;
    },
    /**
     * @param {PlanListItem} row
     * @param {any} column
     */
    dateFormatter(row) {
      return this.$d(row.created, 'long');
    },
    /**
     * @param {PlanListItem} a
     * @param {PlanListItem} b
     * @returns {number}
     */
    sortByRunning(a, b) {
      return a.running - b.running;
    }
  },
  beforeMount() {
    const fn = () => {
      this.tableHeight = window.innerHeight - 155;
    };
    fn();
    this.resizeListener = throttle(fn, 300);
    window.addEventListener('resize', this.resizeListener, { passive: true });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.resizeListener);
  },
  components: {
    [Card.name]: Card
  }
};
</script>

<style>
.plan-list {
  height: 100%;
  margin: 0;
}

.plan-list  .el-table__cell {
  padding: 5px 0;
}

.plan-list .el-table__row.is-running {
  background-image: repeating-linear-gradient(45deg, #00000015, #00000015 10px, transparent 10px, transparent 20px);
}
.plan-list .el-table__row.is-running:hover .el-table__cell,
.plan-list .el-table__row.is-running.el-table__row--striped .el-table__cell {
  background-color: transparent;
}
</style>
