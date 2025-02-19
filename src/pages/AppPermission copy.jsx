import React, { useState, useMemo } from 'react';
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import { Tree, Checkbox, Typography, Table, Modal, Breadcrumb, Form, Row, Col, Select, Input, Space, Button, InputNumber } from 'antd';
import { ExclamationCircleFilled, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header'
import '@minko-fe/use-antd-resizable-header/index.css'

const { confirm } = Modal;
const del = (record) => {
  confirm({
    title: '删除确认',
    icon: <ExclamationCircleFilled />,
    content: '账户权限不足，只有超级管理员可以删除！该角色下存在使用用户，请先至“用户管理”！角色删除后无法恢复，请确认是否删除！',
    onOk() {
      console.log('OK');
    },
    onCancel() {
      console.log('Cancel');
    },
  });
};

const options1 = [
  {
    label: '权限1',
    value: 'Apple',
  },
  {
    label: '权限2',
    value: 'Pear',
  },
  {
    label: '权限3',
    value: 'Orange',
  },
];

let data = [];
for (let i = 0; i < 5; i++) {
  data.push({
    key: i.toString(),
    name: `用户角色 ${i}`,
    age: `用户权限 ${i}`,
  })
}

const AppPermission = () => {
  const [value, setValue] = useState(2);
  const onChange = (e) => {
    console.log('radio checked', e.target.value);
    setValue(e.target.value);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const options = [
    {
      label: '权限1',
      value: 'Apple',
    },
    {
      label: '权限2',
      value: 'Pear',
    },
    {
      label: '权限3',
      value: 'Orange',
    },
  ];

  const columns = [
    {
      title: '用户角色',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '用户权限',
      dataIndex: 'age',
      key: 'age',
      width: 200,
      render:() => {
        return (
          // <Checkbox.Group options={options1} defaultValue={['Apple', 'Orange']} />
          <Tree
            checkable
            defaultExpandedKeys={['0-0-0', '0-0-1']}
            defaultSelectedKeys={['0-0-0', '0-0-1']}
            defaultCheckedKeys={['0-0-0', '0-0-1']}
            // onSelect={onSelect}
            // onCheck={onCheck}
            treeData={treeData}
          />
        )
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link>保存</Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
          </Space>
        )
      },
    },
  ];
  
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, []),
    columnsState: {
      persistenceKey: 'localKeyAppPermission',
      persistenceType: 'localStorage',
    },
  })

  const treeData = [
    {
      title: 'parent 1',
      key: '0-0',
      children: [
        {
          title: 'parent 1-0',
          key: '0-0-0',
          disabled: true,
          children: [
            {
              title: 'leaf',
              key: '0-0-0-0',
              disableCheckbox: true,
            },
            {
              title: 'leaf',
              key: '0-0-0-1',
            },
          ],
        },
        {
          title: 'parent 1-1',
          key: '0-0-1',
          children: [
            {
              title: (
                <span
                  style={{
                    color: '#1677ff',
                  }}
                >
                  sss
                </span>
              ),
              key: '0-0-1-0',
            },
          ],
        },
      ],
    },
  ];

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '基础设置'
        }, {
          title: '权限管理'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="table-wrapper">
          <div style={{marginBottom: 16, textAlign: 'right'}}>
            <Button type="primary" icon={<PlusOutlined />}  onClick={showModal}>新增角色</Button>
          </div>
          <Table
            columns={resizableColumns}
            components={components}
            dataSource={data}
            pagination={false}
            scroll={{ x: tableWidth }}
            bordered
          />
        </div>
      </div>
      <Modal title="新增角色" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form
          labelCol={{ span: 5 }}
          style={{padding: 16}}
        >
          <Form.Item label="角色名">
            <Input placeholder="请输入" />
          </Form.Item>
          <Form.Item label="角色权限">
            {/* <Checkbox.Group options={options} defaultValue={['Pear']} /> */}
            <Tree
              checkable
              defaultExpandedKeys={['0-0-0', '0-0-1']}
              defaultSelectedKeys={['0-0-0', '0-0-1']}
              defaultCheckedKeys={['0-0-0', '0-0-1']}
              // onSelect={onSelect}
              // onCheck={onCheck}
              treeData={treeData}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AppPermission;
