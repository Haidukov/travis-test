import axios from 'axios';
import { FETCH_USER, FETCH_BLOGS, FETCH_BLOG } from './types';

const axiosApi = axios.create({ baseURL: 'http://localhost:5001' });

axiosApi.defaults.withCredentials = true;

export const fetchUser = () => async dispatch => {
  try {
    const res = await axiosApi.get('/api/current_user');
    dispatch({ type: FETCH_USER, payload: res.data });
  } catch(e) {
    dispatch({ type: FETCH_USER, payload: e.response.data });
  }
};

export const handleToken = token => async dispatch => {
  const res = await axiosApi.post('/api/stripe', token);

  dispatch({ type: FETCH_USER, payload: res.data });
};

export const submitBlog = (values, history) => async dispatch => {
  const res = await axiosApi.post('/api/blogs', values);

  history.push('/blogs');
  dispatch({ type: FETCH_BLOG, payload: res.data });
};

export const fetchBlogs = () => async dispatch => {
  const res = await axiosApi.get('/api/blogs');

  dispatch({ type: FETCH_BLOGS, payload: res.data });
};

export const fetchBlog = id => async dispatch => {
  const res = await axiosApi.get(`/api/blogs/${id}`);

  dispatch({ type: FETCH_BLOG, payload: res.data });
};
