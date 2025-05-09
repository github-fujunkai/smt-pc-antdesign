import { DownloadOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Row,
  Space,
  Switch,
  Table,
  Tooltip,
} from 'antd';
import qs from 'qs';
import { useEffect, useState } from 'react';
import { config } from '../../utils/config';
import http from '../../utils/http';
import { downloadCSV } from '../../utils/util';
const { TextArea } = Input;

const { confirm } = Modal;
const App = () => {
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

  const columns = [
    {
      title: '原材UID',
      dataIndex: 'materialUid',
      // sorter: true,
      key: 'materialUid',
    },
    {
      title: '料号',
      dataIndex: 'itemCode',
      key: 'itemCode',
    },
    {
      title: '供应商料号',
      dataIndex: 'supplierItemCode',
      key: 'supplierItemCode',
    },
    {
      title: '物料描述',
      dataIndex: 'materialDescription',
      key: 'materialDescription',
    },
    {
      title: '批次号',
      dataIndex: 'batchNumber',
      key: 'batchNumber',
    },
    {
      title: '包装数量',
      dataIndex: 'packageQty',
      key: 'packageQty',
    },
    {
      title: '入库数量',
      dataIndex: 'inboundQty',
      key: 'inboundQty',
    },
    // {
    //   title: "入库单状态",
    //   dataIndex: "inboundStatus",
    //   key: "inboundStatus",
    //   render: (_, record) => {
    //     return record.inboundStatus === 0 ? "新增" : "确认";
    //   },
    // },
    {
      title: '当前数量',
      dataIndex: 'currentQty',
      key: 'currentQty',
    },
    {
      title: '单号',
      dataIndex: 'documentNumber',
      key: 'documentNumber',
    },
    {
      title: '关联单号',
      dataIndex: 'relatedDocumentNumber',
      key: 'relatedDocumentNumber',
    },
    {
      title: '操作类型',
      dataIndex: 'operationType',
      key: 'operationType',
    },
    {
      title: '线体',
      dataIndex: 'areaId',
      key: 'areaId',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '库位',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
    },
    {
      title: '库位类型',
      dataIndex: 'storageLocationType',
      key: 'storageLocationType',
    },
    {
      title: '仓库',
      dataIndex: 'warehouse',
      key: 'warehouse',
    },
    {
      title: '日期时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '操作员',
      dataIndex: 'createBy',
      key: 'createBy',
    },
  ];

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

  const [tableParams, setTableParams] = useState({ ...paginationInit });

  /*
  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams))
    // fixme 只是 total 变了而已，fetchData xhr 回调又执行了一次 xhr
    // {"pagination":{"current":1,"pageSize":10,"showQuickJumper":true,"showSizeChanger":true}}
    // {"pagination":{"current":1,"pageSize":10,"showQuickJumper":true,"showSizeChanger":true,"total":14}}
  }, [JSON.stringify(tableParams)]);
  */
  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams));
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
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
    const {
      materialUid,
      itemCode,
      supplierItemCode,
      batchNumber,
      operationType,
      areaId,
      createTimeStart,
      createTimeEnd,
    } = formSearch.getFieldsValue();
    if (materialUid) {
      params.materialUid = materialUid;
    }
    if (supplierItemCode) {
      params.supplierItemCode = supplierItemCode;
    }
    if (batchNumber) {
      params.batchNumber = batchNumber;
    }
    if (itemCode) {
      params.itemCode = itemCode;
    }
    if (operationType) {
      params.operationType = operationType;
    }
    if (areaId) {
      params.areaId = areaId;
    }
    if (createTimeStart) {
      params.createTimeStart = createTimeStart.format('YYYY-MM-DD 00:00:00');
    }
    if (createTimeEnd) {
      params.endTime = createTimeEnd.format('YYYY-MM-DD 00:00:00');
    }
    setQueryParams(params);
    http
      .get(config.API_PREFIX + 'material/history/page', params)
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;
        setQueryTotal(data?.total);
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
  // 导入--------------------------------------------------------------------------------------------------------------------
  const [queryParams, setQueryParams] = useState(null);
  const [queryTotal, setQueryTotal] = useState(0);
  const [loadingExport, setLoadingExport] = useState(false);
  const exportData = () => {
    const query = qs.stringify({
      ...queryParams,
      current: 1,
      size: queryTotal,
    });
    http
      .post(config.API_PREFIX + 'material/history/exportData' + `?${query}`)
      .then((res) => {
        message.success('导出成功！');
        downloadCSV(res, '操作履历导出-CSV文件');
        setLoadingExport(false);
      })
      .catch((err) => {
        console.log(err);
        message.error('导出失败！');
        setLoadingExport(false);
      });
  };
  return (
    <div className="content-wrapper  flex flex-col">
      <div className="content">
        <div className="tools">
          <Space size="middle">
            <Tooltip title={isShowSearch ? '隐藏搜索' : '显示搜索'}>
              <Switch
                onChange={onSearchChange}
                checkedChildren={<SearchOutlined />}
                unCheckedChildren={<SearchOutlined />}
              />
            </Tooltip>
          </Space>
        </div>
        <div className="search-wrapper" style={{ display: isShowSearch ? 'block' : 'none' }}>
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="原材UID" name="materialUid">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="料号" name="itemCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="供应商料号" name="supplierItemCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="批次号" name="batchNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="操作类型" name="operationType">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="线体" name="areaId">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="操作日期（开始）" name="createTimeStart">
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="操作日期（结束）" name="createTimeEnd">
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
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
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              className="mr-2"
              loading={loadingExport}
              onClick={exportData}
              type="dashed"
              htmlType="button"
              icon={<DownloadOutlined />}
            >
              导出
            </Button>
          </div>
          <Table
            scroll={{ x: 'max-content' }}
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            bordered
          />
        </div>
      </div>
    </div>
  );
};

export default App;
