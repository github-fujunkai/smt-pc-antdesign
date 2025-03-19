import { ExclamationCircleFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons';
import {
  Breadcrumb,
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
} from 'antd';
import { useEffect, useState } from 'react';
import SwitchNumber from '../components/SwitchNumber';

import dayjs from 'dayjs';
import api from '../utils/api';
import { config } from '../utils/config';
import http from '../utils/http';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;

const App = () => {
  /*
  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showTotal,
      showSizeChanger: true,
    },
  }

  useEffect(() => {
    fetchData();
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams))
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
  ]);
  */

  const [tpls, setTpls] = useState([]);
  useEffect(() => {
    http
      .get(config.API_PREFIX + api.printTemplatePage, {
        current: 0,
        size: 1000,
      })
      .then((res) => {
        console.log('res', res);
        setTpls(res?.bizData?.records || []);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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

  const [loadingOk, setLoadingOk] = useState(false);
  const [loadingOk1, setLoadingOk1] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: '产品包装-设置ID',
      dataIndex: 'id',
      // sorter: true,
      key: 'id',
    },
    {
      title: '包装层级',
      dataIndex: 'packagingLevel',
      key: 'packagingLevel',
      render: (_, record) => {
        return _ == 1 ? '一层' : _ == 2 ? '二层' : _;
      },
    },
    {
      title: '产品料号',
      dataIndex: 'productCode',
      key: 'productCode',
    },
    {
      title: '满包数量',
      dataIndex: 'maxPackageQty',
      key: 'maxPackageQty',
    },
    {
      title: '唯一码生成规则ID',
      dataIndex: 'uniqueCodeRuleId',
      key: 'uniqueCodeRuleId',
    },
    {
      title: '标签模板ID',
      dataIndex: 'labelTemplateId',
      key: 'labelTemplateId',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      // sorter: true,
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD HH:mm:ss');
      },
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      // sorter: true,
      render: (_, record) => {
        return _ ? dayjs(_).format('YYYY-MM-DD HH:mm:ss') : '';
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
            <Typography.Link onClick={() => onChangeCopy(record)}>复制</Typography.Link>
          </Space>
        );
      },
    },
  ];
  const onChangeCopy = (record) => {
    http
      .post(config.API_PREFIX + 'pack/product/config/copy' + `/${record.id}`, {})
      .then((res) => {
        fetchData();
        message.success('复制成功！');
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + api.packProductConfig + `/${record?.id}`, {})
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
  // 获取条码生成规则 唯一码生成规则：条码规则设定的“规则类型”为包装箱号的规则代码
  const [barCodeList, setBarCodeList] = useState([]);
  const getBarcodegenrulePage = () => {
    http
      .get(config.API_PREFIX + api.barcodegenrulePage, {
        ruleType: 'packProductPackaging',
      })
      .then((res) => {
        const data = res?.bizData;
        setBarCodeList(data?.records || []);
      });
  };
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const {
        id,
        packagingLevel,
        productCode,
        maxPackageQty,
        uniqueCodeRuleId,
        labelTemplateId,
        packageDateTimeFormatter,
        verifyProjectProductCode,
        verifyPassStation
      } = record;
      activeId = id;
      formCreate.setFieldsValue({
        id,
        packagingLevel,
        productCode,
        maxPackageQty,
        uniqueCodeRuleId,
        labelTemplateId,
        packageDateTimeFormatter,
        verifyProjectProductCode,
        verifyPassStation
      });
      setType(type);
    } else {
      activeId = -1;
      formCreate.resetFields();
      setType('');
    }
    getBarcodegenrulePage();
    setIsModalOpen(true);
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);

        setLoadingOk(true);
        const {
          packagingLevel,
          productCode,
          maxPackageQty,
          uniqueCodeRuleId,
          labelTemplateId,
          packageDateTimeFormatter,
          verifyProjectProductCode = 0,
          verifyPassStation = 0,
        } = values;
        let params = {
          packagingLevel,
          productCode,
          maxPackageQty,
          uniqueCodeRuleId,
          labelTemplateId,
          packageDateTimeFormatter,
          verifyProjectProductCode,
          verifyPassStation
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.packProductConfig}`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.packProductConfig}`;
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

  const [tplVariable, setTplVariable] = useState(false);
  useEffect(() => {
    http
      .get(config.API_PREFIX + api.printTemplateVariable, {})
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;
        console.log('printTemplateVariable', data);
        setTplVariable(data);
      })
      .catch((err) => {
        console.log(err);
      });
  }, []);

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

    const { packagingLevel, productCode } = formSearch.getFieldsValue();
    if (packagingLevel) {
      params.packagingLevel = packagingLevel;
    }
    if (productCode) {
      params.productCode = productCode;
    }

    http
      .get(config.API_PREFIX + api.packProductConfigPage, params)
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

  const [type, setType] = useState();
  const onTypeChange = (value) => {
    console.log('value', value);
    setType(value);
  };
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: '基础设置',
          },
          {
            title: '包装设置',
          },
          {
            title: '机型维护',
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="层级" name="packagingLevel">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={[
                      {
                        value: 1,
                        label: '一层',
                      },
                      {
                        value: 2,
                        label: '二层',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="料号" name="productCode">
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
              新增产品包装-设置
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
          title="新增/修改产品包装-设置"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
        >
          <Form
            labelCol={{ span: 8 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="包装层级"
              name="packagingLevel"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              {/* <Input allowClear placeholder="请输入" /> */}
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  {
                    value: 1,
                    label: '一层',
                  },
                  {
                    value: 2,
                    label: '二层',
                  },
                ]}
              />
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
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            <Form.Item
              label="	满包数量"
              name="maxPackageQty"
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
              label="唯一码生成规则ID"
              name="uniqueCodeRuleId"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              {/* <Input allowClear placeholder="请输入" /> */}
              <Select
                placeholder="请选择"
                allowClear
                // mode="multiple"
                options={barCodeList?.map((item) => ({
                  value: item.ruleCode,
                  label: item.ruleCode,
                }))}
              />
            </Form.Item>

            <Form.Item
              label="标签模板"
              name="labelTemplateId"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Select
                placeholder="请选择"
                allowClear
                // mode="multiple"
                options={tpls?.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
              />
            </Form.Item>
            <Form.Item
              label="包装日期格式"
              name="packageDateTimeFormatter"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item
              label="校验工单/料号"
              name="verifyProjectProductCode"
              valuePropName="checked"
            >
              <SwitchNumber />
            </Form.Item>
            <Form.Item
              label="校验过站"
              name="verifyPassStation"
              valuePropName="checked"
            >
              <SwitchNumber />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
