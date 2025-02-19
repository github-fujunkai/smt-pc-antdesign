let params = {
  // 生产环境 API
  // API_PREFIX: 'https://82tc385147.goho.co/iot-manager/',
  API_PREFIX: localStorage.getItem('apiUrl'),
  ENV: 'production',
}
const domain = window.location.origin
if (/localhost/i.test(domain) || /127.0.0.1/i.test(domain)) {
  // 本地 or 测试环境 API
  // params.API_PREFIX = 'http://127.0.0.1:8088/iot-manager/';
  // params.API_PREFIX = 'https://82tc385147.goho.co/iot-manager/'
  params.API_PREFIX = localStorage.getItem('apiUrl');
  params.ENV = 'test'
}

const config = {
  AUTH_TOKEN: 'Authorization',
  ...params,
}
export { config }