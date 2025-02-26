import React, { useState, useMemo, useEffect } from 'react';
import { Badge, Dropdown, Drawer, Typography, DatePicker, Image, Tag, Butotn, Table, Modal, Breadcrumb, Form, Row, Col, Select, Input, InputNumber, Space, Button, message } from 'antd';
import { ExclamationCircleFilled, DownOutlined, LoadingOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
import { FormattedMessage, useIntl } from '@umijs/max';
import  dayjs from 'dayjs'
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1
let activeId1 = -1
let activeId2 = -1
let action2 = ''

// 工单状态
const statusObj = {
  0: '新建',
  1: '下达',
  2: '执行',
  3: '挂起',
  4: '结单',
  5: '取消',
}

// 工单类型
const workOrderTypeObj = {
  0: '量产',
  1: '试产',
  2: '制样',
}

// 制令单状态：0.新建，1.投产，2.挂起，3.结单
const statusObj1 = {
  0: '新建',
  1: '投产',
  2: '挂起',
  3: '接单',
}

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

  const [dictBaseFwa, setDictBaseFwa] = useState({})
  const getDictBaseFwa = () => {
    http.post(config.API_PREFIX + api.dictBaseFwa, {
    }).then(res => {
    console.log('dict', res)
    setDictBaseFwa(res?.bizData)
  }).catch(err => {
  })
  }

  useEffect(() => {
    getDictBaseFwa()
  }, [])

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
  const [loadingOk2, setLoadingOk2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm()
  const [formCreate1] = Form.useForm()
  const [formCreate2] = Form.useForm()
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([])

  const columns = [
    {
      title: '出货单ID',
      dataIndex: 'id',
      // sorter: true,
      key: 'id',
    },
    {
      title: '发货单',
      dataIndex: 'orderNumber',
      // sorter: true,
      key: 'orderNumber',
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '订单号',
      dataIndex: 'customerOrderNumber',
      key: 'customerOrderNumber',
    },
    {
      title: '产品料号？',
      dataIndex: 'wtf1',
      key: 'wtf1',
    },
    {
      title: '销售订单？',
      dataIndex: 'wtf2',
      key: 'wtf2',
    },
    {
      title: '订单数量？',
      dataIndex: 'wtf3',
      key: 'wtf3',
    },
    {
      title: '已发货数量？',
      dataIndex: 'wtf4',
      key: 'wtf4',
    },
    {
      title: '快递单号',
      dataIndex: 'trackingNumber',
      key: 'trackingNumber',
    },
    {
      title: '快递公司',
      dataIndex: 'courierCompany',
      key: 'courierCompany',
    },
    {
      title: '客户地址',
      dataIndex: 'receiverAddress',
      key: 'receiverAddress',
    },
    {
      title: '收件人',
      dataIndex: 'recipient',
      key: 'recipient',
    },
    {
      title: '收件人电话',
      dataIndex: 'recipientPhone',
      key: 'recipientPhone',
    },
    {
      title: '发货人（创建人？）',
      dataIndex: 'createBy',
      key: 'createBy',
    },
    {
      title: '发货单状态（出库完成？）',
      dataIndex: 'outboundCompleted',
      key: 'outboundCompleted',
      // sorter: true,
      render: (_, record) => {
        return _ === 'Y' ? '是' : '否'
      }
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
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      // sorter: true,
      render: (_, record) => {
        return _ ? dayjs(_).format('YYYY-MM-DD HH:mm:ss') : ''
      }
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            {/* <Typography.Link onClick={() => showDrawer(record)}>拆单</Typography.Link> */}
            <Typography.Link onClick={() => showModal2('create', record)}>发货明细录入</Typography.Link>
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
        http.del(config.API_PREFIX + api.wmsProductStockOut + `/${record?.id}`, {}).then((res) => {
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

  const del2 = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http.del(config.API_PREFIX + api.prodproductionorder + `/${record?.id}`, {}).then((res) => {
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
  const [isModalOpen2, setIsModalOpen2] = useState(false);

  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const { id, orderNumber, customerName, customerOrderNumber, trackingNumber, receiverAddress, recipient, recipientPhone, outboundCompleted, remark } = record
        activeId = id
        formCreate.setFieldsValue({
          orderNumber, customerName, customerOrderNumber, trackingNumber, receiverAddress, recipient, recipientPhone, outboundCompleted, remark
        })
      } else {
        activeId = -1
        formCreate.resetFields();
      }
      setIsModalOpen(true);
  };
  const showModal2 = (action, record) => {
    activeId2 = record.id
    action2 = action
    if (action === 'update' && record) {
      formCreate2.resetFields();
      const { orderNumber, plannedQty, completedQty, productionAreaId, lane, cycleTime, boardSide, productionStage, status, actualProductionTime, actualCompletionDate, plannedProductionDate, plannedCompletionDate } = record
        formCreate2.setFieldsValue({
          orderNumber, plannedQty, completedQty, productionAreaId: productionAreaId.toString(), lane, cycleTime, boardSide, productionStage, status, actualProductionTime: dayjs(actualProductionTime), actualCompletionDate: dayjs(actualCompletionDate), plannedProductionDate: dayjs(plannedProductionDate), plannedCompletionDate: dayjs(plannedCompletionDate)
        })
      } else {
        formCreate2.resetFields();
      }
      setIsModalOpen2(true);
  };

  const [open, setOpen] = useState(false);
  const showDrawer = (record) => {
    activeId1 = record.id
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
  const onSave = () => {
    formCreate1.validateFields().then(values => {
      console.log('values', values)
      // sdf
      const items = values?.items.map(item => ({
        ...item,
        workOrderId: activeId1,
      }))
      http.post(`${config.API_PREFIX}${api.prodproductionorder}`, items).then((res) => {
        formCreate1.resetFields();
        fetchData()
        onClose()
        message.success('新增成功！')
      }).catch(err => {
        console.log(err)
      })
    }).catch(error => {
      console.log('Form validation error:', error);
    })
  };

  const handleOk = () => {
    formCreate.validateFields().then(values => {
      console.log('values', values)

      setLoadingOk(true)
      // wtf
      const { orderNumber, customerName, customerOrderNumber, trackingNumber, receiverAddress, recipient, recipientPhone, outboundCompleted, remark } = values
      let params = { orderNumber, customerName, customerOrderNumber, trackingNumber, receiverAddress, recipient, recipientPhone, outboundCompleted, remark }
      let action = null
      let msg = ''
      let apiUrl = ''
      console.log('activeId', activeId)
      if (activeId !== -1) {
        action = http.put
        // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
        apiUrl = `${config.API_PREFIX}${api.wmsProductStockOut}`
        params.id = activeId
        msg = '修改成功！'
      } else {
        action = http.post
        apiUrl = `${config.API_PREFIX}${api.wmsProductStockOut}`
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

  const handleOk2 = () => {
    formCreate2.validateFields().then(values => {
      console.log('values', values)
      setLoadingOk2(true)
      // wtf
      const { packagingOrderNumber, panelCode } = values
      let params = { packagingOrderNumber, panelCode }
      let action = null
      let msg = ''
      let apiUrl = ''
      console.log('activeId2', activeId2)
      if (action2 === 'update') {
        action = http.put
        // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
        apiUrl = `${config.API_PREFIX}${api.wmsProductStockOutDetail}`
        params.id = activeId2
        msg = '修改成功！'
      } else {
        action = http.post
        apiUrl = `${config.API_PREFIX}${api.wmsProductStockOutDetail}`
        msg = '新增成功！'
        params.stockOutId = activeId2
        params = [params]
      }
      action(apiUrl, params).then((res) => {
        formCreate2.resetFields();
        setLoadingOk2(false)
        setIsModalOpen2(false);
        fetchData()
        message.success(msg)
        activeId2 = -1
      }).catch(err => {
        setLoadingOk2(false)
        console.log(err)
      })
    }).catch(error => {
      console.log('Form validation error:', error);
    })
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };
  const handleCancel2 = () => {
    setIsModalOpen2(false);
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

    const {orderNumber, customerName, customerOrderNumber, wtf1, createBy, trackingNumber, courierCompany, createTimeStart, createTimeEnd} = formSearch.getFieldsValue()
    if (orderNumber) {
      params.orderNumber = orderNumber
    }
    if (customerName) {
      params.customerName = customerName
    }
    if (customerOrderNumber) {
      params.customerOrderNumber = customerOrderNumber
    }
    if (wtf1) {
      params.wtf1 = wtf1
    }
    if (createBy) {
      params.createBy = createBy
    }
    if (trackingNumber) {
      params.trackingNumber = trackingNumber
    }
    if (courierCompany) {
      params.courierCompany = courierCompany
    }
    if (createTimeStart) {
      params.createTimeStart = createTimeStart.format('YYYY-MM-DD') + ' 00:00:00'
    }
    if (createTimeEnd) {
      params.createTimeEnd = createTimeEnd.format('YYYY-MM-DD' + ' 23:59:59')
    }

    http.get(config.API_PREFIX + api.wmsProductStockOutPage, params).then((res) => {
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

  const handleDeleteItem = (index, remove) => {
    remove(index)
  };

  const expandedRowRender = (record) => {
    console.log('record', record.productionOrders)
    const columns1 = [
      {
        title: '制令单号',
        dataIndex: 'orderNumber',
        key: 'orderNumber',
      },
      {
        title: '工单号',
        dataIndex: 'workOrderNumber',
        key: 'workOrderNumber',
      },
      {
        title: '制令单数量？',
        dataIndex: 'wtf1',
        key: 'wtf1',
      },
      {
        title: '投产数量（计划投产数量？）',
        dataIndex: 'plannedQty',
        key: 'plannedQty',
      },
      {
        title: '完工数量',
        dataIndex: 'completedQty',
        key: 'completedQty',
      },
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
        title: '产品版本',
        dataIndex: 'productVersion',
        key: 'productVersion',
      },
      {
        title: '工艺',
        dataIndex: 'upgradeNum',
        key: 'upgradeNum',
      },
      {
        title: '产线？(需返回名称)',
        dataIndex: 'areaId',
        key: 'areaId',
      },
      {
        title: '轨道（Lane）',
        dataIndex: 'lane',
        key: 'lane',
      },
      {
        title: '产线CT',
        dataIndex: 'cycleTime',
        key: 'cycleTime',
      },
      {
        title: '面次',
        dataIndex: 'boardSide',
        key: 'boardSide',
      },
      {
        title: '阶别',
        dataIndex: 'productionStage',
        key: 'productionStage',
      },
      {
        title: '制令单状态',
        dataIndex: 'status',
        key: 'status',
        render: (_, record) => {
          return statusObj1[_]
        }
      },
      {
        title: '实际投产时间',
        dataIndex: 'actualProductionTime',
        key: 'actualProductionTime',
        render: (_, record) => {
          return _ ? dayjs(_).format('YYYY-MM-DD') : ''
        }
      },
      {
        title: '实际完工时间',
        dataIndex: 'actualCompletionDate',
        key: 'actualCompletionDate',
        render: (_, record) => {
          return _ ? dayjs(_).format('YYYY-MM-DD') : ''
        }
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        key: 'createTime',
        render: (_, record) => {
          return dayjs(_).format('YYYY-MM-DD HH:mm:ss')
        }
      },
      {
        title: '计划投产日期',
        dataIndex: 'plannedProductionDate',
        key: 'plannedProductionDate',
        render: (_, record) => {
          return _ ? dayjs(_).format('YYYY-MM-DD') : ''
        }
      },
      {
        title: '计划完工日期',
        dataIndex: 'plannedCompletionDate',
        key: 'plannedCompletionDate',
        render: (_, record) => {
          return _ ? dayjs(_).format('YYYY-MM-DD') : ''
        }
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        render: (_, record) => {
          return (
            <Space>
              <Typography.Link onClick={() => showModal2('update', record)}>修改</Typography.Link>
              <Typography.Link onClick={() => del2(record)}>删除</Typography.Link>
            </Space>
          )
        },
      },
    ];
    return <Table
      columns={columns1}
      dataSource={record?.productionOrders || []}
      pagination={false}
      size="small"
      scroll={{ x: 'max-content' }}
      bordered
      style={{margin: '10px 10px 10px 0'}}
      className="custom-table"
    />;
  };

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '生产管理'
        }, {
          title: '出货'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="发货单" name="orderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="客户" name="customerName">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="销售订单" name="customerOrderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="工单？" name="wtf1">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="发货人（创建人？）" name="createBy">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="快递单号" name="trackingNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="快递公司" name="courierCompany">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="发货日期（开始）" name="createTimeStart">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <DatePicker format="YYYY-MM-DD" style={{width: '100%'}} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="发货日期（结束）" name="createTimeEnd">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <DatePicker format="YYYY-MM-DD" style={{width: '100%'}} />
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {showModal('create')}}>新增出货单</Button>
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
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: ['0'],
              expandRowByClick: false,
            }}
          />
        </div>
        <Modal title="新增/修改出货单"
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
              label="发货单号"
              name="orderNumber"
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
              label="客户"
              name="customerName"
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
              label="订单号"
              name="customerOrderNumber"
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
              label="快递单号"
              name="trackingNumber"
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
              label="客户地址"
              name="receiverAddress"
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
              label="收件人"
              name="recipient"
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
              label="联系电话"
              name="recipientPhone"
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
              label="出库完成"
              name="outboundCompleted"
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
                showSearch
                options={[{
                    label: '是',
                    value: 'Y'
                  }, {
                    label: '否',
                    value: 'N'
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="备注"
              name="remark"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <TextArea allowClear placeholder="请输入" />
            </Form.Item>
          </Form>
        </Modal>
        <Modal title="发货明细录入"
          open={isModalOpen2}
          onOk={handleOk2}
          onCancel={handleCancel2}
          confirmLoading={loadingOk2}
        >
          <Form
            labelCol={{ span: 6 }}
            form={formCreate2}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="包装条码"
              extra="外箱条码"
              name="packagingOrderNumber"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item>

            {/* <Form.Item
              label="产品条码"
              extra="小板条码"
              name="panelCode"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="请输入" />
            </Form.Item> */}
          </Form>
        </Modal>
        <Drawer
          width="95vw"
          title="拆单（批量新增制令单）"
          onClose={onClose}
          open={open}
          closeIcon={false}
          maskClosable={false }
          extra={
            <Space>
              <Button onClick={onClose}>取消</Button>
              <Button type="primary" onClick={onSave}>保存</Button>
            </Space>
          }
        >
          <Form
            form={formCreate1}
            size="small"
          >
            <Form.List
              name="items"
            >
              {(fields, { add, remove }) => (
                <table className="myTable">
                  <thead>
                    <tr>
                      <th>制令单号</th>
                      {/* <th>工单号</th> */}
                      {/* <th>制令单数量</th> */}
                      <th>投产数量</th>
                      {/* <th>完工数量</th> */}
                      {/* <th>产品名称</th> */}
                      {/* <th>产品料号</th> */}
                      {/* <th>产品版本</th> */}
                      {/* <th>工艺</th> */}
                      <th>产线</th>
                      <th>轨道（Lane）</th>
                      <th>产线CT</th>
                      {/* <th>面次</th> */}
                      <th>阶别</th>
                      <th>制令单状态</th>
                      <th style={{width: 115}}>实际投产时间</th>
                      <th style={{width: 115}}>实际完工时间</th>
                      {/* <th>创建日期</th> */}
                      {/* <th>计划投产日期</th> */}
                      {/* <th>计划完工日期</th> */}
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                  {fields.map(({ key, name, ...restField }, index) => (
                    <tr>
                      <td>
                        <Form.Item
                          name={[name, 'orderNumber']}
                          rules={[{ required: true, message: '请输入制令单号' }]}
                          // initialValue={key + 1}
                        >
                          <Input placeholder="制令单号" />
                        </Form.Item>
                      </td>
                      {/* <td>
                        <Form.Item
                          name={[name, 'ruleDetailLength']}
                          rules={[{ required: true, message: '请输入长度' }]}
                        >
                          <Input placeholder="工单号" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'wtf1']}
                          rules={[{ required: true, message: '请输入制令单数量' }]}
                        >
                          <Input placeholder="制令单数量" />
                        </Form.Item>
                      </td> */}
                      <td>
                        <Form.Item
                          name={[name, 'plannedQty']}
                          rules={[{ required: true, message: '请输入投产数量' }]}
                        >
                          <Input placeholder="投产数量" />
                        </Form.Item>
                      </td>
                      {/* <td>
                        <Form.Item
                          name={[name, 'rule']}
                          rules={[{ required: true, message: '请输入规则' }]}
                        >
                          <Input placeholder="完工数量" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'remark']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="产品名称" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'remark']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="产品料号" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'remark']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="产品版本" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'wtf2']}
                          rules={[{ required: true, message: '请输入工艺' }]}
                        >
                          <Input placeholder="工艺" />
                        </Form.Item>
                      </td> */}
                      <td>
                        <Form.Item
                          name={[name, 'productionAreaId']}
                          rules={[{ required: true, message: '请输入产线' }]}
                        >
                          <Input placeholder="产线" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, 'lane']}
                          rules={[{ required: true, message: '请输入轨道（Lane）' }]}
                        >
                          <Input placeholder="轨道" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, 'cycleTime']}
                          rules={[{ required: true, message: '请输入产线CT' }]}
                        >
                          <Input placeholder="产线CT" />
                        </Form.Item>
                      </td>
                      {/* <td>
                        <Form.Item
                          name={[name, '面次是面别吗？']}
                          rules={[{ required: true, message: '请输入面次' }]}
                        >
                          <Input placeholder="面次" />
                        </Form.Item>
                      </td> */}
                      <td>
                        <Form.Item
                          name={[name, 'productionStage']}
                          rules={[{ required: true, message: '请输入阶别' }]}
                        >
                          <Input placeholder="阶别" />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, 'status']}
                          rules={[{ required: true, message: '请输入制令单状态' }]}
                        >
                          <Select
                            placeholder="状态"
                            allowClear
                            showSearch
                            options={[{
                                label: '新建',
                                value: 0
                              }, {
                                label: '投产',
                                value: 1
                              }, {
                                label: '挂起',
                                value: 2
                              }, {
                                label: '结单',
                                value: 3
                              },
                            ]}
                          />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, 'actualProductionTime']}
                          rules={[{ required: true, message: '请输入实际投产时间' }]}
                        >
                          <DatePicker placeholder="投产时间" format="YYYY-MM-DD" style={{width: '100%'}} />
                        </Form.Item>
                      </td>
                      <td>
                        <Form.Item
                          name={[name, 'actualCompletionDate']}
                          rules={[{ required: true, message: '请输入实际完工时间' }]}
                        >
                          <DatePicker placeholder="完工时间" format="YYYY-MM-DD" style={{width: '100%'}} />
                        </Form.Item>
                      </td>
                      {/* <td>
                        <Form.Item
                          name={[name, 'createTime']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="创建日期" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'plannedProductionDate']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="计划投产日期" />
                        </Form.Item>
                      </td> */}
                      {/* <td>
                        <Form.Item
                          name={[name, 'plannedCompletionDate']}
                          rules={[{ required: true, message: '请输入备注' }]}
                        >
                          <Input placeholder="计划完工日期" />
                        </Form.Item>
                      </td> */}
                      <td>
                        <Space>
                          <Typography.Link
                            onClick={() => {
                              handleDeleteItem(name, remove);
                            }}
                            style={{wordBreak: 'break-word', whiteSpace: 'nowrap'}}
                          >删除</Typography.Link>
                        </Space>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={10} style={{textAlign: 'center'}}>
                        <Button
                          onClick={() => {
                            add();
                          }}
                          type="dashed"
                          icon={<PlusOutlined />}
                        >
                          添加制令单
                        </Button>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </Form.List>
          </Form>
        </Drawer>
      </div>
    </div>
  );
};

export default App;
