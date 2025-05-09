import { downloadCSV } from '@/utils/util';
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
import TransferOrderDialog from './TransferOrderDialog';
const { TextArea } = Input;

const { confirm } = Modal;
let activeId = -1;

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
      title: '调拨单',
      dataIndex: 'transfer',
      key: 'transfer',
      width: 150,
    },
    // 调拨状态(0:待调拨,1:已调拨,2:关单)
    {
      title: '调拨单状态',
      dataIndex: 'transferStatus',
      key: 'transferStatus',
      render: (_, record) => {
        return record.transferStatus === 1
          ? '已调拨'
          : record.transferStatus === 2
          ? '关单'
          : '待调拨';
      },
      width: 150,
    },
    {
      title: '创建人',
      dataIndex: 'createBy',
      key: 'createBy',
      width: 150,
    },
    {
      title: '关单人',
      dataIndex: 'closer',
      key: 'closer',
      width: 150,
    },
    {
      title: '创建日期',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD');
      },
      width: 150,
    },
    {
      title: '关单日期',
      dataIndex: 'createTime',
      key: 'createTime',
      render: (_, record) => {
        return dayjs(_).format('YYYY-MM-DD');
      },
      width: 150,
    },
    {
      title: '备注',
      dataIndex: 'supplier',
      key: 'supplier',
      width: 150,
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
            <Typography.Link onClick={() => handleSelect(record)}>选料</Typography.Link>
            <Typography.Link onClick={() => linght(1, record)}>亮灯</Typography.Link>
            <Typography.Link onClick={() => linght(2, record)}>灭灯</Typography.Link>
            <Typography.Link onClick={() => closeOrder(record)}>关单</Typography.Link>
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
          .del(config.API_PREFIX + 'location/transfer' + `/${record?.id}`, {})
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
  const closeOrder = (record) => {
    confirm({
      title: '关单确认',
      icon: <ExclamationCircleFilled />,
      content: '请确认是否关单?',
      onOk() {
        console.log('OK');
        http
          .del(
            config.API_PREFIX +
              'location/transfer/status/change' +
              `?id=${record?.id}&transferStatus=2`,
            {},
          )
          .then((res) => {
            fetchData();
            message.success('关单成功！');
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

  const linght = (status, record) => {
    let url = status === 2 ? 'location/transfer/lightOff' : 'location/transfer/lightUp';
    http
      .post(
        config.API_PREFIX +
          url +
          `?${qs.stringify({
            id: record.id,
          })}`,
        {},
      )
      .then((res) => {
        console.log(res);
        message.success('操作成功！');
      })
      .catch((err) => {
        console.error(err);
      });
  };
  const [isConfirm, setIsConfirm] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 生成单号
  const getAddOrder = () => {
    http
      .get(config.API_PREFIX + 'location/transfer/generateTransferNo', {})
      .then((res) => {
        formCreate.setFieldValue('transfer', res.bizData || '');
      })
      .catch((err) => {});
  };
  //新增调拨单
  const showModal = (action, record, confirm) => {
    if (action === 'update' && record) {
      console.log(action, record);
      const { id, transfer, transferStatus, closer, closeDate, remark } = record;
      activeId = id;
      formCreate.setFieldsValue({
        transfer,
        transferStatus,
        closer,
        closeDate: dayjs(closeDate),
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

  //新增/修改调拨单保存
  const handleOk = () => {
    formCreate
      .validateFields()
      .then((values) => {
        console.log('values', values);
        setLoadingOk(true);
        // wtf
        const { transfer, transferStatus, closer, closeDate, remark } = values;
        let params = {
          transfer,
          transferStatus,
          closer,
          closeDate,
          remark,
        };
        let action = null;
        let msg = '';
        let apiUrl = '';
        if (activeId !== -1) {
          action = http.post;
          apiUrl = `${config.API_PREFIX}location/transfer/saveOrUpdate`;
          params.id = activeId;
          msg = '修改成功！';
        } else {
          action = http.post;
          apiUrl = `${config.API_PREFIX}location/transfer/saveOrUpdate`;
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
    // console.log('JSON.stringify(tableParams)]', JSON.stringify(tableParams));
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

    const { transfer, transferStatus, closer, closeDate } = formSearch.getFieldsValue();
    if (transfer) {
      params.transfer = transfer;
    }
    if (transferStatus) {
      params.transferStatus = transferStatus;
    }
    if (closer) {
      params.closer = closer;
    }
    if (closeDate) {
      params.closeDate = closeDate.format('YYYY-MM-DD 00:00:00');
    }
    // 传到wms汇总
    setWmsCountData(params);
    setQueryParams(params);
    http
      .get(config.API_PREFIX + 'location/transfer/page', params)
      .then((res) => {
        console.log('res', res);
        const data = res?.bizData;
        setQueryTotal(data?.total);
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
        title: '调拨单号',
        dataIndex: 'transferNo',
        key: 'transferNo',
      },
      {
        title: '物料UID',
        dataIndex: 'materialUid',
        key: 'materialUid',
      },
      {
        title: '料号',
        dataIndex: 'itemCode',
        key: 'itemCode',
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
        title: '调出仓位',
        dataIndex: 'packoutboundageQty',
        key: 'outbound',
      },
      {
        title: '调出库位',
        dataIndex: 'outStorageLocation',
        key: 'outStorageLocation',
      },
      {
        title: '调拨数量',
        dataIndex: 'transferQty',
        key: 'transferQty',
      },
      // {
      //   title: '操作',
      //   key: 'operation',
      //   fixed: 'right',
      //   render: (_, record) => {
      //     return (
      //       <Space>
      //         <Typography.Link onClick={() => handlePrint('update', record)}>打印</Typography.Link>
      //         <Typography.Link onClick={() => del2(record)}>删除</Typography.Link>
      //       </Space>
      //     );
      //   },
      // },
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
      persistenceKey: 'localKeyTransferOrder',
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
    localStorage.setItem('columnsTransferOrder', JSON.stringify(columns.map((col) => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsTransferOrder');
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
    localStorage.removeItem('columnsTransferOrder');
    message.success('复原成功！');
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }

  const [isSortableOpen, setIsSortableOpen] = useState(false);
  // 导出--------------------------------------------------------------------------------------------------------------------
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
      .post(config.API_PREFIX + 'inbound/order/exportData' + `?${query}`)
      .then((res) => {
        message.success('导出成功！');
        downloadCSV(res, '调拨管理导出-CSV文件');
        setLoadingExport(false);
      })
      .catch((err) => {
        console.log(err);
        message.error('导出失败！');
        setLoadingExport(false);
      });
  };
  // 选料
  const [transferOrderOpen, setTransferOrderOpen] = useState(false);
  const [transferOrderData, setTransferOrderData] = useState({});
  const handleSelect = (record) => {
    setTransferOrderOpen(true);
    setTransferOrderData(record);
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
                <Form.Item label="调拨单" name="transfer">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="调拨单状态" name="transferStatus">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={[
                      { label: '待调拨', value: 0 },
                      { label: '已调拨', value: 1 },
                      { label: '关单', value: 2 },
                    ]}
                  />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="关单人" name="closerr">
                  <Input allowClear placeholder="请输入" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="关单日期" name="closeDate">
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
        <div className="table-wrapper overflow-auto">
          <div style={{ marginBottom: 16, textAlign: 'right' }}>
            {/* <Button
              className="mr-2"
              loading={loadingExport}
              onClick={exportData}
              type="dashed"
              htmlType="button"
              icon={<DownloadOutlined />}
            >
              导出
            </Button> */}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                showModal('create');
              }}
            >
              新增调拨单
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
        {/* 新增/修改调拨单 */}
        <Modal
          title="新增/修改调拨单"
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
              label="调拨单"
              name="transfer"
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
              label="调拨单状态"
              name="transferStatus"
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
                  { label: '待调拨', value: 0 },
                  { label: '已调拨', value: 1 },
                  { label: '关单', value: 2 },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="关单人"
              name="closer"
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
              label="关单日期"
              name="closeDate"
              rules={[
                {
                  required: false,
                  message: '请输入',
                },
              ]}
            >
              <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
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
        {/* 选料 */}
        <TransferOrderDialog
          isModalOpen={transferOrderOpen}
          transferOrderData={transferOrderData}
          close={() => {
            setTransferOrderOpen(false);
            fetchData();
          }}
        ></TransferOrderDialog>
      </div>
    </div>
  );
};
export default App;
