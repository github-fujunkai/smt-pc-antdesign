import React, { useState, useEffect } from 'react';
import { Switch, Modal, Breadcrumb, Form, Row, Col, Select, Upload, Input, Space, Button, InputNumber, Popconfirm, Table, Typography, message } from 'antd';
import { SearchOutlined, ExclamationCircleFilled, PlusOutlined, UploadOutlined, DownloadOutlined, FileExcelOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
import qs from 'qs';
import { downloadCSV } from '../utils/util';

const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const App = () => {
  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);

  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [queryParams, setQueryParams] = useState(null);
  const [queryTotal, setQueryTotal] = useState(0);

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const paginationInit = {
    pagination: {
      current: 1,
      pageSize: 10,
      showQuickJumper: true,
      showTotal, showSizeChanger: true,
    },
  }

  const [tableParams, setTableParams] = useState(paginationInit);

  const showModal = () => {
    setIsModalOpen(true);
  };

  // 新增
  const handleOk = () => {
    formCreate.validateFields().then(values => {
      console.log('values', values)

      setLoadingOk(true)
      const { projectNo, mainItem, replaceItem } = values
      
      http.post(config.API_PREFIX + api.itemReplaceProject, {
        projectNo,
        mainItem,
        replaceItem,
        isValid: 'Y', // todo 默认咋搞？
      }).then((res) => {
        formCreate.resetFields();
        setLoadingOk(false)
        setIsModalOpen(false);
        fetchData()
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
  const { confirm } = Modal;
  const [formUpdate] = Form.useForm();
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingId, setEditingId] = useState('');
  const isEditing = (record) => record.id === editingId;
  const edit = (record) => {
    console.log('record', record)
    formUpdate.setFieldsValue({
      mainItem: '',
      replaceItem: '',
      // address: '',
      ...record,
    });
    setEditingId(record.id);
  };
  const cancel = () => {
    setEditingId('');
  };
  const save = async (key) => {
    try {
      const row = await formUpdate.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.id);
      if (index > -1) {
        const item = newData[index];
        const updatedItem = {
          ...item,
          ...row,
        }
        newData.splice(index, 1, updatedItem);

        http.put(config.API_PREFIX + api.itemReplaceProject, {
          id: item.id,
          ...updatedItem,
        }).then((res) => {
          setData(newData);
          setEditingId('');
          message.success('修改成功！');
        }).catch(err => {
          console.log(err)
        })
      } else {
        newData.push(row);
        setData(newData);
        setEditingId('');
      }
      console.log('newData', newData)
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  /* temp
    setTableParams({
      ...tableParams,
      pagination: {
        ...tableParams.pagination,
        current: 1,
      },
    });
  */
  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '记录删除后无法恢复，是否仍要删除？',
      onOk() {
        http.del(config.API_PREFIX + api.itemReplaceProject + `/${record.id}`, {}).then((res) => {
          fetchData()
          message.success('删除成功！');
        }).catch(err => {
          console.log(err)
        })
      },
      onCancel() {
      },
    });
  };
  const columns = [
    {
      title: '启用',
      dataIndex: 'isValid',
      editable: false,
      render: (_, record) => {
        return (
          <Switch loading={record.loading} checked={record.isValid === 'Y' ? true : false} onChange={checked => handleSwitchChange(checked, record)} />
        )
      }
    },
    {
      title: '工单号',
      dataIndex: 'projectNo',
      editable: true,
    },
    {
      title: '主料号',
      dataIndex: 'mainItem',
      editable: true,
    },
    {
      title: '替代料号',
      dataIndex: 'replaceItem',
      editable: true,
    },
    {
      title: '配置时间',
      dataIndex: 'createTime',
      editable: false,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => save(record.id)}
              style={{
                marginRight: 8,
              }}
            >
              保存
            </Typography.Link>
            <Popconfirm title="您确定要取消吗？" onConfirm={cancel}>
              <a>取消</a>
            </Popconfirm>
          </span>
        ) : (
          <Space>
            <Typography.Link disabled={editingId !== ''} onClick={() => edit(record)}>
              修改
            </Typography.Link>
            <Typography.Link disabled={editingId !== ''} onClick={() => del(record)}>
              删除
            </Typography.Link>
          </Space>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });
  
  const fetchData = () => {
    setLoading(true);
    const {
      order,
      field,
      pagination: { current, pageSize }
    } = tableParams;

    let params = {
      current,
      size: pageSize,
    }
    params['orders[0].column'] = 'id'
    params['orders[0].asc'] = false
    console.log(order, field) // ascend id
    if (order && field) {
      // 举例：
      // orders[0].column: id
      // orders[0].asc: true
      params['orders[0].column'] = field
      params['orders[0].asc'] = order === 'ascend' ? true : false
    }

    const {projectNo, mainItem, replaceItem} = formSearch.getFieldsValue()
    if (projectNo) {
      params.projectNo = projectNo
    }
    if (mainItem) {
      params.mainItem = mainItem
    }
    if (replaceItem) {
      params.replaceItem = replaceItem
    }

    setQueryParams(params)

    http.post(config.API_PREFIX + api.itemReplaceProjectPage + `?${qs.stringify(params)}`, {}).then((res) => {
      const data = res?.bizData
      setQueryTotal(data?.total)
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
    console.log('handleTableChange pagination: ', pagination)
    setTableParams({
      pagination,
      filters,
      ...sorter,
    });

    // `dataSource` is useless since `pageSize` changed
    if (pagination.pageSize !== tableParams.pagination?.pageSize) {
      setData([]);
    }
  };

  const handleSwitchChange = (checked, record) => {
    // console.log(checked, record)
    const updatedData = data.map((item) =>
      item.id === record.id ? {
        ...item,
        loading: true
      } : item
    );
    setData(updatedData);

    http.put(config.API_PREFIX + api.itemReplaceCurrency, {
      id: record?.id,
      isValid: record?.isValid === 'Y' ? 'N' : 'Y',
    }).then((res) => {
      const updatedData = data.map((item) =>
        item.id === record.id ? {
          ...item,
          isValid: item.isValid === 'Y' ? 'N' : 'Y',
          loading: false
        } : item
      );
      setData(updatedData);
      message.success('修改成功！');
    }).catch(err => {
      console.log(err)
    })
  }

  const onFinish = () => {
    setTableParams(paginationInit);
  }

  const resetFormSearch = () => {
    formSearch.resetFields();
    setTableParams(paginationInit);
  }

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);

  const loadTemplate = () => {
    setLoadingDownload(true)
    http.post(config.API_PREFIX + api.itemReplaceProjectLoadTemplate, {
    }).then((res) => {
      downloadCSV(res, '通用替代料导入模板-CSV文件')
      message.success('下载成功！')
      setLoadingDownload(false)
    }).catch(err => {
      console.log(err)
      message.error('下载失败！')
      setLoadingDownload(false)
    })
  }

  const handleCustomRequest = ({ file, onSuccess, onError }) => {
    setLoadingUpload(true)
    // 创建一个 FormData 对象，用于构建包含文件的请求
    const formData = new FormData();
    formData.append('file', file);

    http.post(config.API_PREFIX + api.itemReplaceProjectImportData, formData).then((res) => {
      message.success('导入成功！')
      onSuccess() // 通知 Ant Design Upload 组件上传成功
      setLoadingUpload(false)
      fetchData()
    }).catch(err => {
      console.log(err)
      message.error('导入失败！')
      onError()
      setLoadingUpload(false)
    })
  };

  // const query = qs.stringify({
  //   current: 1,
  //   size: 100,
  // })
  const exportData = () => {
    setLoadingExport(true)
    const query = qs.stringify({
      ...queryParams,
      current: 1,
      size: queryTotal,
    })
    http.post(config.API_PREFIX + api.itemReplaceProjectExportData + `?${query}`, ).then((res) => {
      message.success('导出成功！')
      downloadCSV(res, '工单替代料导出-CSV文件')
      setLoadingExport(false)
    }).catch(err => {
      console.log(err)
      message.error('导出失败！')
      setLoadingExport(false)
    })
  }

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '替代物料'
        }, {
          title: '工单替代料'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                {/* <Form.Item label="工单号">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={[{
                      value: '1',
                      label: '选择1'
                    }, {
                      value: '2',
                      label: '选择2'
                    }, {
                      value: '3',
                      label: '选择3'
                    }]}
                  />
                </Form.Item> */}
                <Form.Item label="工单号" name="projectNo">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="主料号" name="mainItem">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="替代料号" name="replaceItem">
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
          <div style={{marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <Space size="small">
              <Button loading={loadingDownload} onClick={loadTemplate} type="dashed" htmlType="button" icon={<FileExcelOutlined />}>下载模板</Button>
              <Upload
                maxCount={1}
                customRequest={handleCustomRequest} // 自定义上传逻辑
                showUploadList={false} // 隐藏默认的文件列表
              >
                <Button loading={loadingUpload} type="dashed" htmlType="button" icon={<UploadOutlined />}>导入</Button>
              </Upload>
              <Button loading={loadingExport} onClick={exportData} type="dashed" htmlType="button" icon={<DownloadOutlined />}>导出</Button>
            </Space>
            <Button type="primary" icon={<PlusOutlined />}  onClick={showModal}>新增程序替代料</Button>
          </div>
          <Form form={formUpdate} component={false}>
            <Table
              columns={mergedColumns}
              rowKey={(record) => record.id}
              dataSource={data}
              pagination={tableParams.pagination}
              loading={loading}
              onChange={handleTableChange}
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              bordered
              rowClassName="editable-row"
            />
          </Form>
        </div>
      </div>
      <Modal confirmLoading={loadingOk} title="新增程序替代料" open={isModalOpen} onOk={handleOk} onCancel={handleCancel}>
        <Form
          labelCol={{ span: 5 }}
          style={{padding: 32}}
          form={formCreate}
        >
          <Form.Item
            label="工单"
            name="projectNo"
            rules={[{ required: true, message: '请输入工单' }]}
          >
            <Input placeholder="请输入工单" />
          </Form.Item>
          <Form.Item
            label="主料号"
            name="mainItem"
            rules={[{ required: true, message: '请输入主料号' }]}
          >
            <Input allowClear placeholder="请输入主料号" />
          </Form.Item>
          <Form.Item
            label="替代料号"
            name="replaceItem"
            rules={[{ required: true, message: '请输入替代料号' }]}
            extra="料号存在多项时，以半角逗号分隔"
          >
            <Input.TextArea allowClear placeholder="请输入替代料号" autoSize={{ minRows: 3 }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default App;