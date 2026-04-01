// src/services/api.js
// Mock implementation — replace BASE_URL and remove mock data when backend is ready

const BASE_URL = 'http://localhost:3000/api';

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

// ── Mock Data ──────────────────────────────────────────────────────────────────
let mockUsers = [
  { id: 'usr_001', firstName: 'Ali', lastName: 'Khan', email: 'ali.khan@gmail.com', mobile: '03001234567', city: 'Karachi', status: 'PENDING', createdAt: '2026-02-20T08:30:00Z' },
  { id: 'usr_002', firstName: 'Sara', lastName: 'Ahmed', email: 'sara.ahmed@yahoo.com', mobile: '03111234567', city: 'Lahore', status: 'PENDING', createdAt: '2026-02-21T10:15:00Z' },
  { id: 'usr_003', firstName: 'Hassan', lastName: 'Raza', email: 'hassan.raza@outlook.com', mobile: '03211234567', city: 'Islamabad', status: 'ACTIVE', createdAt: '2026-02-18T14:20:00Z' },
  { id: 'usr_004', firstName: 'Fatima', lastName: 'Malik', email: 'fatima.malik@gmail.com', mobile: '03451234567', city: 'Peshawar', status: 'ACTIVE', createdAt: '2026-02-17T09:00:00Z' },
  { id: 'usr_005', firstName: 'Usman', lastName: 'Sheikh', email: 'usman.sheikh@gmail.com', mobile: '03061234567', city: 'Faisalabad', status: 'REJECTED', createdAt: '2026-02-15T11:45:00Z' },
  { id: 'usr_006', firstName: 'Aisha', lastName: 'Butt', email: 'aisha.butt@hotmail.com', mobile: '03331234567', city: 'Multan', status: 'PENDING', createdAt: '2026-02-22T07:10:00Z' },
  { id: 'usr_007', firstName: 'Bilal', lastName: 'Siddiqui', email: 'bilal.sid@gmail.com', mobile: '03131234567', city: 'Karachi', status: 'ACTIVE', createdAt: '2026-02-16T16:30:00Z' },
  { id: 'usr_008', firstName: 'Zara', lastName: 'Qureshi', email: 'zara.qureshi@gmail.com', mobile: '03551234567', city: 'Lahore', status: 'PENDING', createdAt: '2026-02-23T13:00:00Z' },
  { id: 'usr_009', firstName: 'Kamran', lastName: 'Mirza', email: 'kamran.mirza@yahoo.com', mobile: '03021234567', city: 'Rawalpindi', status: 'REJECTED', createdAt: '2026-02-14T08:00:00Z' },
  { id: 'usr_010', firstName: 'Nadia', lastName: 'Hussain', email: 'nadia.hussain@gmail.com', mobile: '03411234567', city: 'Sialkot', status: 'ACTIVE', createdAt: '2026-02-19T12:00:00Z' },
];

// ── API Functions ──────────────────────────────────────────────────────────────

export const listUsers = async (status) => {
  await delay(600);
  // MOCK: filter by status if provided
  const filtered = status ? mockUsers.filter((u) => u.status === status) : mockUsers;
  return [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  /* REAL API — uncomment when backend is ready:
  const url = new URL(`${BASE_URL}/admin/users`);
  if (status) url.searchParams.set('status', status);
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
  */
};

export const updateUserStatus = async (userId, status) => {
  await delay(500);
  // MOCK: update in local array
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');
  user.status = status;
  return { message: 'User status updated successfully', userId, status };

  /* REAL API — uncomment when backend is ready:
  const res = await fetch(`${BASE_URL}/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Failed to update user status');
  return res.json();
  */
};

export const getUserById = async (userId) => {
  await delay(400);
  const user = mockUsers.find((u) => u.id === userId);
  if (!user) throw new Error('User not found');
  return user;

  /* REAL API:
  const res = await fetch(`${BASE_URL}/admin/users/${userId}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  });
  if (!res.ok) throw new Error('User not found');
  return res.json();
  */
};
