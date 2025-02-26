import React, { useState, useMemo, useEffect } from 'react';
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import { Table, DatePicker, Breadcrumb, Form, Row, Col, Select, message, Space, Button, Switch, Modal, Tooltip } from 'antd';
import { SearchOutlined, DownloadOutlined, SwapOutlined, RollbackOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header'
import '@minko-fe/use-antd-resizable-header/index.css'
import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
import { FormattedMessage, useIntl } from '@umijs/max';
import qs from 'qs';
import { downloadCSV } from '../utils/util';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
const { RangePicker } = DatePicker;
// 物料状态：1.待核；2.已核；3.错料；4.缺料；-1.巡检待核 多个,分隔
const itemStatusObj = {
  '1': '待核',
  '2': '已核',
  '3': '错料',
  '4': '缺料',
  '-1': '巡检待核',
}
// Feeder状态 100.正常 102.异常NG
const feederStatusObj = {
  '100': '正常',
  '102': '异常NG',
}

const App = () => {

  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const [isShowSearch, setIsShowSearch] = useState(false)

  const [dictBaseFwa, setDictBaseFwa] = useState({})
  const getDictBaseFwa = () => {
    http.post(config.API_PREFIX + api.dictBaseFwa, {
    }).then(res => {
      console.log('dict', res)
      setDictBaseFwa(res?.bizData)
    }).catch(err => {
    })
  }

  const [dictBaseAll, setDictBaseAll] = useState({})
  const getDictBaseAll = () => {
    http.post(config.API_PREFIX + api.dictBaseAll, {
    }).then(res => {
      console.log('dict', res)
      setDictBaseAll(res?.bizData)
    }).catch(err => {
    })
  }

  const areaLinePage = () => {
    http.post(config.API_PREFIX + api.areaLinePage, {
    }).then(res => {
      console.log('areaLinePage', res)
    }).catch(err => {
    })
  }

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

  useEffect(() => {
    getDictBaseFwa()
    getDictBaseAll()
    areaLinePage()
  }, [])

  useEffect(() => {
    fetchData();
  }, [JSON.stringify(tableParams)]);

  const onFinish = () => {
    setTableParams(paginationInit);
  }

  const resetFormSearch = () => {
    formSearch.resetFields();
    setTableParams(paginationInit);
  }

  const handleDeleteItem = (index, remove) => {
    remove(index)
  };

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
    // params['orders[0].column'] = 'division'
    // params['orders[0].asc'] = false
    console.log('order, field: ', order, field) // ascend id
    if (order && field) {
      // 举例：
      // orders[0].column: id
      // orders[0].asc: true
      const rename = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      params['orders[0].column'] = rename
      params['orders[0].asc'] = order === 'ascend' ? true : false
    }

    console.log('formSearch.getFieldsValue()', formSearch.getFieldsValue())
    const {factoryId, workshopId, areaId, deviceOrderNum, tableNo, slot, itemCode, itemStatus} = formSearch.getFieldsValue()
    if (factoryId) {
      params.factoryId = factoryId
    }
    if (workshopId) {
      params.workshopId = workshopId
    }
    if (areaId) {
      params.areaId = areaId
    }
    if (deviceOrderNum) {
      params.deviceOrderNum = deviceOrderNum
    }
    if (deviceOrderNum) {
      params.deviceOrderNum = deviceOrderNum
    }
    if (tableNo) {
      params.tableNo = tableNo
    }
    if (slot) {
      params.slot = slot
    }
    if (itemCode) {
      params.itemCode = itemCode
    }
    if (itemStatus) {
      params.itemStatus = itemStatus
    }

    setQueryParams(params)

    http.post(config.API_PREFIX + api.tracePreventPage + `?${qs.stringify(params)}`, {}).then((res) => {
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
  const intl = useIntl();
  const [columns, setColumns] = useState([
    {
      title: (
              <FormattedMessage
                id="pages.searchTable.areaNameProcess"
                defaultMessage="产线"
              />
            ),
      dataIndex: 'areaNameProcess',
      key: 'areaNameProcess',
      width: 100,
      fixed: 'left',
    },
    {
      title: '机器序号',
      dataIndex: 'deviceOrderNum',
      key: 'deviceOrderNum',
      width: 100,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '台车',
      dataIndex: 'tableNo',
      key: 'tableNo',
      width: 100,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '料站',
      dataIndex: 'slot',
      key: 'slot',
      width: 100,
      fixed: 'left',
      sorter: true,
    },
    {
      title: '料号',
      dataIndex: 'itemCode',
      key: 'itemCode',
      width: 100,
      fixed: 'left',
    },
    {
      title: '程序名',
      dataIndex: 'program',
      key: 'program',
      width: 100,
    },
    {
      title: '工单号',
      dataIndex: 'projectNo',
      key: 'projectNo',
      width: 100,
    },
    {
      title: '城市/厂区',
      dataIndex: 'factoryAreaNameProcess',
      key: 'factoryAreaNameProcess',
      width: 100,
    },
    {
      title: '车间',
      dataIndex: 'workshopAreaNameProcess',
      key: 'workshopAreaNameProcess',
      width: 100,
    },
    {
      title: '道数',
      dataIndex: 'division',
      key: 'division',
      width: 100,
      sorter: true,
      // defaultSortOrder: 'descend',
    },
    {
      title: '物料状态',
      dataIndex: 'itemStatus',
      key: 'itemStatus',
      width: 100,
      render: (_, record) => {
        return (itemStatusObj[_?.toString()])
      }
    },
    {
      title: 'Feeder类型',
      dataIndex: 'feederType',
      key: 'feederType',
      width: 100,
    },
    {
      title: 'Feeder编号',
      dataIndex: 'feederSn',
      key: 'feederSn',
      width: 100,
    },
    {
      title: 'Feeder状态',
      dataIndex: 'feederStatus',
      key: 'feederStatus',
      width: 100,
      render: (_, record) => {
        return (feederStatusObj[_?.toString()])
      }
    },
    {
      title: '料盘唯一码',
      dataIndex: 'itemSn',
      key: 'itemSn',
      width: 100,
    },
    {
      title: '料站数量',
      dataIndex: 'itemQty',
      key: 'itemQty',
      width: 100,
    },
    {
      title: '剩余时间',
      dataIndex: 'remainTime',
      key: 'remainTime',
      width: 100,
    },
    {
      title: '用量',
      dataIndex: 'useLevel1',
      key: 'useLevel1',
      width: 100,
    },
    {
      title: '位号',
      dataIndex: 'position1',
      key: 'position1',
      width: 100,
    },
    {
      title: '消耗数量',
      dataIndex: 'totalConsumptionQty1',
      key: 'totalConsumptionQty1',
      width: 100,
    },
    {
      title: '贴装数量',
      dataIndex: 'placedQty1',
      key: 'placedQty1',
      width: 100,
    },
    {
      title: '吸取错误',
      dataIndex: 'pickErrorQty1',
      key: 'pickErrorQty1',
      width: 100,
    },
    {
      title: '影像错误',
      dataIndex: 'identErrorQty1',
      key: 'identErrorQty1',
      width: 100,
    },
    {
      title: '其他错误',
      dataIndex: 'otherErrorQty1',
      key: 'otherErrorQty1',
      width: 100,
    },
    {
      title: '抛料率',
      dataIndex: 'throwRate',
      key: 'throwRate',
      width: 100,
    },
    {
      title: '周期时间',
      dataIndex: 'cycleTime',
      key: 'cycleTime',
      width: 100,
    },
    {
      title: 'Lane',
      dataIndex: 'lane1',
      key: 'lane1',
    },
  ]);
  // const columns = ;

  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columns]),
    columnsState: {
      persistenceKey: 'localKeyTraceSafe',
      persistenceType: 'localStorage',
    },
  })

  const query = qs.stringify({
    current: 1,
    size: 100,
  })
  const exportData = () => {
    setLoadingExport(true)
    const query = qs.stringify({
      ...queryParams,
      current: 1,
      size: 10000 // queryTotal,
    })
    http.post(config.API_PREFIX + api.tracePreventExportData + `?${query}`, ).then((res) => {
      message.success('导出成功！')
      downloadCSV(res, '防错追溯导出-CSV文件')
      setLoadingExport(false)
    }).catch(err => {
      console.log(err)
      message.error('导出失败！')
      setLoadingExport(false)
    })
  }

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

  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = () => {
    setIsModalOpen(false);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

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

// 示例数据
/*
const [items, setItems] = useState([
  { id: 'item-1', content: '项目 1' },
  { id: 'item-2', content: '项目 2' },
  { id: 'item-3', content: '项目 3' },
  { id: 'item-4', content: '项目 4' },
  { id: 'item-5', content: '项目 5' },
  { id: 'item-6', content: '项目 6' },
  { id: 'item-7', content: '项目 7' },
  { id: 'item-8', content: '项目 8' },
  { id: 'item-9', content: '项目 9' },
  { id: 'item-10', content: '项目 10' },
  // 其他项目...
]);
*/

  // 定义传感器
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: verticalListSortingStrategy,
    })
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
    localStorage.setItem('columnsOrderTraceSafe', JSON.stringify(columns.map(col => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsOrderTraceSafe');
    if (savedOrder) {
      const order = JSON.parse(savedOrder);
      const orderedColumns = order.map(key => columns.find(col => col.key === key)).filter(Boolean);
      setColumns(orderedColumns);
    }
    // 其他初始化逻辑...
  }, []);

  const onSearchChange = (checked) => {
    console.log(`switch to ${checked}`);
    setIsShowSearch(checked)
  };

  function refreshPage() {
    localStorage.removeItem('columnsOrderTraceSafe')
    message.success('复原成功！')
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '防错追溯'
        }, {
          title: '防错追溯'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="tools">
          <Space size="middle">
            <Tooltip title={isShowSearch ? '隐藏搜索' : '显示搜索'}>
              <Switch onChange={onSearchChange} checkedChildren={<SearchOutlined />} unCheckedChildren={<SearchOutlined />} />
            </Tooltip>
            <Tooltip title="调整列顺序">
              <Button type="dashed" shape="round" size="small" icon={<SwapOutlined />} onClick={() => showModal()} />
            </Tooltip>
            <Tooltip title="复原列数据">
              <Button type="dashed" shape="round" size="small" icon={<RollbackOutlined />} onClick={() => refreshPage()} />
            </Tooltip>
          </Space>
        </div>
        <div className="search-wrapper" style={{display: isShowSearch ? 'block' : 'none'}}>
          <Form
            form={formSearch}
            onFinish={onFinish}
          >
            <Row gutter="24">
              <Col span={8}>
                <Form.Item
                  label="厂区"
                  name="factoryId"
                >
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseFwa?.factory?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="车间" name="workshopId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseFwa?.workshop?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label={intl.formatMessage({
                    id: 'pages.searchTable.areaNameProcess',
                    defaultMessage: '产线',
                  })} name="areaId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseFwa?.area?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="机器" name="deviceOrderNum">
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={dictBaseAll?.deviceOrderNum?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="台车" name="tableNo">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseAll?.tableNo?.sort((a, b) => parseInt(a.dictValue, 10) - parseInt(b.dictValue, 10))?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="站位" name="slot">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseAll?.slot?.sort((a, b) => parseInt(a.dictValue, 10) - parseInt(b.dictValue, 10))?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="料号" name="itemCode">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseAll?.itemCode?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="状态" name="itemStatus">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseAll?.itemStatus?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Space size="small">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                  <Button onClick={resetFormSearch}  htmlType="button">重置</Button>
                  <Button loading={loadingExport} onClick={exportData} type="dashed" htmlType="button" icon={<DownloadOutlined />}>导出</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
        <div className="table-wrapper">
          <Table
            columns={resizableColumns}
            rowKey={(record) => record.id}
            components={components}
            loading={loading}
            dataSource={data}
            scroll={{ x: tableWidth }}
            pagination={tableParams.pagination}
            onChange={handleTableChange}
            bordered
          />
        </div>
      </div>
      <Modal title="调整列顺序（拖动排序）" open={isModalOpen} footer={null} onOk={handleOk} onCancel={handleCancel}>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={columns.filter(col => !col.fixed).map((item) => item.key)}>
            <Row gutter={16}>
            {columns.filter(col => !col.fixed).map((item) => (
                <Col key={item.key} span={8}>
                  <SortableItem id={item.key} content={item.title} isDraggable={!item?.fixed} />
                </Col>
              ))}
            </Row>
          </SortableContext>
        </DndContext>
      </Modal>
    </div>
  );
};

export default App;
