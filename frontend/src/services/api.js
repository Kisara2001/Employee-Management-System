const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3001";

export const getToken = () => localStorage.getItem("token");
export const setToken = (t) => localStorage.setItem("token", t);

async function request(path, options = {}) {
  const headers = options.headers || {};
  if (!headers["Content-Type"] && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }
  const token = getToken();
  if (token) headers["Authorization"] = "Bearer " + token;

  const url =
    API_BASE.replace(/\/+$/, "") + (path.startsWith("/") ? path : `/${path}`);
  const res = await fetch(url, {
    ...options,
    headers,
    body:
      headers["Content-Type"] === "application/json" && options.body
        ? JSON.stringify(options.body)
        : options.body,
  });

  if (!res.ok) {
    const msg = (await res.json().catch(() => ({ message: res.statusText })))
      .message;
    throw new Error(msg || "Request failed");
  }
  return res.json();
}

export const api = {
  // NOTE: no /api prefix now
  login: (email, password) =>
    request("/auth/login", { method: "POST", body: { email, password } }),

  listEmployees: (q = "") =>
    request("/employees" + (q ? `?q=${encodeURIComponent(q)}` : "")),
  createEmployee: (payload) =>
    request("/employees", { method: "POST", body: payload }),
  updateEmployee: (id, payload) =>
    request(`/employees/${id}`, { method: "PATCH", body: payload }),
  deleteEmployee: (id) => request(`/employees/${id}`, { method: "DELETE" }),

  listDepartments: () => request("/departments"),
  createDepartment: (payload) =>
    request("/departments", { method: "POST", body: payload }),
  updateDepartment: (id, payload) =>
    request(`/departments/${id}`, { method: "PATCH", body: payload }),
  deleteDepartment: (id) => request(`/departments/${id}`, { method: "DELETE" }),

  checkIn: (employeeId) =>
    request("/attendance/check-in", { method: "POST", body: { employeeId } }),
  checkOut: (employeeId) =>
    request("/attendance/check-out", { method: "POST", body: { employeeId } }),
  listAttendance: (employeeId, month) =>
    request(
      "/attendance" + `?employeeId=${employeeId || ""}&month=${month || ""}`
    ),
};
