<template>
  <el-dialog
    width="320px"
    append-to-body
    custom-class="sd-team-dialog"
    :title="$t('header.switch_team')"
    :visible.sync="visible"
    :show-close="!pending"
    :close-on-click-modal="!pending"
    :close-on-press-escape="!pending"
  >
    <el-form label-position="top" :model="form" v-loading="pending">
      <el-form-item>
        <template #label>
          <span v-t="'header.switch_team_to'"></span>
        </template>
        <el-select v-model="form.target">
          <el-option v-for="t of teams" :key="t.id" :label="t.name" :value="t.id"></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div slot="footer">
      <el-button size="medium" :disabled="pending" @click="close" v-t="'common.cancel'"></el-button>
      <el-button
        type="primary"
        size="medium"
        :disabled="pending"
        @click="handleSwitchTeam"
        v-t="'common.confirm'"
      ></el-button>
    </div>
  </el-dialog>
</template>

<script>
import { mapActions } from 'vuex';

export default {
  name: 'sd-team-dialog',
  data: () => ({
    visible: false,
    pending: false,
    form: {
      target: -1
    }
  }),
  computed: {
    /** @returns {SDWC.User} */
    user() { return this.$store.state.user; },
    /** @returns {ApiTypes.V3.Team[]} */
    teams() { return this.user.info.teams; }
  },
  methods: {
    ...mapActions([
      'switchTeam'
    ]),
    async handleSwitchTeam() {
      this.pending = true;
      await this.switchTeam(this.form.target);
      this.pending = false;
      this.close();
    },
    open() {
      this.form.target = this.user.info.team_id;
      this.visible = true;
    },
    close() {
      this.visible = false;
    }
  }
};
</script>
