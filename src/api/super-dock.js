import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wr.url(url.replace(/\/$/, ''), true);
}

export function setAuth(token = '') {
  wr = wr.auth(token);
}

/** @returns {Promise<ApiTypes.LoginResponseOk>} */
export function token(username, password, client_id, client_secret) {
  return wr.url('/oauth/token')
    .post({
      username,
      password,
      client_id,
      client_secret,
      grant_type: 'password'
    })
    .json();
}

export function logout(token) {
  return wr.url('/oauth/revoke')
    .post({ token })
    .json();
}

/**
 * @see https://staging.sblab.xyz/apidoc/
 */

export function user() {
  return wr.url('/api/v1/user/')
    .get()
    .json();
}

/** @returns {Promise<SDWC.NodeInfo[]>} */
export function nodes() {
  return wr.url('/api/v1/nodes/')
    .get()
    .json();
}

export function getNodeMissionQueue(id) {
  return wr.url(`/api/v1/nodes/${id}/mission_queues/`)
    .get()
    .json();
}

/** @returns {Promise<SDWC.PlanInfo[]>} */
export function plans() {
  return wr.url('/api/v1/plans/')
    .get()
    .json();
}

export function createPlan(plan) {
  return wr.url('/api/v1/plans/')
    .formData(plan)
    .post()
    .json();
}

/** @returns {Promise<SDWC.PlanInfo>} */
export function retrievePlan(id) {
  return wr.url(`/api/v1/plans/${id}`)
    .get()
    .json();
}

export function updatePlan(id, plan) {
  return wr.url(`/api/v1/plans/${id}`)
    .formData(plan)
    .patch()
    .json();
}

export function deletePlan(id) {
  return wr.url(`/api/v1/plans/${id}`)
    .delete()
    .json();
}

export function getPlanMissionQueue(id) {
  return wr.url(`/api/v1/plans/${id}/mission_queues/`)
    .get()
    .json();
}

export function runPlan(id) {
  return wr.url(`/api/v1/plans/${id}/plan_logs/`)
    .post()
    .text();
}

export function stopPlan(id) {
  return wr.url(`/api/v1/mission_queues/plan/${id}`)
    .delete()
    .text();
}

/** @returns {Promise<SDWC.PlanLog[]>} */
export function planLogs(id) {
  return wr.url(`/api/v1/plans/${id}/plan_logs/`)
    .get()
    .json();
}

/** @returns {Promise<SDWC.PlanLog>} */
export function retrievePlanLog(planId, logId) {
  return wr.url(`/api/v1/plans/${planId}/plan_logs/${logId}`)
    .get()
    .json();
}

export function runPlanJob(id) {
  return wr.url(`/api/v2/plans/${id}/jobs/`)
    .post()
    .text();
}

export function getPlanJobs(id) {
  return wr.url(`/api/v2/plans/${id}/jobs/`)
  .get()
  .json();
}

export function cancelPlanJob(planId, jobId) {
  return wr.url(`/api/v2/plans/${planId}/jobs/${jobId}/cancel`)
  .post()
  .text();
}

export function downloadFile(url) {
  return wr.url(url)
    .get()
    .res();
}

export function downloadBlob(id) {
  return downloadFile(`/api/v1/blobs/${id}`);
}
