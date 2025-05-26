import {
  DownloadOutlined,
  ExclamationCircleFilled,
  FileExcelOutlined,
  PlusOutlined,
  SearchOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header';
import '@minko-fe/use-antd-resizable-header/index.css';
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
  Switch,
  Table,
  Tooltip,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';

import api from '@/utils/api';
import { config } from '@/utils/config';
import http from '@/utils/http';
import { downloadCSV, getDictionaryListByCode } from '@/utils/util';
import dayjs from 'dayjs';
import qs from 'qs';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;

const App = () => {
  const [isShowSearch, setIsShowSearch] = useState(false);
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
  };
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
    // downloadCSV("ID,物料类型,物料外形,物料料号,物料规格,供应商,供应商料号,包装数量,物料湿敏等级,有效期（天数）,库位,备注\n1,tmpCategory_1,tmpShape_1,tmpCode_1,tmpSpec_1,tmpSupplier_1,tmpinspectionLevel_1,1000,5a,180,tmpStorageLocation_1,tmpRemark_1\n2,tmp物料类型_2,tmp物料外形_2,tmp物料料号_2,tmp物料规格_2,tmp供应商_2,tmp供应商料号_2,3500,4,90,tmp库位_2,tmp备注_2", "检验方案导入模板-CSV文件");
    // return
    setLoadingDownload(true);
    http
      .post(config.API_PREFIX + 'qc/quality/inspection-plan/downloadTemplate', {})
      .then((res) => {
        downloadCSV(res, '检验方案导入模板-CSV文件');
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
    formData.append('importType', 1); //导入类型：1.提示；2.覆盖；3.忽略
    http
      .post(config.API_PREFIX + 'qc/quality/inspection-plan/importData', formData)
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
      .post(config.API_PREFIX + 'qc/quality/inspection-plan/exportData' + `?${query}`)
      .then((res) => {
        message.success('导出成功！');
        downloadCSV(res, '检验方案导出-CSV文件');
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

  const [columns, setColumns] = useState([
    {
      title: '检验方案',
      dataIndex: 'planName',
      key: 'planName',
      width: 120,
    },
    {
      title: '检验阶别',
      dataIndex: 'inspectionLevel',
      key: 'inspectionLevel',
      width: 120,
    },
    {
      title: '检验项',
      dataIndex: 'inspectionItems',
      key: 'inspectionItems',
      width: 120,
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
  ]);
  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        http
          .del(config.API_PREFIX + 'qc/quality/inspection-plan' + `/${record?.id}`, {})
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
      const { id, planName, inspectionItems, inspectionLevel } = record;
      activeId = id;
      formCreate.setFieldsValue({
        planName,
        inspectionItems: inspectionItems.split(','),
        inspectionLevel,
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
        // console.log('values', values);
        setLoadingOk(true);
        const { planName, inspectionItems, inspectionLevel } = values;
        let params = {
          planName,
          inspectionItems: inspectionItems ? inspectionItems.join(',') : '',
          inspectionLevel,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        if (activeId !== -1) {
          action = http.post;
          apiUrl = `${config.API_PREFIX}qc/quality/inspection-plan/saveOrUpdate`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}qc/quality/inspection-plan/saveOrUpdate`;
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

    const { planName, inspectionLevel } = formSearch.getFieldsValue();
    if (planName) {
      params.planName = planName;
    }
    if (inspectionLevel) {
      params.inspectionLevel = inspectionLevel;
    }

    setQueryParams(params);
    http
      .get(config.API_PREFIX + 'qc/quality/inspection-plan/page', params)
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

  // --------------------------------------------------------------------------------------------------------------------
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columns]),
    columnsState: {
      persistenceKey: 'localKeyInspectionScheme',
      persistenceType: 'localStorage',
    },
  });

  // 可拖动的单个项目组件
  function SortableItem({ id, content, isDraggable }) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
      id: id,
      disabled: !isDraggable, // 使用 disabled 属性来控制是否可以拖动
    });

    const style = {
      transform: `translate3d(${transform?.x}px, ${transform?.y}px, 0)`,
      transition,
      // 如果不可拖动，可以添加不同的样式或逻辑
      opacity: isDraggable ? 1 : 0.5,
      cursor: isDraggable ? 'grab' : 'not-allowed',
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        {content}
      </div>
    );
  }

  // 定义传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: verticalListSortingStrategy,
    }),
  );

  // 拖放逻辑处理函数
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = columns.findIndex((col) => col.key === active.id);
      const newIndex = columns.findIndex((col) => col.key === over.id);

      if (oldIndex !== newIndex) {
        setColumns((prevColumns) => {
          const updatedColumns = Array.from(prevColumns);
          const [movedColumn] = updatedColumns.splice(oldIndex, 1);
          updatedColumns.splice(newIndex, 0, movedColumn);

          // 保存新的列顺序
          saveColumnsOrder(updatedColumns);

          return updatedColumns;
        });
      }
    } else {
      // 如果没有有效的放置目标，强制更新状态以触发重渲染
      setColumns((prevItems) => [...prevItems]);
    }
  };

  const saveColumnsOrder = (columns) => {
    localStorage.setItem('columnsInspectionScheme', JSON.stringify(columns.map((col) => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsInspectionScheme');
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      const orderedColumns = order
        .map((key) => columns.find((col) => col.key === key))
        .filter(Boolean);
      setColumns(orderedColumns);
    }
    // 其他初始化逻辑...
  }, []);
  function refreshPage() {
    localStorage.removeItem('columnsInspectionScheme');
    message.success('复原成功！');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const [isSortableOpen, setIsSortableOpen] = useState(false);
  // --------------------------------------------------------------------------------------------------------------------
  return (
    <div className="content-wrapper">
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
                <Form.Item label="检验方案" name="planName">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="检验阶别" name="inspectionLevel">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? '')
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? '').toLowerCase())
                    }
                    options={getDictionaryListByCode('41')}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="检验项" name="inspectionLevel">
                  <Select
                    mode="multiple"
                    placeholder="inspectionItems"
                    allowClear
                    showSearch
                    optionFilterProp="label"
                    filterSort={(optionA, optionB) =>
                      (optionA?.label ?? '')
                        .toLowerCase()
                        .localeCompare((optionB?.label ?? '').toLowerCase())
                    }
                    options={getDictionaryListByCode('40')}
                  />
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
              新增检验方案
            </Button>
          </div>
          <Table
            columns={resizableColumns}
            components={components}
            scroll={{ x: tableWidth }}
            rowKey={(record) => record.id}
            dataSource={data}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            loading={loading}
            bordered
          />
        </div>
        <Modal
          title="新增/修改检验方案"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          okButtonProps={{
            disabled: loadingUpload,
          }}
          width={500}
        >
          <Form
            labelCol={{ span: 68 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="检验方案"
              name="planName"
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
              label="检验阶别"
              name="inspectionLevel"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Select
                placeholder="请选择"
                allowClear
                showSearch
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '')
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={getDictionaryListByCode('41')}
              />
            </Form.Item>
            <Form.Item
              label="检验项"
              name="inspectionItems"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Select
                mode="multiple"
                placeholder="请选择"
                allowClear
                showSearch
                optionFilterProp="label"
                filterSort={(optionA, optionB) =>
                  (optionA?.label ?? '')
                    .toLowerCase()
                    .localeCompare((optionB?.label ?? '').toLowerCase())
                }
                options={getDictionaryListByCode('40')}
              />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default App;
