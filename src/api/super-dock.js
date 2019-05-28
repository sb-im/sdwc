import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  wr = wr.url(url.replace(/\/$/, ''), true);
}

export function setAuth(token = '') {
  wr = wr.auth(token);
}

// {"access_token":"...","token_type":"bearer","expires_in":7200,"created_at":1553867150}
// {"error":"invalid_grant","error_description":"The provided authorization grant is invalid, expired, revoked, does not match the redirection URI used in the authorization request, or was issued to another client."}
export function token(username, password, client_id, client_secret) {
  return wr.url('/oauth/token')
    .post({
      username,
      password,
      client_id,
      client_secret,
      grant_type: 'password'
    })
    .json(json => json);
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

export function nodes() {
  return wr.url('/api/v1/nodes/')
    .get()
    .json();
}

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

export function planLogs(id) {
  return wr.url(`/api/v1/plans/${id}/plan_logs/`)
    .get()
    .json();
}

export function retrievePlanLog(planId, logId) {
  return wr.url(`/api/v1/plans/${planId}/plan_logs/${logId}`)
    .get()
    .json();
}

export function getFile(url) {
  return wr.url(url)
    .get()
    .res();
}
