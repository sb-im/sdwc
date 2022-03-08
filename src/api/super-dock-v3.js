import wretch from 'wretch';

let wr = wretch();

export function setBaseURL(url = '') {
  if (!url.endsWith('/')) {
    url += '/';
  }
  wr = wr.url(`${url}api/v3`, true);
}

export function setAuth(token = '') {
  wr = wr.auth(`Bearer ${token}`);
}

/**
 * @returns {Promise<ApiTypes.V3.ServerStatus>}
 */
export function getServerStatus() {
  return wr.url('/status')
    .get()
    .json();
}

/**
 * @returns {Promise<ApiTypes.V3.User>}
 */
export function getCurrentUser() {
  return wr.url('/current')
    .get()
    .json();
}

/**
 * @returns {Promise<ApiTypes.V3.Login>}
 */
export function login(username, password) {
  return wr.url('/login')
    .formData({ username, password })
    .post()
    .json();
}

/**
 * @param {number} id team id
 * @returns {Promise<ApiTypes.V3.SwitchTeam>}
 */
export function switchTeam(id) {
  return wr.url(`/switch_team/${id}`)
    .post()
    .json();
}

/**
 * @returns {Promise<ApiTypes.V3.Login>}
 */
export function refershToken() {
  return wr.url('/refresh_token')
    .post()
    .json();
}

export const DefaultSidebar = [
  { type: 'overview' },
  { type: 'plan' },
  { type: 'node' },
  { type: 'schedule' }
];

/** @returns {Promise<SDWC.SidebarItem[]>} */
export function getSidebar() {
  return wr.url('/sidebar')
    .get()
    .json()
    .catch(() => DefaultSidebar);
}

/**
 * @returns {Promise<ApiTypes.V3.Node[]>}
 */
export function getNodes() {
  return wr.url('/nodes')
    .get()
    .json(nodes => {
      for (const n of nodes) {
        if (!Array.isArray(n.points)) {
          n.points = [];
        }
      }
      return nodes;
    });
}

/**
 * @returns {Promise<ApiTypes.V3.Task[]>}
 */
export function getTasks() {
  return wr.url('/tasks')
    .get()
    .json();
}

/**
 * @returns {Promise<ApiTypes.V3.Task>}
 */
export function createTask(name, node_id) {
  return wr.url('/tasks')
    .formData({ name, node_id })
    .post()
    .json();
}

/**
 * @param {number} id
 * @param {number} page
 * @param {number} size
 * @returns {Promise<ApiTypes.V3.Task>}
 */
export function getTaskDetail(id, page, size) {
  return wr.url(`/tasks/${id}`)
    .query({ page, size })
    .get()
    .json();
}

/**
 * @param {number} id
 * @param {Partial<ApiTypes.V3.Task>} body
 * @returns {Promise<ApiTypes.V3.Task>}
 */
export function updateTask(id, body) {
  return wr.url(`/tasks/${id}`)
    .put(body)
    .json();
}

export function deleteTask(id) {
  return wr.url(`/tasks/${id}`)
    .delete()
    .json();
}

/**
 * @param {number} id
 * @param {number} page
 * @param {number} size
 * @returns {Promise<ApiTypes.V3.Job[]>}
 */
export function getTaskJobs(id, page, size) {
  return wr.url(`/tasks/${id}/jobs`)
    .query({ page, size })
    .get()
    .json();
}

export function createTaskJob(id) {
  return wr.url(`/tasks/${id}/jobs`)
    .post()
    .json();
}

/**
 * @param {{ [key: string]: string }} files
 * @returns {Promise<{ [key: string]: string }>}
 */
export function createBlob(files) {
  return wr.url('/blobs')
    .formData(files)
    .post()
    .json();
}

/**
 * @param {number | string} id blob id
 */
export function getBlob(id) {
  return wr.url(`/blobs/${id}`)
    .get()
    .res();
}

/**
 * @returns {Promise<ApiTypes.V3.Blob>}
 */
export function updateBlob(id, file) {
  return wr.url(`/blobs/${id}`)
    .formData(file)
    .put()
    .json();
}

/**
 * @returns {Promise<string>}
 */
export function createMqttUser() {
  return wr.url('/mqtt/url')
    .post()
    .json();
}

/**
 * @param {number} page
 * @param {number} size
 * @returns {Promise<ApiTypes.V3.Schedule[]>}
 */
export function getSchedules(page, size) {
  return wr.url('/schedules')
    .query({ page, size })
    .get()
    .json();
}

/**
 * @param {ApiTypes.V3.Schedule} schedule
 * @returns {Promise<ApiTypes.V3.Schedule>}
 */
export function createSchedule(schedule) {
  return wr.url('/schedules')
    .formData(schedule)
    .post()
    .json();
}

export function deleteSchedule(id) {
  return wr.url(`/schedules/${id}`)
    .delete()
    .json();
}

/**
 * @param {number} id
 * @param {ApiTypes.V3.Schedule} schedule
 * @returns {Promise<ApiTypes.V3.Schedule>}
 */
export function updateSchedule(id, schedule) {
  return wr.url(`/schedules/${id}`)
    .formData(schedule)
    .patch()
    .json();
}

/**
 * @param {number} id
 * @returns {Promise<ApiTypes.V3.Schedule>}
 */
export function triggerSchedule(id) {
  return wr.url(`/schedules/${id}/trigger`)
    .post()
    .json();
}
