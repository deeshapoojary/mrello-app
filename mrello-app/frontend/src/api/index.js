// frontend/src/api/index.js
import axios from 'axios';

// Create an Axios instance
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL, // Use CRA environment variable syntax
  });

// Add a request interceptor to include the token in headers
api.interceptors.request.use(
    (config) => {
      const userString = localStorage.getItem('user');
      if (userString) {
          try {
              const user = JSON.parse(userString);
              if (user && user.token) {
                 config.headers['Authorization'] = `Bearer ${user.token}`;
              }
          } catch (e) {
              console.error("Error parsing user from localStorage", e);
              // localStorage.removeItem('user'); // Optionally clear
          }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  // Add a response interceptor for handling common errors (like 401 Unauthorized)
  api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.error("Unauthorized access - 401");
          localStorage.removeItem('user');
          // Avoid infinite loops if login page causes 401
          if (!window.location.pathname.includes('/login')) {
             // Consider redirect using react-router's navigation tools
             // window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );  

// --- API Function Examples ---

// Auth
export const register = (userData) => api.post('/users/register', userData);
export const login = (userData) => api.post('/users/login', userData);
export const getMe = () => api.get('/users/me');

// Boards
export const fetchBoards = () => api.get('/boards');
export const fetchBoardById = (boardId) => api.get(`/boards/${boardId}`);
export const createBoard = (boardData) => api.post('/boards', boardData);
export const updateBoard = (boardId, boardData) => api.put(`/boards/${boardId}`, boardData);
export const deleteBoard = (boardId) => api.delete(`/boards/${boardId}`);
export const connectGithubRepo = (boardId, repoData) => api.post(`/boards/${boardId}/connect-repo`, repoData);

// Lists
export const createList = (boardId, listData) => api.post(`/boards/${boardId}/lists`, listData);
export const updateList = (listId, listData) => api.put(`/lists/${listId}`, listData);
export const deleteList = (listId) => api.delete(`/lists/${listId}`);

// Tasks
export const createTask = (listId, taskData) => api.post(`/lists/${listId}/tasks`, taskData);
export const updateTask = (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData);
export const moveTask = (taskId, moveData) => api.put(`/tasks/${taskId}/move`, moveData);
export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

export default api; // Export the configured instance