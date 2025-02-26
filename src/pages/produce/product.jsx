import { ExclamationCircleFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Button, Col, Form, Input, message, Modal, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { config } from '../../utils/config';
import http from '../../utils/http';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;

const App = () => {
  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showTotal,
      showSizeChanger: true,
    },
  };
  const onFinish = (values) => {
    // console.log('search values', values);
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

  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    {
      title: '产品名称',
      dataIndex: 'productName',
      key: 'productName',
    },
    {
      title: '产品料号',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '配置时间',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => showModal('update', record)}>修改</Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
          </Space>
        );
      },
    },
  ];

  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'product/info' + `/${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success('删除成功！');
          })
          .catch((err) => {
            console.log(err);
          });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const { id, productName, productCode, productVersion, remarks,processProgramObj } = record;
      activeId = id;
      formCreate.setFieldsValue({
        id,
        productName,
        productCode,
        productVersion,
        remarks,
        processUrl:processProgramObj?.[0].uri || '',
        processCode:processProgramObj?.[0].code || ''
      });
      setProcessList(processProgramObj?.[0].pp || []);
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
        setLoadingOk(true);
        const { productName, productCode, productVersion, remarks } = values;
        console.log('valuesvaluesvaluesvalues', values);
        console.log('processList', processList);
        let params = {
          productName,
          productCode,
          productVersion,
          remarks,
          processProgramObj: [
            {
              uri: values.processUrl,
              code: values.productCode,
              pp: processList,
            },
          ],
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.put;
          apiUrl = `${config.API_PREFIX}product/info`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}product/info`;
          msg = '新增成功！';
        }
        action(apiUrl, params)
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
        console.log('Form validation error:', error);
      });
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const [tableParams, setTableParams] = useState({ ...paginationInit });

  useEffect(() => {
    fetchData();
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
  ]);

  const [processList, setProcessList] = useState([]);
  const fetchData = () => {
    setLoading(true);
    const {
      order,
      field,
      pagination: { current, pageSize },
    } = tableParams;
    let params = {
      current,
      size: pageSize,
    };

    if (field && order) {
      params['orders[0].column'] = field;
      params['orders[0].asc'] = order === 'ascend' ? true : false;
    }

    const { productName, productCode, productVersion, remarks, processUrl, processCode } =
      formSearch.getFieldsValue();

    params = {
      ...params,
      productName: productName ? productName : undefined,
      productCode: productCode ? productCode : undefined,
      productVersion,
      remarks,
      processProgramObj: [
        {
          uri: processUrl,
          code: processCode,
          pp: processList,
        },
      ],
    };
    http
      .get(config.API_PREFIX + 'product/info/page', params)
      .then((res) => {
        const data = res?.bizData;
        setData(data?.records || []);
        setLoading(false);
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

  const handleAddProcess = () => {
    setProcessList([
      ...processList,
      {
        process: '',
        program: '',
      },
    ]);
  };
  const handlePressEnter = (index) => {
    // 根据产品条码查工序
    http
      .post(
        config.API_PREFIX +
          `process/steps/code/list?productCode=${formCreate.getFieldValue('productCode')}`,
        {},
      )
      .then((res) => {
        let bizData = res?.bizData;
        if (bizData.length > 0) {
          setProcessList(bizData?.map((item) => ({ process: item.value, program: '' })));
        }
      });
  };

  // 在父组件中
  const handleInputChange = (index, field, value) => {
    const newList = [...processList];
    newList[index][field] = value;
    setProcessList(newList);
  };
  return (
    <div className="content-wrapper">
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="产品名称" name="productName">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="产品料号" name="productCode">
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
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增
            </Button>
          </div>
          <Table
            columns={columns}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            bordered
          />
        </div>
        <Modal
          title="新增/修改"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate}
            style={{ padding: 18, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="产品名称"
              name="productName"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="产品料号"
              name="productCode"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" onPressEnter={handlePressEnter} />
            </Form.Item>

            <Form.Item
              label="产品版本"
              name="productVersion"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="备注"
              name="remarks"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="工序程序URL"
              name="processUrl"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
            <Form.Item
              label="工序程序Code"
              name="processCode"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>
            <Row gutter={16} className="mb-2 text-center">
              <Col span={12} className="text-center">
                工序:
              </Col>
              <Col span={12} className="text-center">
                程序名:
              </Col>
            </Row>
            {processList &&
              processList.map((item, index) => {
                return (
                  <Row gutter={16} key={index} className="mb-2">
                    <Col span={12}>
                      <Input allowClear placeholder="请输入" value={item.process} disabled />
                    </Col>
                    <Col span={12}>
                      <Input
                        allowClear
                        placeholder="请输入"
                        value={item.program}
                        onChange={(e) => handleInputChange(index, 'program', e.target.value)}
                      />
                    </Col>
                  </Row>
                );
              })}
            {/* <div className="flex justify-center items-center mt-2">
              <Button type="primary" onClick={() => handleAddProcess()}>
                添加
              </Button>
            </div> */}
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
