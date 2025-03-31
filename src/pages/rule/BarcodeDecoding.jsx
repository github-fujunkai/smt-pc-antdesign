import {
  CloseOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import {
  Button,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  Card
} from 'antd';
import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { config } from '../../utils/config';
import http from '../../utils/http';
import { convertEmptyValuesToUndefined, downloadCSV } from '../../utils/util';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;

const App = () => {
  const [formComparing] = Form.useForm();
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);
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
      title: '解析名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分隔符',
      dataIndex: 'separator',
      key: 'separator',
    },
    {
      title: 'UID位置',
      dataIndex: 'startPos',
      key: 'startPos',
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return _ ? dayjs(_).format('YYYY-MM-DD HH:mm:ss') : '';
      },
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
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
          .del(config.API_PREFIX + 'barcode/reader/parent' + `/${record?.id}`, {})
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
  const [itemList, setItemList] = useState([]);
  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const { id, name, startPos, separator, itemContrasts } = record;
      activeId = id;
      setItemList(itemContrasts);
      formComparing.setFieldsValue({
        name,
        startPos,
        separator,
        items: itemContrasts,
      });
    } else {
      activeId = -1;
      formComparing.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        setLoadingOk(true);
        const { dictKey, dictValue, dictType } = values;
        let params = {
          dictKey,
          dictValue,
          dictType,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.put;
          apiUrl = `${config.API_PREFIX}sys/params/saveOrUpdate`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}sys/params/saveOrUpdate`;
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

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const [tableParams, setTableParams] = useState({ ...paginationInit });
  const [typeList, setTypeList] = useState([]);
  useEffect(() => {
    fetchData();
    setTypeList(JSON.parse(localStorage.getItem('dictionaryType') || '[]'));
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
    let params = {
      current,
      size: pageSize,
    };

    if (field && order) {
      params['orders[0].column'] = field;
      params['orders[0].asc'] = order === 'ascend' ? true : false;
    }

    params = {
      ...params,
      ...convertEmptyValuesToUndefined(formSearch.getFieldsValue())
    };
    http
      .get(config.API_PREFIX + 'barcode/reader/parent/page', params)
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
  const handleCancel = () => {
    formComparing.resetFields();
    setIsModalOpen(false);
  };
  const onFinishComparing = (values) => {
    console.log('Received values:', formComparing.getFieldsValue());
    formComparing.validateFields().then((values) => {
      setLoadingSave(true);
      const { name, startPos, separator, items } = formComparing.getFieldsValue();
      let msg = '';
      let params = {
        name,
        startPos,
        separator,
        itemContrasts: items,
      };
      if (activeId !== -1) {
        params.id = activeId;
        msg = '修改成功！';
      } else {
        msg = '新增成功！';
      }
      http
        .post(config.API_PREFIX + 'barcode/reader/parent/saveOrUpdate', params)
        .then((res) => {
          console.log(res);
          message.success(msg);
          setLoadingSave(false);
          setIsModalOpen(false);
          fetchData();
        })
        .catch((err) => {
          console.error(err);
          setLoadingSave(false);
          message.error('保存失败，请重试！');
        });
    });
  };

  const handleDeleteItem = (index, remove) => {
    console.log(index, remove);

    if (itemList[index]) {
      setLoadingRemove(true);
      http
        .del(config.API_PREFIX + 'barcode/reader' + `/${itemList[index].id}`, {})
        .then((res) => {
          console.log(res);
          remove(index);
          // itemList.splice(index, 1)
          setItemList((prev) => prev.filter((_, i) => i !== index));
          message.success('删除成功！');
          setLoadingRemove(false);
        })
        .catch((err) => {
          console.error(err);
          fetchData();
          message.error('删除失败，请重试！');
          setLoadingRemove(false);
        });
    } else {
      remove(index);
    }
  };
  return (
    <div className="content-wrapper">
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="名称" name="name">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="分隔符" name="separator">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="UID位置" name="startPos">
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
          title="解析规则新增/修改"
          open={isModalOpen}
          onOk={onFinishComparing}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          width={1000}
        >
          <Form form={formComparing}>
            <Row>
              <Col span={8}>
                <Form.Item
                  label="名称"
                  name="name"
                  rules={[
                    {
                      required: true,
                      message: '请输入',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="分隔符"
                  name="separator"
                  rules={[
                    {
                      required: true,
                      message: '请输入',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item
                  label="UID位置"
                  name="startPos"
                  rules={[
                    {
                      required: true,
                      message: 'UID位置',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
            </Row>
            <h2 className='font-size-18 font-weight-bold'>条码解析</h2>
            <Card>
            <Form.List name="items">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Row gutter={10} key={key}>
                      <Col span={10}>
                        <Form.Item
                          name={[name, 'num']}
                          initialValue={key}
                          style={{ display: 'none' }}
                        >
                          <Input />
                        </Form.Item>
                        <Form.Item name={[name, 'id']} style={{ display: 'none' }}>
                          <Input />
                        </Form.Item>
                        <Form.Item
                          label={`位置${key+1}`}
                          labelCol={{ span: 5, style: { textAlign: 'left' } }}
                          name={[name, 'ruleName']}
                          rules={[
                            {
                              required: true,
                              message: '请选择',
                            },
                          ]}
                        >
                          <Select
                            placeholder="请选择"
                            allowClear
                            options={['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((item) => ({
                              value: item,
                              label: item,
                            }))}
                          />
                        </Form.Item>
                      </Col>

                      <Col span={12}>
                        <Form.Item
                          label="内容"
                          labelCol={{ span: 6 }}
                          name={[name, 'valueChar']}
                          rules={[
                            {
                              required: true,
                              message: '请选择',
                            },
                          ]}
                        >
                          <Select
                            placeholder="请选择"
                            allowClear
                            options={[
                              {
                                value: '料号',
                                label: '料号',
                              },
                              {
                                value: '数量',
                                label: '数量',
                              },
                              {
                                value: '批次号',
                                label: '批次号',
                              },
                              {
                                value: 'Datecode',
                                label: 'Datecode',
                              },
                              {
                                value: '供应商料号',
                                label: '供应商料号',
                              },
                              {
                                value: 'MSL',
                                label: 'MSL',
                              },
                              {
                                value: '其它1',
                                label: '其它1',
                              },
                              {
                                value: '其它2',
                                label: '其它2',
                              },
                            ]}
                          />
                        </Form.Item>
                      </Col>

                      {/* <Col span={7}>
                                  <Form.Item
                                    label="备注"
                                    labelCol={{ span: 6 }}
                                    name={[name, 'memo']} 
                                  >
                                    <Input
                                      placeholder="请输入"
                                    />
                                  </Form.Item>
                                </Col> */}
                      <Col span={2}>
                        <Form.Item>
                          <Button
                            onClick={() => {
                              handleDeleteItem(name, remove);
                            }}
                            loading={loadingRemove}
                            shape="circle"
                            icon={<CloseOutlined />}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                  <Space>
                    <Button
                      onClick={() => {
                        add();
                      }}
                      icon={<PlusOutlined />}
                      type="dashed"
                    >
                      添加规则
                    </Button>
                  </Space>
                </>
              )}
            </Form.List>
            </Card>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
