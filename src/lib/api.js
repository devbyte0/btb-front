const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1";

const parseResponse = async (response) => {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.message || "Request failed";
    throw new Error(message);
  }
  return payload;
};

export const apiRequest = async (path, options = {}, token) => {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  return parseResponse(response);
};

export const authApi = {
  login: (username, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),
  me: (token) => apiRequest("/auth/me", {}, token),
  register: (token, payload) =>
    apiRequest(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  registerStudent: (payload) =>
    apiRequest("/auth/register-student", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export const dashboardApi = {
  listCourses: (token) => apiRequest("/courses", {}, token),
  getCourse: (token, courseId) => apiRequest(`/courses/${courseId}`, {}, token),
  listUsers: (token) => apiRequest("/users", {}, token),
  getUser: (token, userId) => apiRequest(`/users/${userId}`, {}, token),
  listEnrollments: (token) => apiRequest("/enrollments", {}, token),
  listAttendance: (token) => apiRequest("/attendance", {}, token),
  listPromos: (token) => apiRequest("/promos", {}, token),
  createStudent: (token, payload) =>
    apiRequest(
      "/users/students",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  createPromo: (token, payload) =>
    apiRequest(
      "/promos",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  enroll: (token, payload) =>
    apiRequest(
      "/enrollments",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  markAttendance: (token, payload) =>
    apiRequest(
      "/attendance",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  updateAttendance: (token, attendanceId, payload) =>
    apiRequest(
      `/attendance/${attendanceId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    ),
  deleteAttendance: (token, attendanceId) =>
    apiRequest(
      `/attendance/${attendanceId}`,
      {
        method: "DELETE",
      },
      token
    ),
  createTrainer: (token, payload) =>
    authApi.register(token, {
      ...payload,
      role: "trainer",
    }),
  createPayment: (token, payload) =>
    apiRequest("/payments", { method: "POST", body: JSON.stringify(payload) }, token),
  createEnrollment: (token, payload) =>
    apiRequest(
      "/enrollments",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  updateEnrollment: (token, enrollmentId, payload) =>
    apiRequest(
      `/enrollments/${enrollmentId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    ),
  deleteEnrollment: (token, enrollmentId) =>
    apiRequest(
      `/enrollments/${enrollmentId}`,
      {
        method: "DELETE",
      },
      token
    ),
  createCourse: (token, payload) =>
    apiRequest(
      "/courses",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  updateCourse: (token, courseId, payload) =>
    apiRequest(
      `/courses/${courseId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    ),
  deleteCourse: (token, courseId) =>
    apiRequest(
      `/courses/${courseId}`,
      {
        method: "DELETE",
      },
      token
    ),
  listBatches: (token) => apiRequest("/batches", {}, token),
  getBatch: (token, batchId) => apiRequest(`/batches/${batchId}`, {}, token),
  createBatch: (token, payload) =>
    apiRequest(
      "/batches",
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
      token
    ),
  assignBatchStudents: (token, batchId, studentIds) =>
    apiRequest(
      `/batches/${batchId}/students`,
      {
        method: "PATCH",
        body: JSON.stringify({ studentIds }),
      },
      token
    ),
  assignBatchTrainers: (token, batchId, trainerIds) =>
    apiRequest(
      `/batches/${batchId}/trainers`,
      {
        method: "PATCH",
        body: JSON.stringify({ trainerIds }),
      },
      token
    ),
  updateBatch: (token, batchId, payload) =>
    apiRequest(
      `/batches/${batchId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    ),
  deleteBatch: (token, batchId) =>
    apiRequest(
      `/batches/${batchId}`,
      {
        method: "DELETE",
      },
      token
    ),
  updatePromo: (token, promoId, payload) =>
    apiRequest(
      `/promos/${promoId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    ),
  deletePromo: (token, promoId) =>
    apiRequest(
      `/promos/${promoId}`,
      {
        method: "DELETE",
      },
      token
    ),
  updateUser: (token, userId, payload) =>
    apiRequest(
      `/users/${userId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
      token
    ),
  deleteUser: (token, userId) =>
    apiRequest(`/users/${userId}`, { method: "DELETE" }, token),
  deleteStudentFull: (token, studentId) =>
    apiRequest(`/users/students/${studentId}`, { method: "DELETE" }, token),
};

export const aboutUsApi = {
  get: () => apiRequest("/about-us"),
  update: (token, payload) =>
    apiRequest("/about-us", { method: "PATCH", body: JSON.stringify(payload) }, token),
  addMedia: (token, payload) =>
    apiRequest("/about-us/media", { method: "POST", body: JSON.stringify(payload) }, token),
  updateMedia: (token, mediaId, payload) =>
    apiRequest(`/about-us/media/${mediaId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  removeMedia: (token, mediaId) =>
    apiRequest(`/about-us/media/${mediaId}`, { method: "DELETE" }, token),
  reorderMedia: (token, mediaIds) =>
    apiRequest("/about-us/media/reorder", { method: "PATCH", body: JSON.stringify({ mediaIds }) }, token),
  addVideo: (token, payload) =>
    apiRequest("/about-us/video", { method: "POST", body: JSON.stringify(payload) }, token),
  updateVideo: (token, videoId, payload) =>
    apiRequest(`/about-us/video/${videoId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  removeVideo: (token, videoId) =>
    apiRequest(`/about-us/video/${videoId}`, { method: "DELETE" }, token),
};

export const carouselApi = {
  list: () => apiRequest("/carousels"),
  listAll: (token) => apiRequest("/carousels/all", {}, token),
  create: (token, payload) =>
    apiRequest("/carousels", { method: "POST", body: JSON.stringify(payload) }, token),
  update: (token, carouselId, payload) =>
    apiRequest(`/carousels/${carouselId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  delete: (token, carouselId) =>
    apiRequest(`/carousels/${carouselId}`, { method: "DELETE" }, token),
};

export const announcementApi = {
  list: (token) => apiRequest("/announcements", {}, token),
  create: (token, payload) =>
    apiRequest("/announcements", { method: "POST", body: JSON.stringify(payload) }, token),
  update: (token, announcementId, payload) =>
    apiRequest(`/announcements/${announcementId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  delete: (token, announcementId) =>
    apiRequest(`/announcements/${announcementId}`, { method: "DELETE" }, token),
};

export const contactApi = {
  submit: (payload) =>
    apiRequest("/contacts", { method: "POST", body: JSON.stringify(payload) }),
  list: (token) => apiRequest("/contacts", {}, token),
  markReplied: (token, inquiryId, payload) =>
    apiRequest(`/contacts/${inquiryId}/reply`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  delete: (token, inquiryId) =>
    apiRequest(`/contacts/${inquiryId}`, { method: "DELETE" }, token),
};

export const notificationApi = {
  list: (token) => apiRequest("/notifications", {}, token),
  unreadCount: (token) => apiRequest("/notifications/unread-count", {}, token),
  markAsRead: (token, notificationIds) =>
    apiRequest("/notifications/mark-read", { method: "PATCH", body: JSON.stringify({ notificationIds }) }, token),
  markAllAsRead: (token) =>
    apiRequest("/notifications/mark-all-read", { method: "PATCH" }, token),
};

export const uploadApi = {
  upload: (token, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api/v1"}/uploads`, {
      method: "POST", headers: { Authorization: `Bearer ${token}` }, body: formData,
    }).then((r) => r.json());
  },
};

export const userApi = {
  updateProfile: (token, payload) =>
    apiRequest("/users/profile/update", { method: "PATCH", body: JSON.stringify(payload) }, token),
};

export const batchApi = {
  list: (token) => apiRequest("/batches", {}, token),
};

export const popupApi = {
  getActive: () => apiRequest("/popups/active"),
  list: (token) => apiRequest("/popups", {}, token),
  create: (token, payload) =>
    apiRequest("/popups", { method: "POST", body: JSON.stringify(payload) }, token),
  update: (token, popupId, payload) =>
    apiRequest(`/popups/${popupId}`, { method: "PATCH", body: JSON.stringify(payload) }, token),
  delete: (token, popupId) =>
    apiRequest(`/popups/${popupId}`, { method: "DELETE" }, token),
};
