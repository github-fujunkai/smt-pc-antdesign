import {
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
  InputNumber,
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
import { useEffect, useMemo, useRef, useState } from 'react';
import api from '../../utils/api';
import { config } from '../../utils/config';
import http from '../../utils/http';
import WmsCount from './WmsCount';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;
let activeId1 = -1;
let activeId2 = -1;
let action2 = '';

// 工单状态
const statusObj = {
  0: '新建',
  1: '下达',
  2: '执行',
  3: '挂起',
  4: '结单',
  5: '取消',
};

// 工单类型
const lotNoObj = {
  0: '量产',
  1: '试产',
  2: '制样',
};

// 制令单状态：0.新建，1.投产，2.挂起，3.结单
const statusObj1 = {
  0: '新建',
  1: '投产',
  2: '挂起',
  3: '接单',
};

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
      title: '入库单',
      dataIndex: 'inboundOrderNumber',
      // sorter: true,
      key: 'inboundOrderNumber',
      width: 100,
    },
    {
      title: '采购单',
      dataIndex: 'purchaseOrderNumber',
      key: 'purchaseOrderNumber',
      width: 100,
    },
    {
      title: '送货单',
      dataIndex: 'deliveryOrder',
      key: 'deliveryOrder',
      width: 100,
    },
    {
      title: '供应商',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 100,
    },
    {
      title: '送货人',
      dataIndex: 'shipper',
      key: 'shipper',
      width: 100,
    },
    // {
    //   title: "客户",
    //   dataIndex: "xxxxx",
    //   key: "xxxxx",
    // },
    {
      title: '仓库',
      dataIndex: 'storageLocation',
      key: 'storageLocation',
      width: 100,
    },
    {
      title: '确认人',
      dataIndex: 'approver',
      key: 'approver',
      width: 100,
    },
    {
      title: '入库人',
      dataIndex: 'receiver',
      key: 'receiver',
      width: 100,
    },
    {
      title: '入库单状态',
      dataIndex: 'inboundStatus',
      key: 'inboundStatus',
      render: (_, record) => {
        return record.inboundStatus === 0 ? '新增' : '确认';
      },
      width: 100,
    },
    {
      title: '入库类型',
      dataIndex: 'inboundType',
      key: 'inboundType',
      render: (_, record) => {
        return record.inboundType === 1
          ? '采购入库'
          : record.inboundType === 2
          ? '客户供料'
          : '产线退库';
      },
      width: 100,
    },
    {
      title: '入库日期',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD');
      },
      width: 100,
    },
    {
      title: '操作',
      dataIndex: 'operation',
      fixed: 'right',
      render: (_, record) => {
        return (
          <Space>
            <Typography.Link onClick={() => handlePrint('create', record)}>录入</Typography.Link>
            <Typography.Link onClick={() => showModal('update', record)}>修改</Typography.Link>
            <Typography.Link onClick={() => del(record)}>删除</Typography.Link>
            <Typography.Link onClick={() => showModal('update', record, true)}>
              确认
            </Typography.Link>
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
        console.log('OK');
        http
          .del(config.API_PREFIX + 'inbound/order' + `/${record?.id}`, {})
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

  const del2 = (record) => {
    confirm({
      title: '删除确认',
      icon: <ExclamationCircleFilled />,
      content: '删除后无法恢复，请确认是否删除！',
      onOk() {
        console.log('OK');
        http
          .del(config.API_PREFIX + 'inbound/order/detail' + `/${record?.id}`, {})
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
  const [isConfirm, setIsConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 生成单号
  const getAddOrder = () => {
    http
      .get(config.API_PREFIX + 'inbound/order/generateOrderNumber', {})
      .then((res) => {
        formCreate.setFieldValue('inboundOrderNumber', res.bizData || '');
      })
      .catch((err) => {});
  };
  //新增入库单
  const showModal = (action, record, confirm) => {
    if (action === 'update' && record) {
      const {
        id,
        inboundOrderNumber,
        supplier,
        purchaseOrderNumber,
        deliveryOrder,
        quantity,
        shipper,
        receiver,
        inboundType,
        remark,
      } = record;
      activeId = id;
      formCreate.setFieldsValue({
        inboundOrderNumber,
        supplier,
        purchaseOrderNumber,
        deliveryOrder,
        quantity,
        shipper,
        receiver,
        inboundType,
        remark,
      });
      setIsConfirm(confirm || false);
    } else {
      activeId = -1;
      formCreate.resetFields();
      //新增窗口打开就去调用生成单号接口， 返回成功并且给了单号就用，没单号就手输入就行
      getAddOrder();
    }
    setIsModalOpen(true);
  };

  const [isModalOpen1, setIsModalOpen1] = useState(false);
  const [isAddOrPrint, setIsAddOrPrint] = useState('create');
  const [isPrintData, setIsPrintData] = useState({});
  const handlePrint = (action, record) => {
    setIsAddOrPrint(action);
    setIsPrintData(record);
    activeId1 = record.id;
    console.log('action', action, record);
    if (action == 'create') {
      setIsModalOpen1(true);
    }
  };

  //新增/修改入库单保存
  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);
        setLoadingOk(true);
        // wtf
        const {
          inboundOrderNumber,
          purchaseOrderNumber,
          inboundType,
          quantity,
          receiver,
          shipper,
          remark,
          deliveryOrder,
          supplier,
        } = values;
        let params = {
          inboundOrderNumber,
          purchaseOrderNumber,
          inboundType,
          quantity,
          receiver,
          shipper,
          remark,
          deliveryOrder,
          supplier,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        if (activeId !== -1) {
          action = http.post;
          apiUrl = `${config.API_PREFIX}inbound/order`;
          params.id = activeId;
          // 如果是确认增加确认人
          if (isConfirm) {
            params.inboundStatus = 1;
            params.approver = localStorage.getItem('username');
          }
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}inbound/order`;
          msg = '新增成功！';
        }
        console.log('paramsparamsparamsparamsparamsparams', params, isConfirm);
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
      inboundOrderNumber,
      purchaseOrderNumber,
      supplier,
      itemCode,
      status,
      lotNo,
      startTime,
      endTime,
      materialUid,
      inboundType,
      inboundStatus,
      receiver,
    } = formSearch.getFieldsValue();
    if (inboundType) {
      params.inboundType = inboundType;
    }
    if (inboundStatus || inboundStatus === 0) {
      params.inboundStatus = inboundStatus;
    }
    if (receiver) {
      params.receiver = receiver;
    }
    if (inboundOrderNumber) {
      params.inboundOrderNumber = inboundOrderNumber;
    }
    if (purchaseOrderNumber) {
      params.purchaseOrderNumber = purchaseOrderNumber;
    }
    if (supplier) {
      params.supplier = supplier;
    }
    if (itemCode) {
      params.childItemCode = itemCode;
    }
    if (status) {
      params.status = status;
    }
    if (lotNo) {
      params.childBatchNumber = lotNo;
    }
    if (materialUid) {
      params.childMaterialUid = materialUid;
    }
    if (startTime) {
      params.createTimeStart = startTime.format('YYYY-MM-DD 00:00:00');
    }
    if (endTime) {
      params.createTimeEnd = endTime.format('YYYY-MM-DD 00:00:00');
    }
    console.log('inboundStatus', params);
    // 传到wms汇总
    setWmsCountData(params);
    http
      .get(config.API_PREFIX + 'inbound/order/page', params)
      .then((res) => {
        console.log('res', res);
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

  const [loadingUpload, setLoadingUpload] = useState(false);

  const expandedRowRender = (record) => {
    console.log('record', record.details);
    const columns1 = [
      {
        title: '原材UID',
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
        title: '批次号',
        dataIndex: 'lotNo',
        key: 'lotNo',
      },
      {
        title: '包装数量',
        dataIndex: 'packageQty',
        key: 'packageQty',
      },
      {
        title: '入库数量',
        dataIndex: 'inboundQty',
        key: 'inboundQty',
      },
      {
        title: 'DateCode',
        dataIndex: 'dateCode',
        key: 'dateCode',
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
        dataIndex: 'expirationDate',
        key: 'expirationDate',
      },
      {
        title: '库位',
        dataIndex: 'storageLocation',
        key: 'storageLocation',
      },
      {
        title: '创建日期',
        dataIndex: 'createTime',
        key: 'createTime',
      },
      {
        title: '操作员',
        dataIndex: 'updateBy',
        key: 'updateBy',
      },
      {
        title: '操作',
        key: 'operation',
        fixed: 'right',
        render: (_, record) => {
          return (
            <Space>
              <Typography.Link onClick={() => handlePrint('update', record)}>打印</Typography.Link>
              <Typography.Link onClick={() => del2(record)}>删除</Typography.Link>
            </Space>
          );
        },
      },
    ];
    return (
      <Table
        columns={columns1}
        dataSource={record?.details || []}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        bordered
        style={{ margin: '10px 10px 10px 0' }}
        className="custom-table"
      />
    );
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
    localStorage.setItem('columnsMaterialInbound', JSON.stringify(columns.map((col) => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsMaterialInbound');
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
    localStorage.removeItem('columnsMaterialInbound');
    message.success('复原成功！');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const [isSortableOpen, setIsSortableOpen] = useState(false);
  // --------------------------------------------------------------------------------------------------------------------
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
                <Form.Item label="入库单" name="inboundOrderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="采购单" name="purchaseOrderNumber">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="供应商" name="supplier">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="料号" name="itemCode">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="批次号" name="lotNo">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="原材UID" name="materialUid">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库类型" name="inboundType">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[
                      {
                        label: '采购入库',
                        value: 1,
                      },
                      {
                        label: '客户供料',
                        value: 2,
                      },
                      {
                        label: '产线退库',
                        value: 3,
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库单状态" name="inboundStatus">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={[
                      {
                        label: '新增',
                        value: 0,
                      },
                      {
                        label: '确认',
                        value: 1,
                      },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库人" name="receiver">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库日期（开始）" name="startTime">
                  <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="入库日期（结束）" name="endTime">
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
        <div className="table-wrapper h-[40vh] overflow-auto">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增入库单
            </Button>
          </div>

          {/* columns={columns} */}
          {/* scroll={{ x: "max-content" }} */}
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
        <WmsCount type={1} WmsCountData={WmsCountData} className="h-[40vh]" />
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
        {/* 新增/修改入库单 */}
        <Modal
          title="新增/修改入库单"
          open={isModalOpen}
          onOk={handleOk}
          onCancel={handleCancel}
          confirmLoading={loadingOk}
          okButtonProps={{
            disabled: loadingUpload,
          }}
        >
          <Form
            labelCol={{ span: 8 }}
            form={formCreate}
            style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
          >
            <Form.Item
              label="入库单"
              name="inboundOrderNumber"
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
              label="供应商"
              name="supplier"
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
              label="采购单"
              name="purchaseOrderNumber"
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
              label="送货单"
              name="deliveryOrder"
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
              label="来料数量"
              name="quantity"
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
              label="送货人"
              name="shipper"
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
              label="入库人"
              name="receiver"
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
              label="入库类型"
              name="inboundType"
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
                    value: 1,
                    label: '采购入库',
                  },
                  {
                    value: 2,
                    label: '客户供料',
                  },
                  {
                    value: 3,
                    label: '产线退库',
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
        {/* 条码打印弹窗 */}
        <UIDprint
          isModalOpen1={isModalOpen1}
          isAddOrPrint={isAddOrPrint}
          isPrintData={isPrintData}
          onChange={() => {
            setIsModalOpen1(false);
          }}
        />
      </div>
    </div>
  );
};

// 条码打印
const UIDprint = (props) => {
  const { isModalOpen1, isAddOrPrint, isPrintData, onChange } = props;
  console.log(isAddOrPrint, isPrintData);
  const [loadingOk1, setLoadingOk1] = useState(false);
  const [formCreate1] = Form.useForm();
  const QTYRef = useRef(null);
  const itemCodeRef = useRef(null);
  const productionDateRef = useRef(null);
  const lotNoRef = useRef(null);
  const dateCodeRef = useRef(null);
  const generateQtyRef = useRef(null);
  const [nowData, setNowData] = useState({});
  const [supplierlList, setSupplierlList] = useState([]);
  const [autoPrint, setAutoPrint] = useState(false);
  useEffect(() => {
    //如果是自动打印就执行打印逻辑
    if (isModalOpen1) {
      http
        .post(`${config.API_PREFIX}param/config/get?areaId=&code=inboundMaterialUid`, {})
        .then((res) => {
          setAutoPrint(res?.bizData?.configValue == 1 ? true : false);
        });
    }
  }, [isModalOpen1]);
  useEffect(() => {
    if (isAddOrPrint == 'update') {
      fetchData2(1, isPrintData.itemCode);
    }
  }, [isPrintData]);
  useEffect(() => {
    if (isAddOrPrint == 'update') {
      handleOk2();
    }
  }, [nowData]);
  const getPrintData = async (uniqueCode, params) => {
    return new Promise((resove, reject) => {
      http
        .post(`${config.API_PREFIX}${api.printTemplatePrintData}`, {
          templateId: nowData.labelTemplateId,
          // barcode: res?.bizData[0],
          barcode: uniqueCode,
          itemCode: params.itemCode,
          supplierItemCode: params.supplierItemCode,
          msl: params.msl,
          qty: params.qty,
          productionDate: params.productionDate,
          expirationDate: params.expirationDate,
          lotNo: params.lotNo,
          dateCode: params.dateCode,
          supplier: params.supplier,
          // workStation: "",
          // workOrderNumber: "",
          // productCode: "",
          // orderNumber: "",
          // packagingLevel: 0,
        })
        .then((res1) => {
          resove(res1);
        })
        .catch((err) => {
          setLoadingOk1(false);
          console.log(err);
          reject(err);
        });
    });
  };
  const myDesign = (tplContent) => {
    let LODOP = window.getLodop();
    /*
    if (LODOP.CVERSION) {
      window.CLODOP.On_Return = function (TaskID, Value) {
        // document.getElementById('S1').value = Value;
        console.log("Value", Value);
      };
    }
    */
    if (tplContent) {
      eval(tplContent);
    }
    LODOP.PRINT();
  };
  // 明细打印--补打
  const handleOk2 = async () => {
    let params = {
      packQty: isPrintData.packageQty,
      itemCode: isPrintData.itemCode,
      supplierItemCode: isPrintData.supplierItemCode,
      qty: isPrintData.inboundQty,
      productionDate: isPrintData.productionDate,
      expirationDate: isPrintData.expirationDate,
      lotNo: isPrintData.lotNo,
      dateCode: isPrintData.dateCode,
      generateQty: isPrintData.generateQty,
      msl: isPrintData.msl,
      supplier: isPrintData.supplier,
    };
    let bizData = [isPrintData.materialUid];
    if (bizData.length) {
      for (let i = 0; i < bizData.length; i++) {
        try {
          const printData = await getPrintData(bizData[i], params);

          myDesign(printData.bizData);

          // @luck 我感觉还是调用两次比较好，中间间隔3s或者5s
          await new Promise((resolve) => setTimeout(resolve, 5000));
        } catch (err) {
          console.error(err, '生成打印数据或打印异常！');
          // message.error("生成打印数据或打印异常！");
        }
      }
      message.success('操作成功！');
    }
  };
  //录入--如果是自动打印就执行打印逻辑
  const handleOk1 = () => {
    formCreate1
      .validateFields()
      .then((values) => {
        values.productionDate = dayjs(values.productionDate).format('YYYY-MM-DD HH:mm:ss');
        values.expirationDate = dayjs(values.expirationDate).format('YYYY-MM-DD HH:mm:ss');
        setLoadingOk1(true);
        const {
          itemCode,
          supplierItemCode,
          qty,
          productionDate,
          expirationDate,
          lotNo,
          dateCode,
          generateQty,
          msl,
          packageQty,
          itemSpec,
          supplier,
          shelfLife,
        } = values;
        let params = {
          packQty: packageQty,
          stockInId: isPrintData.id,
          itemCode,
          supplierItemCode,
          qty,
          productionDate,
          expirationDate,
          lotNo,
          dateCode,
          generateQty,
          materialDescription: itemSpec,
          msl,
          supplier,
          shelfLife,
        };

        http
          .post(`${config.API_PREFIX}inbound/order/generateUniqueCode`, params)
          .then(async (res) => {
            if (res?.bizData.length) {
              try {
                if (autoPrint) {
                  // 自动打印才进行打印
                  for (let i = 0; i < res?.bizData.length; i++) {
                    const printData = await getPrintData(res?.bizData[i], params);
                    myDesign(printData.bizData);
                    // @luck 我感觉还是调用两次比较好，中间间隔3s或者5s
                    await new Promise((resolve) => setTimeout(resolve, 5000));
                  }
                }
              } catch (err) {
                console.error(err, '生成打印数据或打印异常！');
              }
              formCreate1.resetFields();
              setLoadingOk1(false);
              message.success('操作成功！');
              setTimeout(() => {
                itemCodeRef?.current?.focus();
              }, 500);
            }
          })
          .catch((err) => {
            setLoadingOk1(false);
            console.log(err);
          });
      })
      .catch((error) => {
        console.log('Form validation error:', error);
      });
  };
  const handleCancel1 = () => {
    onChange();
  };
  function addDaysToDate(startDate, daysToAdd) {
    // 创建一个新的Date对象，确保它是基于给定的startDate
    let endDate = new Date(startDate);

    // 使用setDate方法来添加天数
    // 注意：setDate方法设置的是一个月中的某一天（1-31），因此我们需要先获取当前日期的天数，然后加上要添加的天数
    endDate.setDate(endDate.getDate() + daysToAdd);

    // 返回新的日期
    return formatDate(endDate);
  }
  // 格式化日期输出（可选）
  function formatDate(date) {
    let year = date.getFullYear();
    let month = (1 + date.getMonth()).toString().padStart(2, '0'); // 月份从0开始，所以需要+1
    let day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  // 扫描录入料号或者供应商料号去之前维护的物料基础信息里面进行筛选
  const fetchData2 = (type, code) => {
    let itemCode = type == 1 ? code : formCreate1.getFieldValue('itemCode');
    // let supplierItemCode = formCreate1.getFieldValue("supplierItemCode");
    http
      .get(config.API_PREFIX + api.basicItemBaseInfoPage, {
        pageSize: 1000,
        pageNum: 1,
        itemCode: itemCode,
        // supplierItemCode: supplierItemCode,
      })
      .then((res) => {
        // console.log("res", res);
        const data = res?.bizData;
        setSupplierlList(data?.records);
        if (data.total == 1) {
          // console.log('data?.records[0].supplier',data?.records[0].supplier)
          let item = data?.records[0];
          setNowData(item);
          if (type == 2) {
            //如果是回车扫描的
            formCreate1.setFieldsValue({
              itemCode: item.itemCode,
              supplierItemCode: item.supplierItemCode,
              supplier: item.supplier,
              packageQty: item.packageQty,
              msl: item.msl,
              shelfLife: item.shelfLife,
              itemSpec: item.itemSpec,
            });
            handleProductionDateChange();
            setTimeout(() => {
              QTYRef.current.focus();
            }, 500);
          }
        } else {
          if (type == 2) formCreate1.resetFields();
          message.warning('未获取到物料信息，请重新输入');
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  //选择供应商填充数据
  const fillInOtherFields = (record) => {
    console.log('record', record);
    supplierlList.forEach((item) => {
      console.log('item.itemCode', item.itemCode);
      if (item.supplier == record) {
        console.log('item.itemCode', item.itemCode);
        formCreate1.setFieldsValue({
          itemCode: item.itemCode,
          supplierItemCode: item.supplierItemCode,
          supplier: item.supplier,
          packageQty: item.packageQty,
          msl: item.msl,
          shelfLife: item.shelfLife,
        });
      }
    });
  };
  // 处理生产日期的变化获取结束日期
  const handleProductionDateChange = () => {
    // 处理生产日期的逻辑
    try {
      let data1 = formCreate1.getFieldValue('productionDate');
      data1 = new Date(data1.format('YYYY-MM-DD'));
      let data2 = formCreate1.getFieldValue('shelfLife');
      if (data1 && data2) {
        let endDate = addDaysToDate(data1, Number(data2));
        formCreate1.setFieldValue('expirationDate', dayjs(endDate));
        console.log(dayjs(endDate));
      }
      setTimeout(() => {
        jumpTo('lotNoRef');
      }, 500);
    } catch (error) {}
  };
  const jumpTo = (type) => {
    setTimeout(() => {
      if (type == 'productionDateRef') {
        productionDateRef?.current?.focus();
      } else if (type == 'lotNoRef') {
        lotNoRef?.current?.focus();
      } else if (type == 'dateCodeRef') {
        dateCodeRef?.current?.focus();
      } else if (type == 'generateQtyRef') {
        generateQtyRef?.current?.focus();
      }
    }, 500);
  };
  return (
    <Modal
      title="原材UID打印"
      open={isModalOpen1}
      onOk={handleOk1}
      onCancel={handleCancel1}
      confirmLoading={loadingOk1}
      okText="打印"
    >
      <Form
        labelCol={{ span: 8 }}
        form={formCreate1}
        style={{ padding: 16, maxHeight: '60vh', overflow: 'scroll' }}
      >
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
          <Input
            ref={itemCodeRef}
            allowClear
            autocomplete="off"
            onPressEnter={() => {
              fetchData2(2);
            }}
            placeholder="请输入"
          />
        </Form.Item>
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
          label="供应商"
          name="supplier"
          rules={[
            {
              required: false,
              message: '请输入',
            },
          ]}
        >
          {/* <Input allowClear placeholder="接口没有" /> */}
          <Select
            placeholder="请选择"
            allowClear
            onChange={fillInOtherFields}
            options={supplierlList?.map((item) => ({
              value: item.supplier,
              label: item.supplier,
            }))}
          />
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
        <Row>
          <Col span={12}>
            <Form.Item
              label="包装数量"
              name="packageQty"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="实际数量"
              name="qty"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              <InputNumber
                ref={QTYRef}
                style={{ width: '100%' }}
                allowClear
                placeholder="请输入"
                onPressEnter={() => jumpTo('productionDateRef')}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label="MSL"
              name="msl"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear placeholder="" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="有效期"
              name="shelfLife"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input allowClear onBlur={handleProductionDateChange} />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item
              label="生产日期"
              name="productionDate"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              {/* <Input allowClear placeholder="请输入" /> */}
              <DatePicker
                ref={productionDateRef}
                format="YYYY-MM-DD"
                onChange={handleProductionDateChange}
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="过期日期"
              name="expirationDate"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: true,
                  message: '请输入',
                },
              ]}
            >
              {/* <Input allowClear placeholder="请输入" /> */}
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              label="批次号"
              name="lotNo"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input
                ref={lotNoRef}
                allowClear
                placeholder="请输入"
                onPressEnter={() => jumpTo('dateCodeRef')}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="D/C"
              name="dateCode"
              labelCol={{ span: 8 }}
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <Input
                ref={dateCodeRef}
                allowClear
                placeholder="请输入"
                onPressEnter={() => jumpTo('generateQtyRef')}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="份数"
          name="generateQty"
          labelCol={{ span: 4 }}
          rules={[
            {
              required: true,
              message: '请输入',
            },
          ]}
        >
          <InputNumber
            ref={generateQtyRef}
            style={{ width: '100%' }}
            allowClear
            placeholder="请输入"
            onPressEnter={handleOk1}
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default App;
