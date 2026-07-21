import axiosClient from './axiosClient';

export const contactService = {
  send: (payload) => axiosClient.post('/contact', payload).then((response) => response.data),
};
