import React, { useState, useMemo, useEffect } from "react";
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import {
  Typography,
  Checkbox,
  Radio,
  Tree,
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
  const [type, setType] = useState("0");
  const [menuIds, setMenuIds] = useState([]);
  // const [checkedKeys, setCheckedKeys] = useState([])

  const columns = [
    {
      title: "角色名称",
      dataIndex: "roleName",
      key: "roleName",
      width: 100,
    },
    {
      title: "角色标识",
      dataIndex: "roleCode",
      key: "roleCode",
      width: 100,
    },
    {
      title: "角色描述",
      dataIndex: "roleDesc",
      key: "roleDesc",
      width: 100,
    },
    {
      title: "账号类型",
      dataIndex: "utype",
      key: "utype",
      width: 100,
    },
    {
      title: "操作",
      dataIndex: "operation",
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link
              onClick={() => {
                showModal1(record);
              }}
            >
              授权
            </Typography.Link>
            <Typography.Link
              onClick={() => {
                showModal("update", record);
              }}
            >
              编辑
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

  const [value, setValue] = useState(2);
  const onChange = (e) => {
    console.log("radio checked", e.target.value);
    setValue(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    if (action === "update" && record) {
      const { roleName, roleCode, roleDesc, utype } = record;
      activeId = record?.roleId;
      formCreate.setFieldsValue({
        roleName,
        roleCode,
        roleDesc,
        utype:utype.split(','),
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
        const { roleName, roleCode, roleDesc, utype } = values;
        let params = { roleName, roleCode, roleDesc, utype:utype.join(','), };
        let action = null;
        let msg = "";
        if (activeId !== -1) {
          params.roleId = activeId;
          action = http.put;
          msg = "修改成功！";
        } else {
          action = http.post;
          msg = "新增成功！";
        }
        action(config.API_PREFIX + api.authRole, params)
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

  const [data, setData] = useState([]);
  const [treeData, setTreeData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    setLoading(true);
    http
      .post(config.API_PREFIX + api.authRoleList, {})
      .then((res) => {
        setData(res?.bizData || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        console.log(err);
      });
  };

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [roleName, setRoleName] = useState("");

  const showModal1 = (record) => {
    activeId = record.roleId;
    setRoleName(record.roleName);
    // setCheckedKeys([1303, 1304])

    http
      .post(config.API_PREFIX + api.authMenuTree, {})
      .then((res) => {
        setTreeData(res?.bizData || []);

        http
          .post(config.API_PREFIX + api.authMenuTree + `/${activeId}`, {})
          .then((res) => {
            // setCheckedKeys(res?.bizData || [])
            setMenuIds(res?.bizData || []);
            setIsModalOpen1(true);
          })
          .catch((err) => {
            console.log(err);
          });
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const handleOk1 = () => {
    http
      .put(config.API_PREFIX + api.authRoleMenu, {
        roleId: activeId,
        menuIds: menuIds.join(","),
      })
      .then((res) => {
        message.success("操作成功！");
        setIsModalOpen1(false);
      })
      .catch((err) => {
        console.log(err);
        message.error("操作失败，请重试！");
      });
  };

  const handleCancel1 = () => {
    activeId = -1;
    setIsModalOpen1(false);
  };

  const onCheck = (checkedKeys, info) => {
    console.log("onCheck", checkedKeys, info);
    // setMenuIds(checkedKeys.join(','))
    setMenuIds(checkedKeys);
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
            title: "角色管理",
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: "right" }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal("create");
              }}
            >
              新增角色
            </Button>
          </div>
          <Table
            columns={resizableColumns}
            rowKey={(record) => record.roleId}
            loading={loading}
            components={components}
            dataSource={data}
            pagination={false}
            scroll={{ x: tableWidth }}
            bordered
          />
        </div>
      </div>
      <Modal
        title="新增/编辑角色"
        loading={loadingOk}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loadingOk}
      >
        <Form
          form={formCreate}
          labelCol={{ span: 5 }}
          style={{ padding: 16 }}
          initialValues={{ utype: "ALL" }}
        >
          <Form.Item
            label="角色名称"
            name="roleName"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="角色标识"
            name="roleCode"
            rules={[
              {
                required: true,
                message: "请选择",
              },
            ]}
          >
            <Input placeholder="请输入" />
          </Form.Item>

          <Form.Item
            label="角色描述"
            name="roleDesc"
            rules={[
              {
                required: true,
                message: "请选择",
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
        </Form>
      </Modal>

      <Modal
        title={`授权（${roleName}）`}
        open={isModalOpen1}
        onOk={handleOk1}
        onCancel={handleCancel1}
      >
        <Tree
          checkable
          checkedKeys={menuIds}
          // checkedKeys={checkedKeys}
          selectable={true}
          treeData={treeData}
          onCheck={onCheck}
          fieldNames={{
            title: "name",
            key: "id",
            // children: 'children',
          }}
        />
      </Modal>
    </div>
  );
};

export default App;
