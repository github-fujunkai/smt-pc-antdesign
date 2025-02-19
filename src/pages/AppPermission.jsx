import React, { useState, useMemo, useEffect } from "react";
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import {
  Typography,
  Checkbox,
  Radio,
  TreeSelect,
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
  InputNumber,
  message,
} from "antd";
import {
  ExclamationCircleFilled,
  LinkOutlined,
  PlusOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import { useAntdResizableHeader } from "@minko-fe/use-antd-resizable-header";
import "@minko-fe/use-antd-resizable-header/index.css";
import http from "../utils/http";
import { config } from "../utils/config";
import api from "../utils/api";

const { confirm } = Modal;
let activeId = -1;

const App = () => {
  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [type, setType] = useState("0");
  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setType(e.target.value);
  };

  const del = (record) => {
    confirm({
      title: "删除确认",
      icon: <ExclamationCircleFilled />,
      content: "删除后无法恢复，请确认是否删除！",
      onOk() {
        console.log("OK");
        http
          .del(config.API_PREFIX + api.authMenu + `/${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success("删除成功！");
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const columns = [
    {
      title: "菜单名称",
      dataIndex: "name",
      key: "name",
      width: 100,
    },
    {
      title: "菜单图标",
      dataIndex: "icon",
      key: "icon",
      width: 100,
    },
    {
      title: "排序值",
      dataIndex: "sort",
      key: "sort",
      width: 100,
    },
    {
      title: "前端路由",
      dataIndex: "path",
      key: "path",
      width: 100,
    },
    {
      title: "菜单类型",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (_) => {
        return _ === "0" ? "菜单" : "按钮";
      },
    },
    {
      title: "权限标识",
      dataIndex: "permission",
      key: "permission",
      width: 100,
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    if (action === "update" && record) {
      const { type, utype, parentId, name, icon, path, sort, permission } =
        record;
      activeId = record?.id;
      formCreate.setFieldsValue({
        type,
        utype:utype.split(','),
        parentId,
        name,
        icon,
        path,
        sort,
        permission,
      });
      setType(type);
    } else {
      setType("0");
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
        const { type, utype, parentId, name, icon, path, sort, permission } =
          values;
        let params = { type, utype:utype.join(','), parentId, name, path };
        if (permission) {
          params.permission = permission;
        }
        if (icon) {
          params.icon = icon;
        }
        if (path) {
          params.path = path;
        }
        if (sort) {
          params.sort = sort;
        }
        let action = null;
        let msg = "";
        if (activeId !== -1) {
          params.menuId = activeId;
          action = http.put;
          msg = "修改成功！";
        } else {
          action = http.post;
          msg = "新增成功！";
        }
        action(config.API_PREFIX + api.authMenu, params)
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

  // const showTotal = (total, range) => {
  //   return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  // };

  const [treeData, setTreeData] = useState([]);
  /*
  const treeData = [
    {
      value: 'parent 1',
      title: 'parent 1',
      children: [
        {
          value: 'parent 1-0',
          title: 'parent 1-0',
          children: [
            {
              value: 'leaf1',
              title: 'leaf1',
            },
            {
              value: 'leaf2',
              title: 'leaf2',
            },
          ],
        },
        {
          value: 'parent 1-1',
          title: 'parent 1-1',
          children: [
            {
              value: 'leaf3',
              title: (
                <b
                  style={{
                    color: '#08c',
                  }}
                >
                  leaf3
                </b>
              ),
            },
          ],
        },
      ],
    },
  ];
  */

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    http
      .post(config.API_PREFIX + api.authMenuTree, {})
      .then((res) => {
        setTreeData(res?.bizData || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
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
            title: "菜单管理",
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal("create")}
            >
              新增菜单
            </Button>
          </div>
          <Table
            columns={resizableColumns}
            rowKey={(record) => record.id}
            loading={loading}
            components={components}
            dataSource={treeData}
            pagination={false}
            scroll={{ x: tableWidth }}
            bordered
          />
        </div>
      </div>
      <Modal
        title="新增/编辑菜单"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loadingOk}
      >
        <Form
          form={formCreate}
          labelCol={{ span: 5 }}
          style={{ padding: 16 }}
          initialValues={{ type: "0", utype: "ALL" }}
        >
          <Form.Item
            label="菜单类型"
            name="type"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Radio.Group onChange={onChange}>
              <Radio value={"0"}>菜单</Radio>
              <Radio value={"1"}>按钮</Radio>
            </Radio.Group>
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

          <Form.Item
            label="父级菜单"
            name="parentId"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <TreeSelect
              style={{
                width: "100%",
              }}
              dropdownStyle={{
                maxHeight: 400,
                overflow: "auto",
              }}
              placeholder="请选择"
              allowClear
              treeDefaultExpandAll
              treeData={treeData}
              fieldNames={{
                label: "name",
                value: "id",
                // children: 'children',
              }}
            />
          </Form.Item>

          <Form.Item
            label="菜单名称"
            name="name"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          {type === "0" ? (
            <>
              <Form.Item
                label="菜单图标"
                name="icon"
                extra="打开链接，戳心仪图标后自动复制icon，再粘贴即可。举例：<UpCircleOutlined />"
              >
                <Input
                  placeholder="请输入"
                  addonAfter={
                    <a
                      href="https://ant-design.antgroup.com/components/icon-cn"
                      target="_blank"
                    >
                      <LinkOutlined />
                    </a>
                  }
                />
              </Form.Item>

              <Form.Item label="前端路由" name="path">
                <Input placeholder="请输入" />
              </Form.Item>

              <Form.Item label="排序" name="sort">
                <InputNumber placeholder="请输入" style={{ width: "100%" }} />
              </Form.Item>
            </>
          ) : null}

          {type === "1" ? (
            <Form.Item
              label="权限标识"
              name="permission"
              rules={[
                {
                  required: true,
                  message: "请选择",
                },
              ]}
            >
              <Input placeholder="请输入" />
            </Form.Item>
          ) : null}
        </Form>
      </Modal>
    </div>
  );
};

export default App;
