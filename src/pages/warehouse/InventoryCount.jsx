import {
  DownloadOutlined,
  ExclamationCircleFilled,
  PlusOutlined,
  RollbackOutlined,
  SearchOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header';
import '@minko-fe/use-antd-resizable-header/index.css';
import {
  Button,
  Col,
  DatePicker,
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
} from 'antd';
import dayjs from 'dayjs';
import qs from 'qs';
import { useEffect, useMemo, useState } from 'react';
import { config } from '../../utils/config';
import http from '../../utils/http';
import { downloadCSV } from '../../utils/util';
import WmsCount from './WmsCount';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;
let activeId1 = -1;

const App = () => {
  const [isShowSearch, setIsShowSearch] = useState(false);
  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked);
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
      title: '盘点单',
      dataIndex: 'inventoryCode',
      // sorter: true,
      key: 'inventoryCode',
      width: 180,
    },
    {
      title: '盘点类型',
      dataIndex: 'inventoryType',
      key: 'inventoryType',
      width: 130,
    },
    {
      title: '盘点内容',
      dataIndex: 'inventoryContent',
      key: 'inventoryContent',
      width: 130,
    },
    {
      title: '盘点人',
      dataIndex: 'approver',
      key: 'approver',
      width: 130,
    },
    {
      title: '确认人',
      dataIndex: 'approver',
      key: 'approver1',
      width: 130,
    },
    {
      title: '盘点状态',
      dataIndex: 'inventoryStatus',
      key: 'inventoryStatus',
      render: (_, record) => {
        return <>{record.inventoryStatus == 0 ? '新增' : '确认'}</>;
      },
      width: 130,
    },
    {
      title: '备注',
      dataIndex: 'remark',
      key: 'remark',
      width: 130,
    },
    {
      title: '盘点日期',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD');
      },
      width: 130,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => showModal('update', record)}>修改</Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
            <Typography.Link onClick={() => InventoryOrder(record)}>盘点</Typography.Link>
            <Typography.Link onClick={() => confirmOrder(record)}>确认</Typography.Link>
          </Space>
        );
      },
    },
  ]);
  const confirmOrder = (record) => {
    confirm({
      title: '确认',
      icon: <ExclamationCircleFilled />,
      content: '是否确认当前盘点单?',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'inventory/order/confirm?id=' + `${record?.id}`, {})
          .then((res) => {
            fetchData();
            message.success('确认成功！');
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
  const InventoryOrder = (record) => {
    confirm({
      title: '盘点',
      icon: <ExclamationCircleFilled />,
      content: '是否进行盘点?',
      onOk() {
        console.log('OK');
        http
          .del(
            config.API_PREFIX + 'inventory/order/inventory?inventoryOrderId=' + `${record?.id}`,
            {},
          )
          .then((res) => {
            fetchData();
            message.success('盘点成功！');
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
  const del = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'inventory/order' + `/${record?.id}`, {})
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
  // 生成单号
  const getAddOrder = () => {
    http
      .get(config.API_PREFIX + 'inventory/order/generateOrderNumber', {})
      .then((res) => {
        formCreate.setFieldValue('inventoryCode', res.bizData || '');
      })
      .catch((err) => {});
  };
  //新增盘点单
  const showModal = (action, record, confirm) => {
    if (action === 'update' && record) {
      const { id, inventoryCode, inventoryType, inventoryContent, approver, remark } = record;
      activeId = id;
      formCreate.setFieldsValue({
        inventoryCode,
        inventoryType,
        inventoryContent,
        approver,
        remark,
      });
    } else {
      activeId = -1;
      formCreate.resetFields();
      //新增窗口打开就去调用生成单号接口， 返回成功并且给了单号就用，没单号就手输入就行
      getAddOrder();
    }
    setIsModalOpen(true);
  };

  //新增/修改盘点单保存
  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);
        setLoadingOk(true);
        const { inventoryCode, inventoryType, inventoryContent, approver, remark } = values;
        let params = {
          inventoryCode,
          inventoryType,
          inventoryContent,
          approver,
          remark,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        console.log('activeId', activeId);
        if (activeId !== -1) {
          action = http.post;
          apiUrl = `${config.API_PREFIX}inventory/order`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}inventory/order`;
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
  const [WmsCountData, setWmsCountData] = useState();
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
      inventoryCode,
      inventoryType,
      inventoryContent,
      approver,
      lotNo,
      materialUid,
      storageLocation,
      startTime,
      endTime,
    } = formSearch.getFieldsValue();
    if (inventoryCode) {
      params.inventoryCode = inventoryCode;
    }
    if (inventoryType) {
      params.inventoryType = inventoryType;
    }
    if (inventoryContent) {
      params.inventoryContent = inventoryContent;
    }
    if (approver) {
      params.approver = approver;
    }
    if (materialUid) {
      params.materialUid = materialUid;
    }
    if (storageLocation) {
      params.storageLocation = storageLocation;
    }
    if (lotNo) {
      params.lotNo = lotNo;
    }
    if (startTime) {
      params.createTimeStart = startTime.format('YYYY-MM-DD 00:00:00');
    }
    if (endTime) {
      params.createTimeEnd = endTime.format('YYYY-MM-DD 00:00:00');
    }
    setWmsCountData(params);
    setQueryParams(params);
    http
      .get(config.API_PREFIX + 'inventory/order/page', params)
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

  const [loadingUpload, setLoadingUpload] = useState(false);

  const expandedRowRender = (record) => {
    console.log('record', record.inventoryOrderMaterialDetails);
    const columns1 = [
      {
        title: '料盘UID',
        dataIndex: 'materialUid',
        key: 'materialUid',
      },
      {
        title: '料号',
        dataIndex: 'itemCode',
        key: 'itemCode',
      },
      {
        title: '供应商料号',
        dataIndex: 'supplierItemCode',
        key: 'supplierItemCode',
      },
      {
        title: '物料描述',
        dataIndex: 'materialDescription',
        key: 'materialDescription',
      },
      {
        title: '数量',
        dataIndex: 'qty',
        key: 'qty',
      },
      {
        title: '盘点数量',
        dataIndex: 'inventoryQty',
        key: 'inventoryQty',
      },
      {
        title: '差异数量',
        dataIndex: 'differenceQty',
        key: 'differenceQty',
      },
      {
        title: '库位',
        dataIndex: 'storageLocation',
        key: 'storageLocation',
      },
      {
        title: '库位类型',
        dataIndex: 'storageLocationType',
        key: 'storageLocationType',
      },
      {
        title: '仓库',
        dataIndex: 'warehouse',
        key: 'warehouse',
      },
      {
        title: '已盘点',
        dataIndex: 'isInventory',
        key: 'isInventory',
      },
    ];
    return (
      <Table
        columns={columns1}
        dataSource={record?.inventoryOrderMaterialDetails || []}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        bordered
        style={{ margin: '10px 10px 10px 0' }}
        className="custom-table"
      />
    );
  };
  // 弹窗组件
  const [isCommonModal, setIsCommonModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState([]);
  const [selectedAction, setSelectedAction] = useState('');
  const showCommonModal = (action, record, confirm) => {
    console.log(action, action, confirm);
    setSelectedAction(action);
    setSelectedRow(record);
    setIsCommonModal(true);
  };
  const hideCommonModal = () => {
    setIsCommonModal(false);
  };
  // --------------------------------------------------------------------------------------------------------------------
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columns]),
    columnsState: {
      persistenceKey: 'localKeyMaterialInbound',
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
    localStorage.setItem('columnsInventoryCount', JSON.stringify(columns.map((col) => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsInventoryCount');
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
    localStorage.removeItem('columnsInventoryCount');
    message.success('复原成功！');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const [isSortableOpen, setIsSortableOpen] = useState(false);
  // 导入--------------------------------------------------------------------------------------------------------------------
  const [queryParams, setQueryParams] = useState(null);
  const [queryTotal, setQueryTotal] = useState(0);
  const [loadingExport, setLoadingExport] = useState(false);
  const exportData = () => {
    const query = qs.stringify({
      ...queryParams,
      current: 1,
      size: queryTotal,
    });
    http
      .post(config.API_PREFIX + 'inventory/order/exportData' + `?${query}`)
      .then((res) => {
        message.success('导出成功！');
        downloadCSV(res, '库存盘点导出-CSV文件');
        setLoadingExport(false);
      })
      .catch((err) => {
        console.log(err);
        message.error('导出失败！');
        setLoadingExport(false);
      });
  };
  return (
    <div className="content-wrapper  flex flex-col">
      <div className="content h-auto">
        <div className="tools">
          <Space size="middle">
            <Tooltip title={isShowSearch ? '隐藏搜索' : '显示搜索'}>
              <Switch
                onChange={onSearchChange}
                checkedChildren={<SearchOutlined />}
                unCheckedChildren={<SearchOutlined />}
              />
            </Tooltip>
            <Tooltip title="调整列顺序">
              <Button
                type="dashed"
                shape="round"
                size="small"
                icon={<SwapOutlined />}
                onClick={() => setIsSortableOpen(true)}
              />
            </Tooltip>
            <Tooltip title="复原列数据">
              <Button
                type="dashed"
                shape="round"
                size="small"
                icon={<RollbackOutlined />}
                onClick={() => refreshPage()}
              />
            </Tooltip>
          </Space>
        </div>
        <div className="search-wrapper" style={{ display: isShowSearch ? 'block' : 'none' }}>
          <Form form={formSearch} onFinish={onFinish}>
            <Row gutter="24">
              <Col span={8}>
                <Form.Item label="盘点单号" name="inventoryCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="盘点类型" name="inventoryType">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[
                      {
                        label: '库位',
                        value: '库位',
                      },
                      {
                        label: '料号',
                        value: '料号',
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="盘点内容" name="inventoryContent">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="盘点人" name="approver">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="料号" name="lotNo">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="原材UID" name="materialUid">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="库位" name="storageLocation">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="盘点日期（开始）" name="startTime">
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="盘点日期（结束）" name="endTime">
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
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
        <div className="table-wrapper  h-[40vh] overflow-auto">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              className="mr-2"
              loading={loadingExport}
              onClick={exportData}
              type="dashed"
              htmlType="button"
              icon={<DownloadOutlined />}
            >
              导出
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增盘点单
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
            expandable={{
              expandedRowRender,
              defaultExpandedRowKeys: ['0'],
              expandRowByClick: false,
            }}
          />
        </div>
        {/* 汇总方式 */}
        <WmsCount type={4} WmsCountData={WmsCountData} className=" h-[40vh]" />
        {/* 拖拽组件 */}
        <Modal
          title="调整列顺序（拖动排序）"
          open={isSortableOpen}
          footer={null}
          onOk={() => setIsSortableOpen(false)}
          onCancel={() => setIsSortableOpen(false)}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={columns.filter((col) => !col.fixed).map((item) => item.key)}>
              <Row gutter={16}>
                {columns
                  .filter((col) => !col.fixed)
                  .map((item) => (
                    <Col key={item.key} span={8}>
                      <SortableItem id={item.key} content={item.title} isDraggable={!item?.fixed} />
                    </Col>
                  ))}
              </Row>
            </SortableContext>
          </DndContext>
        </Modal>
        {/* 新增/修改盘点单 */}
        <Modal
          title="新增/修改盘点单"
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
              label="盘点单"
              name="inventoryCode"
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
              label="盘点类型"
              name="inventoryType"
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
                options={[
                  {
                    label: '库位',
                    value: '库位',
                  },
                  {
                    label: '料号',
                    value: '料号',
                  },
                ]}
              />
            </Form.Item>
            <Form.Item
              label="盘点内容"
              name="inventoryContent"
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
              label="盘点人"
              name="approver"
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
        {/* 录入 下架 补发 扫描 */}
        <CommonModal
          isCommonModal={isCommonModal}
          selectedRow={selectedRow}
          selectedAction={selectedAction}
          onClose={() => {
            hideCommonModal();
          }}
        />
      </div>
    </div>
  );
};

// 录入---弃用了
const CommonModal = (props) => {
  //selectedAction create 录入   reissue补发 scan扫描
  const { isCommonModal, selectedAction, selectedRow, onClose } = props;
  const [form] = Form.useForm();
  const options = {
    stocktaking: '盘点',
    confirm: '确认',
  };
  const onCancel = () => {
    onClose();
  };
  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        console.log(values);
        if (selectedAction === 'stocktaking') {
          let url = '';
          if (selectedAction === 'stocktaking') {
            url = `inventory/order/inventory`;
          }
          http
            .get(
              config.API_PREFIX +
                url +
                `?${qs.stringify({
                  itemCode: form.getFieldValue('itemCode'),
                  inventoryOrderId: selectedRow.id,
                })}`,
              {},
            )
            .then((res) => {})
            .catch((err) => {});
        }
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };
  return (
    <Modal
      open={isCommonModal}
      title={options[selectedAction]}
      okText="确认"
      cancelText="取消"
      onCancel={() => {
        onCancel();
      }}
      onOk={() => {
        onFinish();
      }}
    >
      <Form
        form={form}
        layout="vertical"
        labelCol={{ span: 6 }}
        style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
        autoComplete="off"
      >
        {selectedAction === 'stocktaking' && (
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
            <Input allowClear placeholder="请输入" />
          </Form.Item>
        )}
      </Form>
    </Modal>
  );
};
export default App;
