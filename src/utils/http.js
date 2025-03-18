import { message } from 'antd';
import axios from 'axios';
import { config as conf } from './config';

// Add a request interceptor
axios.interceptors.request.use(
  function (config) {
    // Do something before request is sent
    if (/\/auth\/login/.test(config.url)) {
      // 登录
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    } else if (
      /\/exportData/.test(config.url) ||
      /\/importData/.test(config.url) ||
      /\/fileCSV/.test(config.url)
    ) {
      if (localStorage.getItem(conf.AUTH_TOKEN)) {
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem(conf.AUTH_TOKEN);
      }
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
    } else {
      if (localStorage.getItem(conf.AUTH_TOKEN)) {
        config.headers['Authorization'] = 'Bearer ' + localStorage.getItem(conf.AUTH_TOKEN);
      }
      config.headers['Content-Type'] = 'application/json;charset=UTF-8';
    }
    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  },
);

function get(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .get(url, {
        params,
      })
      .then((res) => {
        action(res, resolve, reject);
      })
      .catch((err) => {
        // reject(err)
        action(err, resolve, reject);
      });
  });
}

function post(url, data) {
  return request(url, data, 'post');
}

function put(url, data) {
  return request(url, data, 'put');
}

function del(url, params) {
  return new Promise((resolve, reject) => {
    axios
      .delete(url, {
        params,
      })
      .then((res) => {
        action(res, resolve, reject);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

function request(url, data, method) {
  return new Promise((resolve, reject) => {
    axios({
      method,
      url,
      data,
    })
      .then((res) => {
        action(res, resolve, reject, url);
      })
      .catch((err) => {
        // reject(err)
        action(err?.response, resolve, reject, url);
      });
  });
}

function action(res, resolve, reject, url) {
  // todo 各种状态码逻辑待完善
  const data = res?.data;
  if (
    res?.status === 200 &&
    (/\/downloadTemplate/.test(url) ||
      /\/loadTemplate/.test(url) ||
      /\/exportData/.test(url) ||
      /\/export/.test(url) ||
      /\/importData/.test(url))
  ) {
    resolve(data);
  } else if (data?.respCode === '200') {
    resolve(data);
  } else if (res?.status === 200 && /\/fileCSV/.test(url)) {
    resolve(data);
  } else {
    if (data?.respCode === '100040') {
      localStorage.removeItem(conf.AUTH_TOKEN);
    }
    if (data?.respCode === '171000') {
    } else {
      message.error(data?.respMsg || '未知错误');
    }
    reject(data);
  }
}

export default {
  post,
  get,
  put,
  del,
};
