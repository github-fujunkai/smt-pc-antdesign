import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Form, Input, Modal, Typography } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api'
import { FormattedMessage, useIntl } from '@umijs/max';;
import { config } from '../utils/config';
import http from '../utils/http';
const { Title, Link } = Typography;
// import logo from '../assets/images/logo.png';
import { useModel } from '@umijs/max';
import { flushSync } from 'react-dom';

const Login = () => {
  const { initialState, setInitialState } = useModel('@@initialState');
  const [formApi] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const showModal = () => {
    formApi.resetFields();
    if (localStorage.getItem('apiUrl')) {
      formApi.setFieldsValue({
        apiUrl: localStorage.getItem('apiUrl'),
      });
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    formApi
      .validateFields()
      .then((values) => {
        console.log('values', values);
        const { apiUrl } = values;
        localStorage.setItem('apiUrl', apiUrl);
        setIsModalOpen(false);
        window.location.reload();
      })
      .catch((error) => {
        console.log('Form validation error:', error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const fetchUserInfo = async () => {
    const userInfo = await initialState?.fetchUserInfo?.();
    if (userInfo) {
      flushSync(() => {
        setInitialState((s) => ({
          ...s,
          currentUser: userInfo,
        }));
      });
    }
  };
  const navigate = useNavigate();
  const onFinish = async (values) => {
    console.log('Form submitted:', values);
    const { username, password } = values;
    setLoading(true);
    http
      .post(config.API_PREFIX + api.authLogin + `?username=${username}&password=${password}&scope=MANAGER`, {
        
      })
      .then(async (res) => {
        const data = res?.bizData;
        localStorage.setItem(config.AUTH_TOKEN, data.accessToken);
        localStorage.setItem('username', data.username);
        setLoading(false);
        // navigate('/');
        await fetchUserInfo();
        // const urlParams = new URL(window.location.href).searchParams;
        // navigate(urlParams.get('redirect') || '/');
        navigate('/ierror/TraceSafe');
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const [loading, setLoading] = useState(false);

  const brand = localStorage.getItem('brand');
  let logo = null;
  try {
    logo = require(`../assets/images/${brand}.png`);
  } catch (e) {
    // logo = require(`../assets/images/logo.png`); // 默认logo
  }

  return (
    <div
      className="bg-login"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
      }}
    >
      <div style={{ minWidth: 328, maxWidth: 500 }}>
        <Title level={3} style={{ color: 'white' }}>
          欢迎登录智慧 IOT 平台
        </Title>
        {logo ? <img className="logo" src={logo} /> : null}
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" size="large" prefix={<UserOutlined />} allowClear />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" size="large" prefix={<LockOutlined />} allowClear />
          </Form.Item>
          <Form.Item>
            <Button
              loading={loading}
              type="primary"
              htmlType="submit"
              size="large"
              style={{ width: '100%' }}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
        <div style={{ textAlign: 'right' }}>
          <Link
            href="https://www.google.cn/intl/zh-CN/chrome/"
            style={{ color: 'white' }}
            target="_self"
          >
            下载 Chrome 浏览器
          </Link>
          <Button type="link" onClick={showModal} style={{ color: 'white' }}>
            设置连接
          </Button>
        </div>
      </div>
      <Modal title="设置连接" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form labelCol={{ span: 5 }} style={{ padding: 32 }} form={formApi}>
          <Form.Item label="API 地址" name="apiUrl" rules={[{ required: true, message: '请输入' }]}>
            <Input placeholder="请输入" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
