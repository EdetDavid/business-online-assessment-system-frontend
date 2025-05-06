import axios from "axios";

const api = axios.create({
  // baseURL: "http://localhost:8000/api/",
  baseURL: "https://business-assessment-system-backend.onrender.com/api/",
  withCredentials: true, // For CSRF token handling
});

// Function to get CSRF token from cookie
function getCsrfToken() {
  const name = 'csrftoken';
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

// Add auth token and CSRF token to requests
api.interceptors.request.use(
  (config) => {
    // Add Authorization header if user is logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error("Error parsing user data from localStorage:", e);
      }
    }
    
    // Add CSRF token header for non-GET methods
    if (config.method !== 'get') {
      const csrfToken = getCsrfToken();
      if (csrfToken) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is due to an expired token and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const user = JSON.parse(userStr);
          if (user && user.refreshToken) {
            const refreshRes = await axios.post(
              `${api.defaults.baseURL}auth/token/refresh/`, 
              { refresh: user.refreshToken }
            );

            // Update user data in localStorage with new tokens
            const updatedUser = {
              ...user,
              token: refreshRes.data.access,
              refreshToken: refreshRes.data.refresh,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            // Update the Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${refreshRes.data.access}`;
            originalRequest.headers['Authorization'] = `Bearer ${refreshRes.data.access}`;

            // Retry the original request
            return api(originalRequest);
          }
        }
      } catch (refreshError) {
        // Handle refresh token failure - redirect to login
        console.error("Token refresh failed:", refreshError);
        localStorage.removeItem("user");
        window.location = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// For initial CSRF token setup
export const fetchCsrfToken = async () => {
  try {
    // Make a GET request to an endpoint that sets the CSRF cookie
    await api.get("auth/csrf/");
    console.log("CSRF token fetched successfully");
  } catch (error) {
    console.error("Failed to fetch CSRF token:", error);
  }
};

// Auth
export const login = (credentials) => {
  const { email, password } = credentials;
  return api.post("auth/token/", { username: email, password });
};

export const register = (userData) => api.post("auth/register/", userData);

export const refreshToken = (token) =>
  api.post("auth/token/refresh/", { refresh: token });

export const forgotPassword = (email) =>
  api.post("auth/password-reset/", { email });

export const resetPassword = (token, password) =>
  api.post("auth/password-reset/confirm/", { token, password });

// User Profile
export const getUserProfile = () => api.get("auth/profile/");

export const updateUserProfile = (data) => api.patch("auth/profile/", data);

export const changePassword = (data) => api.post("auth/password-change/", data);

// Assessments
export const getAssessments = () => api.get("assessments/");

export const getAssessment = (id) => api.get(`assessments/${id}/`);

export const getAssessmentStats = (id) => api.get(`assessments/${id}/stats/`);

// Admin Assessments
export const getAdminAssessments = () => {
  console.log("Fetching admin assessments");
  return api.get("admin/assessments/");
};

export const createAssessment = (data) => {
  console.log("Creating assessment with data:", data);
  return api.post("admin/assessments/", data);
};

export const updateAssessment = (id, data) => {
  console.log(`Updating assessment ${id} with data:`, data);
  return api.put(`admin/assessments/${id}/`, data);
};

export const deleteAssessment = (id) => {
  console.log(`Deleting assessment ${id}`);
  return api.delete(`admin/assessments/${id}/`);
};

// Questions and Choices
export const getQuestions = (assessmentId) =>
  api.get(`admin/assessments/${assessmentId}/questions/`);

export const createQuestion = (assessmentId, data) =>
  api.post(`admin/assessments/${assessmentId}/questions/`, data);

export const updateQuestion = (id, data) =>
  api.put(`admin/questions/${id}/`, data);

export const deleteQuestion = (id) => api.delete(`admin/questions/${id}/`);

export const createChoice = (questionId, data) =>
  api.post(`admin/questions/${questionId}/choices/`, data);

export const updateChoice = (id, data) => api.put(`admin/choices/${id}/`, data);

export const deleteChoice = (id) => api.delete(`admin/choices/${id}/`);

// Responses
export const submitResponse = (data) => api.post("responses/", data);

export const getResponses = (assessmentId) => {
  const url = assessmentId
    ? `responses/list/?assessment_id=${assessmentId}`
    : "responses/list/";
  return api.get(url);
};

export const getResponse = (id) => api.get(`responses/${id}/`);

// Partial responses
export const savePartialResponse = (data) =>
  api.post("partial-responses/", data);

export const updatePartialResponse = (id, data) =>
  api.put(`partial-responses/${id}/`, data);

export const getPartialResponse = (assessmentId, email) =>
  api.get(
    `partial-responses/?assessment=${assessmentId}&respondent_email=${email}`
  );

export const deletePartialResponse = (id) =>
  api.delete(`partial-responses/${id}/`);

// User Management
export const getUsers = (searchQuery = "") => {
  const url = searchQuery
    ? `admin/users/?search=${encodeURIComponent(searchQuery)}`
    : "admin/users/";
  return api.get(url);
};

export const getUserDetails = (userId) => api.get(`admin/users/${userId}/`);

export const updateUser = (userId, data) =>
  api.patch(`admin/users/${userId}/`, data);

export const deleteUser = (userId) => api.delete(`admin/users/${userId}/`);

export const bulkUpdateUserRoles = (userIds, isAdmin) =>
  api.post("admin/users/bulk-update/", {
    user_ids: userIds,
    is_admin: isAdmin,
  });

export default api;
