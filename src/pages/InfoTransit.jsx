import React, { useState, useMemo, useEffect } from 'react';
import { useAntdResizableHeader } from '@minko-fe/use-antd-resizable-header'
import '@minko-fe/use-antd-resizable-header/index.css'
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import { Table, DatePicker, Breadcrumb, Form, Row, Col, Select, Input, Space, Button, message, Tooltip, Switch, Modal } from 'antd';
import { SearchOutlined, DownloadOutlined, SwapOutlined, RollbackOutlined } from '@ant-design/icons';
import dayjs from 'dayjs'
import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
import qs from 'qs';
import { downloadCSV } from '../utils/util';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
const { RangePicker } = DatePicker;

const onChange = (value, dateString) => {
  console.log('Selected Time: ', value);
  console.log('Formatted Selected Time: ', dateString);
};
const onOk = (value) => {
  console.log('onOk: ', value);
};

const App = () => {
  const [loading, setLoading] = useState(false);
  const [loadingExport, setLoadingExport] = useState(false);
  const [formSearch] = Form.useForm();
  const [data, setData] = useState([]);
  const [isShowSearch, setIsShowSearch] = useState(false)

  const [queryParams, setQueryParams] = useState(null);
  const [queryTotal, setQueryTotal] = useState(0);

  const [columns, setColumns] = useState([
    {
      title: '厂区',
      dataIndex: 'factoryAreaNameProcess',
      key: 'factoryAreaNameProcess',
      width: 100,
      fixed: 'left',
    },
    {
      title: '车间',
      dataIndex: 'workshopAreaNameProcess',
      key: 'workshopAreaNameProcess',
      width: 100,
      fixed: 'left',
    },
    {
      title: '产线',
      dataIndex: 'areaNameProcess',
      key: 'areaNameProcess',
      width: 100,
    },
    {
      title: '机器',
      dataIndex: 'deviceOrderNum',
      key: 'deviceOrderNum',
      width: 100,
      sorter: true,
    },
    {
      title: '工位',
      dataIndex: 'stationName',
      key: 'stationName',
      width: 100,
      sorter: true,
    },
    {
      title: '程序',
      dataIndex: 'programName',
      key: 'programName',
      width: 100,
    },
    {
      title: '工单',
      dataIndex: 'projectNo',
      key: 'projectNo',
      width: 100,
    },
    {
      title: '大板码',
      dataIndex: 'boardCode',
      key: 'boardCode',
      width: 100,
    },
    {
      title: '小板序号',
      dataIndex: 'panelSeq',
      key: 'panelSeq',
      width: 100,
    },
    {
      title: '板号',
      dataIndex: 'boardNum',
      key: 'boardNum',
      width: 100,
    },
    {
      title: '轨道',
      dataIndex: 'lane',
      key: 'lane',
      width: 100,
    },
    {
      title: '进板时间',
      dataIndex: 'inBoardTime',
      key: 'inBoardTime',
      width: 100,
    },
    {
      title: '出板时间',
      dataIndex: 'outBoardTime',
      key: 'outBoardTime',
      width: 100,
    },
    {
      title: '面别',
      dataIndex: 'processFace',
      key: 'processFace',
      width: 100,
    },
    {
      title: '节拍',
      dataIndex: 'cycleTime',
      key: 'cycleTime',
      width: 100,
    },
    {
      title: '拼版数量',
      dataIndex: 'panelCount',
      key: 'panelCount',
    },
  ]);
  const { components, resizableColumns, tableWidth, resetColumns } = useAntdResizableHeader({
    columns: useMemo(() => columns, [columns]),
    columnsState: {
      persistenceKey: 'localKeyInfoTransit',
      persistenceType: 'localStorage',
    },
  })

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
    // params['orders[0].column'] = 'id'
    // params['orders[0].asc'] = false
    console.log(order, field) // ascend id
    if (order && field) {
      // 举例：
      // orders[0].column: id
      // orders[0].asc: true
      const rename = field.replace(/([A-Z])/g, '_$1').toLowerCase();
      params['orders[0].column'] = rename
      params['orders[0].asc'] = order === 'ascend' ? true : false
    }

    console.log('formSearch.getFieldsValue()', formSearch.getFieldsValue())
    const {factoryId, workshopId, areaId, programName, projectNo, boardNum, startTime, endTime} = formSearch.getFieldsValue()
    if (factoryId) {
      params.factoryId = factoryId
    }
    if (workshopId) {
      params.workshopId = workshopId
    }
    if (areaId) {
      params.areaId = areaId
    }
    if (programName) {
      params.programName = programName
    }
    if (projectNo) {
      params.projectNo = projectNo
    }
    if (boardNum) {
      params.boardNum = boardNum
    }
    if (startTime) {
      params.startTime = startTime.format('YYYY-MM-DD HH:mm') + ':00'
    }
    if (endTime) {
      params.endTime = endTime.format('YYYY-MM-DD HH:mm') + ':59'
    }

    setQueryParams(params)

    http.post(config.API_PREFIX + api.wipHistoryPpage + `?${qs.stringify(params)}`, {}).then((res) => {
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

  // const query = qs.stringify({
  //   current: 1,
  //   size: 100,
  // })
  const exportData = () => {
    setLoadingExport(true)
    const query = qs.stringify({
      ...queryParams,
      current: 1,
      size: 10000 // queryTotal,
    })
    http.post(config.API_PREFIX + api.wipHistoryExportData + `?${query}`, ).then((res) => {
      message.success('导出成功！')
      downloadCSV(res, '信息查询-导出过站记录-CSV文件')
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
    localStorage.setItem('columnsOrderInfoTransit', JSON.stringify(columns.map(col => col.key)));
  };

  useEffect(() => {
    const savedOrder = localStorage.getItem('columnsOrderInfoTransit');
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
    localStorage.removeItem('columnsOrderInfoTransit')
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
          title: '信息查询'
        }, {
          title: '过站记录'
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
                <Form.Item label="厂区" name="factoryId">
                  <Select
                    placeholder="请选择"
                    allowClear
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
                    options={dictBaseFwa?.workshop?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item label="产线" name="areaId">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseFwa?.area?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="程序" name="programName">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseAll?.program?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="工单" name="projectNo">
                  <Select
                    placeholder="请选择"
                    allowClear
                    options={dictBaseAll?.projectNo?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="板号" name="boardNum">
                  <Input
                    placeholder="请输入"
                    allowClear
                  />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="开始时间" name="startTime">
                  <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" style={{width: '100%'}} />
                </Form.Item>
              </Col>

              <Col span={8}>
                <Form.Item label="结束时间" name="endTime">
                  <DatePicker showTime={{format: 'HH:mm'}} format="YYYY-MM-DD HH:mm" style={{width: '100%'}} />
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
            loading={loading}
            components={components}
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
