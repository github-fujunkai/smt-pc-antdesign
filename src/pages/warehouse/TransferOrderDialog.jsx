import { getDictionaryListByCode } from '@/utils/util';
import { SearchOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Select, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { config } from '../../utils/config';
import http from '../../utils/http';
const { TextArea } = Input;

const { confirm } = Modal;
const App = ({ isModalOpen, transferOrderData, close }) => {
  const [isShowSearch, setIsShowSearch] = useState(false);
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };

  const onFinish = (values) => {
    console.log('search values', values);
    if (tableParams.pagination?.current !== 1) {
      setTableParams(paginationInit);
    } else {
      fetchData();
    }
  };
  const resetFormSearch = () => {
    formSearch.resetFields();
    if (tableParams.pagination?.current !== 1) {
      setTableParams(paginationInit);
    } else {
      fetchData();
    }
  };
  const [loading, setLoading] = useState(false);
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const handleSelectChange = (value, key, index) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [key]: value };
    setData(newData);
  };
  const columns = [
    {
      title: '物料UID',
      dataIndex: 'materialUid',
      key: 'materialUid',
    },
    {
      title: '料号',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: '批次',
      dataIndex: 'lotNo',
      key: 'lotNo',
    },
    {
      title: '物料描述',
      dataIndex: 'materialDescription',
      key: 'materialDescription',
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '库位',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
    },
    {
      title: '数量',
      dataIndex: 'qty',
      key: 'qty',
    },
    {
      title: '物料类型',
      dataIndex: 'itemCategory',
      key: 'itemCategory',
    },
    {
      title: '调拨原因',
      dataIndex: 'locationTransferReason',
      key: 'locationTransferReason',
      render: (
        text,
        record,
        index, // 增加record和index参数
      ) => (
        <Select
          value={record.locationTransferReason} // 绑定当前值
          onChange={(value) => handleSelectChange(value, 'locationTransferReason', index)}
          placeholder="请选择"
          options={getDictionaryListByCode('39')}
        />
      ),
    },
    {
      title: '调入仓库',
      dataIndex: 'inbound',
      key: 'inbound',
      render: (text, record, index) => (
        <Select
          value={record.inbound} // 绑定当前值
          onChange={(value) => handleSelectChange(value, 'inbound', index)}
          placeholder="请选择"
          options={getDictionaryListByCode('38')}
        />
      ),
    },
  ];

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 5,
      showQuickJumper: true,
      showTotal,
      showSizeChanger: true,
    },
  };

  const [tableParams, setTableParams] = useState({ ...paginationInit });

  useEffect(() => {
    if (isModalOpen) {
      setData([]);
      setSelectedRowKeys([]);
      setSelectedTable([]);
      fetchData();
    }
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
    isModalOpen,
  ]);
  const fetchData = () => {
    setLoading(true);
    const {
      order,
      field,
      pagination: { current, pageSize },
    } = tableParams;

    // sequelize 举例
    // order: [[ 'created_at', 'desc' ], [ 'categoryId', 'desc' ]],
    console.log('order, field', order, field);

    // 多个传参举例-hzry
    // GET /api/resource?sort=created_at:desc,categoryId:asc

    let params = {
      current,
      size: pageSize,
    };
    // params['orders[0].column'] = 'id'
    // params['orders[0].asc'] = false
    if (field && order) {
      // params.sort = `${field}:${order}`  // hzry
      // 举例：lxy
      // orders[0].column: id
      // orders[0].asc: true
      params['orders[0].column'] = field;
      params['orders[0].asc'] = order === 'ascend' ? true : false;
    }
    const { itemCode, lotNo, supplier, warehouse } = formSearch.getFieldsValue();
    if (lotNo) {
      params.lotNo = lotNo;
    }
    if (supplier) {
      params.supplier = supplier;
    }
    if (warehouse) {
      params.warehouse = warehouse;
    }
    if (itemCode) {
      params.itemCode = itemCode;
    }

    http
      .get(config.API_PREFIX + 'location/transfer/select/item/page', params)
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;
        setData(data?.records || []);
        setLoading(false);
        console.log('fetchData pagination', tableParams);
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
    console.log('handleTableChange: ', pagination, filters, sorter);
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
    console.log('tableParams1', tableParams);

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedtable, setSelectedTable] = useState([]);
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys, selectedRows) => {
      console.log(`selectedRowKeys: ${selectedRowKeys}`, 'selectedRows: ', selectedRows);
      setSelectedRowKeys(selectedRowKeys);
      setSelectedTable(selectedRows);
    },
  };
  const handleOk = () => {
    http
      .post(
        `${config.API_PREFIX}location/transfer/select/items` +
          `?transferId=${transferOrderData.id}`,
        selectedtable,
      )
      .then((res) => {
        close();
        message.success('保存成功！');
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const handleCancel = () => {
    close();
  };
  return (
    <Modal title="选料" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} width={1200}>
      <div className="search-wrapper">
        <Form form={formSearch} onFinish={onFinish}>
          <Row gutter="24">
            <Col span={8}>
              <Form.Item label="料号" name="itemCode">
                <Input allowClear placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="批次号" name="lotNo">
                <Input allowClear placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="供应商" name="supplier">
                <Input allowClear placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="仓库" name="warehouse">
                <Input allowClear placeholder="请输入" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Space size="small">
                <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>
                  查询
                </Button>
                <Button onClick={resetFormSearch} htmlType="button">
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </div>
      <Table
        scroll={{ x: 'max-content' }}
        rowSelection={rowSelection}
        columns={columns}
        rowKey={(record) => record.id}
        dataSource={data}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
        loading={loading}
        bordered
      />
    </Modal>
  );
};

export default App;
