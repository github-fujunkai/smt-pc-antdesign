import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Image, Tag, Butotn, Table, Modal, Breadcrumb, Form, Row, Col, Select, Input, InputNumber, Space, Button, message } from 'antd';
import { ExclamationCircleFilled, LoadingOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
import  dayjs from 'dayjs'
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1

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

  const onFinish = (values) => {
    console.log('search values', values)
    if (tableParams.pagination?.current !== 1) {
      setTableParams(paginationInit);
    } else {
      fetchData()
    }
  };
  const resetFormSearch = () => {
    formSearch.resetFields();
    if (tableParams.pagination?.current !== 1) {
      setTableParams(paginationInit);
    } else {
      fetchData()
    }
  }
  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm()
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([])

  const columns = [
    {
      title: '不良类别',
      dataIndex: 'defectCategory',
      // sorter: true,
      key: 'defectCategory',
    },
    {
      title: '不良代码',
      dataIndex: 'defectCode',
      key: 'defectCode',
    },
    {
      title: '不良名称',
      dataIndex: 'defectName',
      key: 'defectName',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      // sorter: true,
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      // sorter: true,
      render: (_, record) => {
        return _ ? dayjs(_).format('YYYY-MM-DD HH:mm:ss') : ''
      }
    },
    {
      title: '修改人',
      dataIndex: 'updateBy',
      key: 'updateBy',
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
        )
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
        http.del(config.API_PREFIX + api.basicTestDefectCode + `/${record?.id}`, {}).then((res) => {
          fetchData()
          message.success('删除成功！')
        }).catch(err => {
          console.log(err)
        })
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const { id, defectCategory, defectCode, defectName } = record
        activeId = id
        formCreate.setFieldsValue({
          defectCategory, defectCode, defectName
        })
      } else {
        activeId = -1
        formCreate.resetFields();
      }
      setIsModalOpen(true);
  };

  const handleOk = () => {
    formCreate.validateFields().then(values => {
      console.log('values', values)

      setLoadingOk(true)
      // wtf
      const { deviceTypeType, wtf1, deviceModel, deviceType, isNormal } = values
      let params = { deviceTypeType, wtf1, deviceModel, deviceType, isNormal }
      let action = null
      let msg = ''
      let apiUrl = ''
      console.log('activeId', activeId)
      if (activeId !== -1) {
        action = http.put
        // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
        apiUrl = `${config.API_PREFIX}${api.device}`
        params.id = activeId
        msg = '修改成功！'
      } else {
        action = http.post
        apiUrl = `${config.API_PREFIX}${api.device}`
        msg = '新增成功！'
      }
      action(apiUrl, params).then((res) => {
        formCreate.resetFields();
        setLoadingOk(false)
        setIsModalOpen(false);
        fetchData()
        message.success(msg)
      }).catch(err => {
        setLoadingOk(false)
        console.log(err)
      })
    }).catch(error => {
      console.log('Form validation error:', error);
    })
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
  }

  const [tableParams, setTableParams] = useState({...paginationInit});

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
    console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams))
  }, [
    tableParams.pagination?.current,
    tableParams.pagination?.pageSize,
    tableParams?.columnKey,
    tableParams?.order,
  ]);

  const [tplVariable, setTplVariable] = useState(false);
  const [tpls, setTpls] = useState([]);
  useEffect(() => {
    http.get(config.API_PREFIX + api.printTemplateVariable, {}).then((res) => {
      console.log('res', res)
      const data = res?.bizData
      console.log('printTemplateVariable', data)
      setTplVariable(data)
    }).catch(err => {
      console.log(err)
    })

    http.get(config.API_PREFIX + api.printTemplatePage, {
      current: 0,
      size: 1000,
    }).then((res) => {
      console.log('res', res)
      setTpls(res?.bizData?.records || []);
    }).catch(err => {
      console.log(err)
    })
  }, [])

  const fetchData = () => {
    setLoading(true);
    const {
      order,
      field,
      pagination: { current, pageSize }
    } = tableParams;

    // sequelize 举例
    // order: [[ 'created_at', 'desc' ], [ 'categoryId', 'desc' ]],
    console.log('order, field', order, field)

    // 多个传参举例-hzry
    // GET /api/resource?sort=created_at:desc,categoryId:asc

    let params = {
      current,
      size: pageSize,
    }
    // params['orders[0].column'] = 'id'
    // params['orders[0].asc'] = false
    if (field && order) {
      // params.sort = `${field}:${order}`  // hzry
      // 举例：lxy
      // orders[0].column: id
      // orders[0].asc: true
      params['orders[0].column'] = field
      params['orders[0].asc'] = order === 'ascend' ? true : false
    }

    const {defectCategory, defectCode, defectName} = formSearch.getFieldsValue()
    if (defectCategory) {
      params.defectCategory = defectCategory
    }
    if (defectCode) {
      params.defectCode = defectCode
    }
    if (defectName) {
      params.defectName = defectName
    }

    http.get(config.API_PREFIX + api.basicTestDefectCodePage, params).then((res) => {
      console.log('res', res)
      const data = res?.bizData
      
      setData(data?.records || []);
      setLoading(false);
      console.log('fetchData pagination', tableParams)
      setTableParams({
        ...tableParams,
        pagination: {
          ...tableParams.pagination,
          total: data?.total,
          showTotal,
        },
      });
    }).catch(err => {
      console.log(err)
    })
  };

  const handleTableChange = (pagination, filters, sorter) => {
    console.log('handleTableChange: ', pagination, filters, sorter)
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });
    console.log('tableParams1', tableParams)

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const [loadingUpload, setLoadingUpload] = useState(false);
  const [imageUrl, setImageUrl] = useState();

  const myDesign = () => {
    let LODOP = window.getLodop();
    if (LODOP.CVERSION) {
      window.CLODOP.On_Return = function(TaskID, Value) {
        // document.getElementById('S1').value = Value;
        console.log('Value', Value)
        formCreate.setFieldValue('content', Value)
      };
    }
    // document.getElementById('S1').value = LODOP.PRINT_DESIGN();
    let tplContent = formCreate.getFieldValue('content')
    if (tplContent) {
      eval(tplContent)
    }
    const value = LODOP.PRINT_DESIGN();
    console.log('value', value)
  }

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '设备管理'
        }, {
          title: '设备型号'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="不良类别" name="defectCategory">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[{
                        label: 'SPI',
                        value: 'SPI'
                      }, {
                        label: 'AOI',
                        value: 'AOI'
                      }, {
                        label: 'FCT',
                        value: 'FCT'
                      }, {
                        label: '目检',
                        value: '目检'
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="不良代码" name="defectCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="不良名称" name="defectName">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Space size="small">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                  <Button onClick={resetFormSearch}  htmlType="button">重置</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="table-wrapper">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {showModal('create')}}>添加新设备</Button>
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
        <Modal title="新增/修改设备"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          okButtonProps={{
            disabled: loadingUpload,
          }}
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="设备类型"
              name="deviceTypeType"
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
                showSearch
                options={[{
                    label: '上板机',
                    value: '上板机'
                  }, {
                    label: '轨道',
                    value: '轨道'
                  }, {
                    label: '镭雕机',
                    value: '镭雕机'
                  }, {
                    label: '贴片机',
                    value: '贴片机'
                  }, {
                    label: '回流炉',
                    value: '回流炉'
                  }, {
                    label: '上板机',
                    value: '上板机'
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="设备品牌？"
              name="manufacturer"
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
              label="设备型号"
              name="deviceModel"
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
              label="驱动"
              name="deviceType"
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
              label="是否可用"
              name="isNormal"
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
                showSearch
                options={[{
                    label: '异常',
                    value: 0
                  }, {
                    label: '正常',
                    value: 1
                  },
                ]}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
