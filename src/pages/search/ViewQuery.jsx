import { ExclamationCircleFilled, PlusOutlined, SearchOutlined } from '@ant-design/icons';
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
} from 'antd';
import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import { config } from '../../utils/config';
import http from '../../utils/http';
import {convertEmptyValuesToUndefined} from '../../utils/util'
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


  const [columns, setColumns] = useState([
 
  ]);
  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'sys/params' + `/${record?.id}`, {})
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
      const { id, dictKey, dictValue, dictType } = record;
      activeId = id;
      formCreate.setFieldsValue({
        id,
        dictKey,
        dictValue,
        dictType,
      });
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

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const showTotal = (total, range) => {
    return `总共 ${total} 条记录，当前显示 ${range[0]}-${range[1]}`;
  };

  const [tableParams, setTableParams] = useState({ ...paginationInit });
  const [typeList, setTypeList] = useState([]);
  useEffect(() => {
    // 获取视图类型
    http
    .get(config.API_PREFIX + 'dict/view/list', {})
    .then((res) => {
      setTypeList(res?.bizData.map(item => ({
        label: item.dictValue,
        value: item.dictKey
      })) || []);
      formSearch.setFieldsValue({ dictType: res?.bizData[0]?.dictKey });
      fetchData();
    })
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
   
    const {dictType} = formSearch.getFieldsValue();
 
    http.post(config.API_PREFIX + `view/show?current=${current}&size=${pageSize}&viewName=${dictType}`, {
      ...convertEmptyValuesToUndefined(formSearch.getFieldsValue()),dictType:undefined
          })
          .then((res) => {
            const data = res?.bizData;
            setColumns(data?.viewColumns.map(item => ({
              title: item,
              dataIndex: item,
              key: item,
            })
            ) || []);
            setData(data?.viewData?.records || []);
            setLoading(false);
            setTableParams({
              ...tableParams,
              pagination: {
                ...tableParams.pagination,
                total: data?.viewData?.total,
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

  return (
    <div className="content-wrapper">
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="视图类型" name="dictType">
                  <Select placeholder="请选择" allowClear showSearch options={typeList} />
                </Form.Item>
              </Col>
              {
                columns&&columns.map((item, index) => {
                  return (
                    <Col span={8} key={index}>
                      <Form.Item label={item.title} name={item.dataIndex}>
                        <Input placeholder="请输入" allowClear/>
                      </Form.Item>
                    </Col>
                  )
                })
              }
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
          {/* <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增
            </Button>
          </div> */}
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
            labelCol={{ span: 8 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="视图名称"
              name="dictKey"
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
              label="视图值"
              name="dictValue"
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
              label="视图类型"
              name="dictType"
              rules={[
                {
                  required: true,
                  message: '视图类型',
                },
              ]}
            >
              <Select placeholder="请选择" allowClear showSearch options={typeList} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
