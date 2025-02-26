import React, { useState, useMemo, useEffect } from 'react';
import { Typography, Image, Tag, Butotn, Table, Modal, Breadcrumb, Form, Row, Col, Select, Input, InputNumber, Space, Button, message } from 'antd';
import { ExclamationCircleFilled, LoadingOutlined, PlusOutlined, SearchOutlined } from '@ant-design/icons';

import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
import { FormattedMessage, useIntl } from '@umijs/max';
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
      title: '模板ID',
      dataIndex: 'id',
      // sorter: true,
      key: 'id',
    },
    {
      title: '模板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '模板类型',
      dataIndex: 'type',
      key: 'type',
      render: (_, record) => {
        return _ === 'itemUID' ? '物料' : '包装'
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
        return dayjs(_).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: '模板',
      dataIndex: 'content',
      key: 'content',
      render: (_, record) => {
        return <TextArea rows={4} readOnly defaultValue={_} />
      }
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
        http.del(config.API_PREFIX + api.printTemplate + `/${record?.id}`, {}).then((res) => {
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
      const { id, name, type, content } = record
        activeId = id
        formCreate.setFieldsValue({
          id, name, type, content
        })
        setType(type)
      } else {
        activeId = -1
        formCreate.resetFields();
        setType('')
      }
      setIsModalOpen(true);
  };

  const handleOk = () => {
    formCreate.validateFields().then(values => {
      console.log('values', values)

      setLoadingOk(true)
      const {name, type, content } = values
      let params = {name, type, content }
      let action = null
      let msg = ''
      let apiUrl = ''
      console.log('activeId', activeId)
      if (activeId !== -1) {
        action = http.put
        // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
        apiUrl = `${config.API_PREFIX}${api.printTemplate}`
        params.id = activeId
        msg = '修改成功！'
      } else {
        action = http.post
        apiUrl = `${config.API_PREFIX}${api.printTemplate}`
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
  useEffect(() => {
    http.get(config.API_PREFIX + api.printTemplateVariable, {}).then((res) => {
      console.log('res', res)
      const data = res?.bizData
      console.log('printTemplateVariable', data)
      setTplVariable(data)
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

    const {name, type} = formSearch.getFieldsValue()
    if (name) {
      params.name = name
    }
    if (type) {
      params.type = type
    }

    http.get(config.API_PREFIX + api.printTemplatePage, params).then((res) => {
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

  const [type, setType] = useState();
  const onTypeChange = (value) => {
    console.log('value', value)
    setType(value)
  }
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '基础设置'
        }, {
          title: '打印模板'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="模板名称" name="name">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="模板类型" name="type">
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[
                    {
                      value: 'itemUID',
                      label: '物料',
                    },
                    {
                      value: 'packaging',
                      label: '包装',
                    },
                  ]}
                />
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
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {showModal('create')}}>新增打印模板</Button>
          </div>
          <Table
            columns={columns}
            rowKey={(record) => record.categoryId}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            bordered
          />
        </div>
        <Modal title="新增/修改打印模板"
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
            style={{ padding: 16 }}
            form={formCreate}
            style={{ padding: 15, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="模板名称"
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

            <Form.Item
              label="模板类型"
              name="type"
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
                onChange={onTypeChange}
                options={[
                  {
                    value: 'itemUID',
                    label: '物料',
                  },
                  {
                    value: 'packaging',
                    label: '包装',
                  },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="模板内容"
              name="content"
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
              extra={
              <>
                <Button type="link" onClick={myDesign}>打印设计</Button>
                <div>{type ? tplVariable[type].map((item, index) => (
                  <React.Fragment key={index}>
                    {item}
                    {index !== tplVariable[type].length - 1 && <br />}
                  </React.Fragment>
                )) : ''}</div>
              </>
              }
            >
              <TextArea readOnly placeholder="请输入" rows={4} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
