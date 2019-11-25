import '@babel/polyfill';
import axios from 'axios'
import { setup } from 'axios-cache-adapter'

const BASE_URL = 'http://fake-hotel-api.herokuapp.com/api';

const api = setup({
  baseURL: 'http://fake-hotel-api.herokuapp.com/api',
  cache: {
    // Cache expiration in milliseconds, here 15min
    maxAge: 15 * 60 * 1000,
    exclude: {
        query: false
    }
  }
})

export const getHotels = async (params) => {
  try {
    const { data } = await api.get(`/hotels`, { params });
    return data;
  } catch (err) {
    console.error(err.message);
  }
};

export const getReviews = async (params) => {
  try {
    const { data } = await api.get(`/reviews`, { params });
    return data;
  } catch (err) {
    console.error(err.message);
  }
};