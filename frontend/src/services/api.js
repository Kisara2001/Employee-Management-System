
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export const getToken = () => localStorage.getItem('token');
export const setToken = (t) => localStorage.setItem('token', t);

async function request(path, options={}){
  const headers = options.headers || {};
  if (!headers['Content-Type'] && !(options.body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers['Authorization'] = 'Bearer ' + token;
  const res = await fetch(API_BASE + path, { ...options, headers, body: headers['Content-Type']==='application/json' && options.body ? JSON.stringify(options.body) : options.body });
  if (!res.ok) {
    const msg = (await res.json().catch(()=>({message:res.statusText}))).message;
    throw new Error(msg || 'Request failed');
  }
  return res.json();
}

export const api = {
  login: (email,password)=> request('/api/auth/login', { method:'POST', body:{email,password} }),

  listEmployees: (q='')=> request('/api/employees' + (q?`?q=${encodeURIComponent(q)}`:'')),
  createEmployee: (payload)=> request('/api/employees', { method:'POST', body: payload }),
  updateEmployee: (id, payload)=> request(`/api/employees/${id}`, { method:'PATCH', body: payload }),
  deleteEmployee: (id)=> request(`/api/employees/${id}`, { method:'DELETE' }),

  listDepartments: ()=> request('/api/departments'),
  createDepartment: (payload)=> request('/api/departments', { method:'POST', body: payload }),
  updateDepartment: (id, payload)=> request(`/api/departments/${id}`, { method:'PATCH', body: payload }),
  deleteDepartment: (id)=> request(`/api/departments/${id}`, { method:'DELETE' }),

  checkIn: (employeeId)=> request('/api/attendance/check-in', { method:'POST', body:{ employeeId } }),
  checkOut: (employeeId)=> request('/api/attendance/check-out', { method:'POST', body:{ employeeId } }),
  listAttendance: (employeeId, month)=> request('/api/attendance' + `?employeeId=${employeeId||''}&month=${month||''}`),
}
