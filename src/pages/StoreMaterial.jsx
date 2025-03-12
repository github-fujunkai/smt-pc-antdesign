import {
  DownloadOutlined,
  ExclamationCircleFilled,
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  Breadcrumb,
  Button,
  Col,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useState } from 'react';

import dayjs from 'dayjs';
import qs from 'qs';
import api from '../utils/api';
import { config } from '../utils/config';
import http from '../utils/http';
import { downloadCSV } from '../utils/util';

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
  const mslList = [
    { value: 1, label: '1' },
    { value: 2, label: '2' },
    { value: '2a', label: '2a' },
    { value: 3, label: '3' },
    { value: 4, label: '4' },
    { value: 5, label: '5' },
    { value: '5a', label: '5a' },
    { value: 6, label: '6' },
  ];
  const [barCodeList, setBarCodeList] = useState([]);
  const getBarCode = () => {
    http
      .get(config.API_PREFIX + api.barcodegenrulePage, {})
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;
        setBarCodeList(data?.records || []);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const [loadingDownload, setLoadingDownload] = useState(false);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);

  const loadTemplate = () => {
    // downloadCSV("ID,物料类型,物料外形,物料料号,物料规格,供应商,供应商料号,包装数量,物料湿敏等级,有效期（天数）,库位,备注\n1,tmpCategory_1,tmpShape_1,tmpCode_1,tmpSpec_1,tmpSupplier_1,tmpSupplierItemCode_1,1000,5a,180,tmpStorageLocation_1,tmpRemark_1\n2,tmp物料类型_2,tmp物料外形_2,tmp物料料号_2,tmp物料规格_2,tmp供应商_2,tmp供应商料号_2,3500,4,90,tmp库位_2,tmp备注_2", "物料信息导入模板-CSV文件");
    // return
    setLoadingDownload(true);
    http
      .post(config.API_PREFIX + 'basic/item/baseInfo/downloadTemplate', {})
      .then((res) => {
        downloadCSV(res, '物料信息导入模板-CSV文件');
        message.success('下载成功！');
        setLoadingDownload(false);
      })
      .catch((err) => {
        console.log(err);
        message.error('下载失败！');
        setLoadingDownload(false);
      });
  };

  const handleCustomRequest = ({ file, onSuccess, onError }) => {
    setLoadingUpload(true);
    // 创建一个 FormData 对象，用于构建包含文件的请求
    const formData = new FormData();
    formData.append('file', file);
    // formData.append("importType", 0); //导入新增一个数据？
    http
      .post(config.API_PREFIX + 'basic/item/baseInfo/importData', formData)
      .then((res) => {
        message.success('导入成功！');
        onSuccess(); // 通知 Ant Design Upload 组件上传成功
        setLoadingUpload(false);
        fetchData();
      })
      .catch((err) => {
        console.log(err);
        message.error('导入失败！');
        onError();
        setLoadingUpload(false);
      });
  };
  const [queryParams, setQueryParams] = useState(null);
  const [queryTotal, setQueryTotal] = useState(0);

  const exportData = () => {
    setLoadingExport(true);
    const query = qs.stringify({
      ...queryParams,
      current: 1,
      size: queryTotal,
    });
    http
      .post(config.API_PREFIX + 'basic/item/baseInfo/exportData' + `?${query}`)
      .then((res) => {
        message.success('导出成功！');
        downloadCSV(res, '物料信息导出-CSV文件');
        setLoadingExport(false);
      })
      .catch((err) => {
        console.log(err);
        message.error('导出失败！');
        setLoadingExport(false);
      });
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
  const [loadingOk, setLoadingOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formCreate] = Form.useForm();
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);

  const columns = [
    {
      title: '物料ID',
      dataIndex: 'id',
      // sorter: true,
      key: 'id',
    },
    {
      title: '料号',
      dataIndex: 'itemCode',
      // sorter: true,
      key: 'itemCode',
    },
    {
      title: '供应商料号',
      dataIndex: 'supplierItemCode',
      key: 'supplierItemCode',
    },
    {
      title: '物料描述',
      dataIndex: 'itemSpec',
      key: 'itemSpec',
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
    },
    {
      title: '包装数量',
      dataIndex: 'packageQty',
      key: 'packageQty',
    },
    {
      title: '物料类型',
      dataIndex: 'itemCategory',
      key: 'itemCategory',
    },
    {
      title: 'MSL',
      dataIndex: 'msl',
      key: 'msl',
    },
    {
      title: '有效期',
      dataIndex: 'shelfLife',
      key: 'shelfLife',
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
      title: '修改人',
      dataIndex: 'updateBy',
      key: 'updateBy',
    },
    {
      title: '标签模板',
      dataIndex: 'labelTemplateId',
      key: 'labelTemplateId',
    },
    {
      title: '库位',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
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
          .del(config.API_PREFIX + api.basicItemBaseInfo + `/${record?.id}`, {})
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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = (action, record) => {
    if (action === 'update' && record) {
      const {
        id,
        itemCode,
        itemSpec,
        supplier,
        supplierItemCode,
        packageQty,
        itemCategory,
        msl,
        shelfLife,
        storageLocation,
        uniqueCodeRuleId,
        labelTemplateId,
        remark,
      } = record;
      activeId = id;
      formCreate.setFieldsValue({
        itemCode,
        itemSpec,
        supplier,
        supplierItemCode,
        packageQty,
        itemCategory,
        msl,
        shelfLife,
        storageLocation,
        uniqueCodeRuleId,
        labelTemplateId,
        remark,
      });
    } else {
      activeId = -1;
      formCreate.resetFields();
    }
    setIsModalOpen(true);
    getBarCode();
  };

  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);

        setLoadingOk(true);
        // wtf
        const {
          itemCode,
          itemSpec,
          supplier,
          supplierItemCode,
          packageQty,
          itemCategory,
          msl,
          shelfLife,
          storageLocation,
          uniqueCodeRuleId,
          labelTemplateId,
          remark,
        } = values;
        let params = {
          itemCode,
          itemSpec,
          supplier,
          supplierItemCode,
          packageQty,
          itemCategory,
          msl,
          shelfLife,
          storageLocation,
          uniqueCodeRuleId,
          labelTemplateId,
          remark,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.put;
          // apiUrl = `${config.API_PREFIX}${api.printTemplate}/${activeId}`
          apiUrl = `${config.API_PREFIX}${api.basicItemBaseInfo}`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}${api.basicItemBaseInfo}`;
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
  const [tpls, setTpls] = useState([]);
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
      itemCode,
      supplierItemCode,
      supplier,
      packageQty,
      itemCategory,
      msl,
      shelfLife,
      storageLocation,
    } = formSearch.getFieldsValue();
    if (itemCode) {
      params.itemCode = itemCode;
    }
    if (supplierItemCode) {
      params.supplierItemCode = supplierItemCode;
    }
    if (supplier) {
      params.supplier = supplier;
    }
    if (packageQty) {
      params.packageQty = packageQty;
    }
    if (itemCategory) {
      params.itemCategory = itemCategory;
    }
    if (msl) {
      params.msl = msl;
    }
    if (shelfLife) {
      params.shelfLife = shelfLife;
    }
    if (storageLocation) {
      params.storageLocation = storageLocation;
    }
    setQueryParams(params);
    http
      .get(config.API_PREFIX + api.basicItemBaseInfoPage, params)
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
  const [imageUrl, setImageUrl] = useState();

  const myDesign = () => {
    let LODOP = window.getLodop();
    if (LODOP.CVERSION) {
      window.CLODOP.On_Return = function (TaskID, Value) {
        // document.getElementById('S1').value = Value;
        console.log('Value', Value);
        formCreate.setFieldValue('content', Value);
      };
    }
    // document.getElementById('S1').value = LODOP.PRINT_DESIGN();
    let tplContent = formCreate.getFieldValue('content');
    if (tplContent) {
      eval(tplContent);
    }
    const value = LODOP.PRINT_DESIGN();
    console.log('value', value);
  };

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: '仓库信息',
          },
          {
            title: '物料信息',
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
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
                <Form.Item label="供应商" name="supplier">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="包装数量" name="packageQty">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="物料类型" name="itemCategory">
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={[
                      {
                        value: '电子料',
                        label: '电子料',
                      },
                      {
                        value: '锡膏',
                        label: '锡膏',
                      },
                      {
                        value: '钢网',
                        label: '钢网',
                      },
                      {
                        value: '治具',
                        label: '治具',
                      },
                      {
                        value: '红胶',
                        label: '红胶',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="MSL" name="msl">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="有效期" name="shelfLife">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="库位" name="storageLocation">
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
          {/* <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => {showModal('create')}}>新增物料信息</Button>
          </div> */}
          <div
            style={{
              marginBottom: 16,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Space size="small">
              <Button
                loading={loadingDownload}
                onClick={loadTemplate}
                type="dashed"
                htmlType="button"
                icon={<FileExcelOutlined />}
              >
                下载模板
              </Button>
              <Upload
                maxCount={1}
                customRequest={handleCustomRequest} // 自定义上传逻辑
                showUploadList={false} // 隐藏默认的文件列表
              >
                <Button
                  loading={loadingUpload}
                  type="dashed"
                  htmlType="button"
                  icon={<UploadOutlined />}
                >
                  导入
                </Button>
              </Upload>
              <Button
                loading={loadingExport}
                onClick={exportData}
                type="dashed"
                htmlType="button"
                icon={<DownloadOutlined />}
              >
                导出
              </Button>
            </Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增物料信息
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
          title="新增/修改物料信息"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          okButtonProps={{
            disabled: loadingUpload,
          }}
          width={700}
        >
          <Form
            labelCol={{ span: 68 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="料号"
                  name="itemCode"
                  rules={[
                    {
                      required: true,
                      message: '请输入',
                    },
                  ]}
                >
                  <Input style={{ width: '100%' }} allowClear placeholder="请输入" />
                </Form.Item>

                <Form.Item
                  label="供应商"
                  name="supplier"
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
                  label="包装数量"
                  name="packageQty"
                  rules={[
                    {
                      required: true,
                      message: '请输入',
                    },
                  ]}
                >
                  <InputNumber style={{ width: '100%' }} allowClear placeholder="请输入" />
                </Form.Item>
                <Form.Item
                  label="MSL"
                  name="msl"
                  rules={[
                    {
                      required: false,
                      message: '请输入',
                    },
                  ]}
                >
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={mslList?.map((item) => ({
                      value: item.value,
                      label: item.label,
                    }))}
                  />
                </Form.Item>
                <Form.Item
                  label="库位"
                  name="storageLocation"
                  rules={[
                    {
                      required: false,
                      message: '请输入',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
                {/* <Form.Item
                  label="库存阈值"
                  name="xxxxx"
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
                  label="入库方式"
                  name="xxxxx"
                  rules={[
                    {
                      required: false,
                      message: '请输入',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入" />
                </Form.Item> */}
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
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="物料描述"
                  name="itemSpec"
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
                  label="供应商料号"
                  name="supplierItemCode"
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
                  label="物料类型"
                  name="itemCategory"
                  rules={[
                    {
                      required: false,
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
                        value: '电子料',
                        label: '电子料',
                      },
                      {
                        value: '锡膏',
                        label: '锡膏',
                      },
                      {
                        value: '钢网',
                        label: '钢网',
                      },
                      {
                        value: '治具',
                        label: '治具',
                      },
                      {
                        value: '红胶',
                        label: '红胶',
                      },
                    ]}
                  />
                </Form.Item>

                <Form.Item
                  label="有效期(天)"
                  name="shelfLife"
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
                  label="唯一码规则"
                  name="uniqueCodeRuleId"
                  rules={[
                    {
                      required: false,
                      message: '请输入',
                    },
                  ]}
                >
                  {/* <Input allowClear placeholder="请输入" /> */}
                  <Select
                    placeholder="请选择"
                    allowClear
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
                      required: false,
                      message: '请选择',
                    },
                  ]}
                >
                  <Select
                    placeholder="请选择"
                    allowClear
                    // fieldNames={{
                    //   label: 'name',
                    //   value: 'id'
                    // }}
                    options={tpls.map((item) => ({
                      label: `${item.name}（${item.type}）`,
                      value: item.id,
                    }))}
                  />
                </Form.Item>
                {/* <Form.Item
                  label="检验标准"
                  name="xxxxx"
                  rules={[
                    {
                      required: false,
                      message: '请输入',
                    },
                  ]}
                >
                  <Input allowClear placeholder="请输入" />
                </Form.Item> */}
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
