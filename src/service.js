import request from "umi-request";

export async function queryRule(params) {
  return request(`/api/table-list`, {
    params
  });
}

export async function removeRule(params) {
  return request("/api/table-list", {
    method: "POST",
    data: {
      ...params,
      method: "delete"
    }
  });
}

export async function addRule(params) {
  return request("/api/table-list", {
    method: "POST",
    data: {
      ...params,
      method: "post"
    }
  });
}

export async function updateRule(params) {
  return request("/api/table-list", {
    method: "POST",
    data: {
      ...params,
      method: "update"
    }
  });
}

export async function traingHistory(params) {
  return request(`/restapi/model/training_history/`, {
    params
  });
}

export async function latestStatus(params) {
  return request(`/restapi/model/latest_status/`, {
    params
  });
}

export async function liveHistory(params) {
  return request(`/restapi/model/live_history/`, {
    params
  });
}
