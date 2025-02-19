import React, { useState, useMemo, useEffect } from "react";
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import {
  Typography,
  Checkbox,
  Radio,
  Upload,
  Table,
  Modal,
  Breadcrumb,
  Form,
  Row,
  Col,
  Select,
  Input,
  Space,
  Button,
  message,
} from "antd";
import {
  ExclamationCircleFilled,
  SearchOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAntdResizableHeader } from "@minko-fe/use-antd-resizable-header";
import "@minko-fe/use-antd-resizable-header/index.css";
import http from "../utils/http";
import { config } from "../utils/config";
import api from "../utils/api";
import qs from "qs";

const { confirm } = Modal;
let activeId = -1;
const del = (record) => {
  confirm({
    title: "删除确认",
    icon: <ExclamationCircleFilled />,
    content:
      "当前账户未解除所有权限，无法删除！账户删除后无法恢复，请确认是否删除！",
    onOk() {
      console.log("OK");
    },
    onCancel() {
      console.log("Cancel");
    },
  });
};

const App = () => {
  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: "员工ID",
      dataIndex: "userId",
      key: "userId",
      width: 100,
    },
    {
      title: "用户名",
      dataIndex: "username",
      key: "username",
      width: 100,
    },
    {
      title: "员工姓名",
      dataIndex: "nickname",
      key: "nickname",
      width: 100,
    },
    {
      title: "手机号",
      dataIndex: "phone",
      key: "phone",
      width: 100,
    },
    {
      title: "邮箱地址",
      dataIndex: "mail",
      key: "mail",
      width: 100,
    },
    {
      title: "微信号",
      dataIndex: "wechatNum",
      key: "wechatNum",
      width: 100,
    },
    {
      title: "用户角色",
      dataIndex: "role",
      key: "role",
      width: 100,
      render: (_, record) => {
        return _.map((item) => item.roleName).join("，");
      },
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => showModal("update", record)}>
              修改
            </Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
          </Space>
        );
      },
    },
  ];

  const { components, resizableColumns, tableWidth, resetColumns } =
    useAntdResizableHeader({
      columns: useMemo(() => columns, []),
      columnsState: {
        persistenceKey: "localKeyAppUser",
        persistenceType: "localStorage",
      },
    });

  const [dictBaseFwa, setDictBaseFwa] = useState({});
  const getDictBaseFwa = () => {
    http
      .post(config.API_PREFIX + api.dictBaseFwa, {})
      .then((res) => {
        console.log("dict", res);
        setDictBaseFwa(res?.bizData);
      })
      .catch((err) => {});
  };

  const [dictBaseAll, setDictBaseAll] = useState({});
  const getDictBaseAll = () => {
    http
      .post(config.API_PREFIX + api.dictBaseAll, {})
      .then((res) => {
        console.log("dict", res);
        setDictBaseAll(res?.bizData);
      })
      .catch((err) => {});
  };

  const [value, setValue] = useState(2);
  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    if (action === "update" && record) {
      const {
        userId,
        factoryId,
        workshopId,
        areaId,
        role,
        username,
        utype,
        nickname,
        phone,
        mail,
        wechatNum,
        password,
      } = record;
      activeId = record?.userId;
      formCreate.setFieldsValue({
        userId,
        factoryId: factoryId.toString(),
        workshopId: workshopId.toString(),
        areaId: areaId.toString(),
        role: role.map((item) => item.roleId),
        username,
        utype:utype.split(','),
        nickname,
        phone,
        mail,
        wechatNum,
        password,
      });
    } else {
      activeId = -1;
      formCreate.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log("values", values);

        setLoadingOk(true);
        const {
          factoryId,
          workshopId,
          areaId,
          role,
          username,
          utype,
          nickname,
          phone,
          mail,
          wechatNum,
          password,
        } = values;
        let params = {
          factoryId,
          workshopId,
          areaId,
          role,
          username,
          utype:utype.join(','),
          nickname,
          phone,
          mail,
          wechatNum,
        };
        let action = null;
        let msg = "";
        if (activeId !== -1) {
          params.userId = activeId;
          if (password?.length < 20) {
            params.password = password;
          }
          action = http.put;
          msg = "修改成功！";
        } else {
          params.password = password;
          action = http.post;
          msg = "新增成功！";
        }
        action(config.API_PREFIX + api.authUser, params)
          .then((res) => {
            formCreate.resetFields();
            setLoadingOk(false);
            setIsModalOpen(false);
            fetchData();
            message.success(msg);
          })
          .catch((err) => {
            setLoadingOk(false);
            console.log(err);
          });
      })
      .catch((error) => {
        console.log("Form validation error:", error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  // const { confirm } = Modal;

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showTotal,
      showSizeChanger: true,
    },
  };

  const [tableParams, setTableParams] = useState(paginationInit);

  const [isModalOpen1, setIsModalOpen1] = useState(false);

  const showModal1 = () => {
    setIsModalOpen1(true);
  };
  const handleOk1 = () => {
    setIsModalOpen1(false);
  };

  const handleCancel1 = () => {
    setIsModalOpen1(false);
  };

  const [roleList, setRoleList] = useState([]);
  useEffect(() => {
    fetchData();
    http
      .post(config.API_PREFIX + api.authRoleList, {})
      .then((res) => {
        setRoleList(res?.bizData || []);
      })
      .catch((err) => {
        console.log(err);
      });

    getDictBaseFwa();
    getDictBaseAll();
  }, []);

  const fetchData = () => {
    setLoading(true);
    const {
      pagination: { current, pageSize },
    } = tableParams;

    let params = {
      current,
      size: pageSize,
    };

    http
      .post(
        config.API_PREFIX + api.authUserPage + `?${qs.stringify(params)}`,
        {}
      )
      .then((res) => {
        const data = res?.bizData;
        setData(data?.records || []);
        setLoading(false);
        console.log("fetchData pagination", tableParams);
        setTableParams({
          ...tableParams,
          pagination: {
            ...tableParams.pagination,
            total: data?.total,
            showTotal,
          },
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleTableChange = (pagination, filters, sorter) => {
    console.log("handleTableChange pagination: ", pagination);
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "基础设置",
          },
          {
            title: "用户管理",
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        {/* <div className="search-wrapper">
          <Form>
            <Row gutter="24">
              <Col span={7}>
                <Form.Item label="用户角色">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={[{
                      value: '1',
                      label: '选择1'
                    }, {
                      value: '2',
                      label: '选择2'
                    }, {
                      value: '3',
                      label: '选择3'
                    }]}
                  />
                </Form.Item>
              </Col>

              <Col span={7}>
                <Form.Item label="员工编号">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>

              <Col span={7}>
                <Form.Item label="用户名">
                  <Input placeholder="请输入" />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Space size="small">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div> */}
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal("create");
              }}
            >
              新增用户
            </Button>
          </div>
          <Table
            columns={resizableColumns}
            rowKey={(record) => record.userId}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            components={components}
            scroll={{ x: tableWidth }}
            bordered
          />
        </div>
      </div>
      <Modal
        title="新增/修改用户"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loadingOk}
      >
        <Form
          labelCol={{ span: 5 }}
          style={{ padding: 16 }}
          form={formCreate}
          style={{ padding: 15, maxHeight: "60vh", overflow: "scroll" }}
        >
          <Form.Item label="厂区" name="factoryId">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              options={[
                {
                  value: -1,
                  label: "全部",
                },
                ...(dictBaseFwa?.factory?.map((item) => ({
                  value: item.dictKey,
                  label: item.dictValue,
                })) || []),
              ]}
            />
          </Form.Item>
          <Form.Item label="车间" name="workshopId">
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              options={[
                {
                  value: -1,
                  label: "全部",
                },
                ...(dictBaseFwa?.workshop?.map((item) => ({
                  value: item.dictKey,
                  label: item.dictValue,
                })) || []),
              ]}
            />
          </Form.Item>
          <Form.Item
            label="产线"
            name="areaId"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Select
              placeholder="请选择"
              allowClear
              showSearch
              options={[
                {
                  value: -1,
                  label: "全部",
                },
                ...(dictBaseFwa?.area?.map((item) => ({
                  value: item.dictKey,
                  label: item.dictValue,
                })) || []),
              ]}
            />
          </Form.Item>
          <Form.Item
            label="用户角色"
            name="role"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Select
              placeholder="请选择"
              allowClear
              mode="multiple"
              options={roleList?.map((item) => ({
                value: item.roleId,
                label: item.roleName,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="账号"
            name="username"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="密码"
            name="password"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="账号类型"
            name="utype"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Select
              placeholder="请选择"
              allowClear
              mode="multiple"
              options={[
                {
                  value: "ALL",
                  label: "全部",
                },
                {
                  value: "MANAGER",
                  label: "后台",
                },
                {
                  value: "PDA",
                  label: "PDA",
                },
                {
                  value: "DIP",
                  label: "DIP",
                },
              ]}
            />
          </Form.Item>

          <Form.Item label="员工姓名" name="nickname">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item label="手机号" name="phone">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item label="邮箱地址" name="mail">
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item label="微信号" name="wechatNum">
            <Input placeholder="请输入" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;
