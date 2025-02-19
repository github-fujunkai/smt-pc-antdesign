import React, { useState, useEffect } from 'react';
// import locale from 'antd/lib/date-picker/locale/zh_CN';
import { Tabs, Table, DatePicker, Breadcrumb, Form, Row, Col, Select, Input, Space, Button, InputNumber } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import BasicTab from './BasicTab'
import SafeTab from './SafeTab'
import ShutdownTab from './ShutdownTab'
import TraceTab from './TraceTab'
import DeviceTab from './DeviceTab'

import http from '../../utils/http'
import {config} from '../../utils/config'
import api from '../../utils/api'
import qs from 'qs';

const App = () => {
  const [formQuery] = Form.useForm()

  const [dictBaseFwa, setDictBaseFwa] = useState({})
  const [workshops, setWorkshops] = useState([])
  const [areas, setAreas] = useState([])
  const getDictBaseFwa = () => {
    http.post(config.API_PREFIX + api.dictBaseFwa, {
    }).then(res => {
      console.log('dict', res)
      setDictBaseFwa(res?.bizData)
      setWorkshops(res?.bizData?.workshop || [])
      setAreas(res?.bizData?.area || [])
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

  useEffect(() => {
    getDictBaseFwa()
    getDictBaseAll()
    areaLinePage()
  }, [])

  const onChange = (key) => {
    console.log(key);
  };

  const [param, setParam] = useState({})

  const onFinish = (values) => {
    console.log('Form submitted:', values);
    const { factoryId, workshopId, areaId } = values
    http.post(config.API_PREFIX + api.paramConfigAll + `?${qs.stringify({
      factoryId,
      workshopId,
      areaId,
    })}`, {}).then((res) => {
      console.log('paramConfigAll: ', res)
      setParam(res?.bizData)
    }).catch(err => {
      console.log(err)
    })
  };

  const onWorkshopIdChange = (value) => {
    const areasNew = dictBaseFwa?.area.filter(item => (item.parentKey === value.toString()))
    setAreas(areasNew)
    formQuery.setFieldValue('areaId', '')
  }
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '防错追溯'
        }, {
          title: '参数设置'
        }]}
      ></Breadcrumb>
      <div className="content">
        <div className="search-wrapper">
        <Form
          form={formQuery}
          onFinish={onFinish}
        >
            <Row gutter="24">
              <Col span={7}>
                <Form.Item
                  label="厂区"
                  name="factoryId"
                  rules={[{ required: true, message: '请选择厂区' }]}
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

              <Col span={7}>
                <Form.Item
                  label="车间"
                  name="workshopId"
                  rules={[{ required: true, message: '请选择车间' }]}
                >
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={workshops?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                    onChange={onWorkshopIdChange}
                  />
                </Form.Item>
              </Col>

              <Col span={7}>
                <Form.Item
                  label="产线"
                  name="areaId"
                  rules={[{ required: true, message: '请选择产线' }]}
                >
                  <Select
                    placeholder="请选择"
                    allowClear
                    showSearch
                    options={areas?.map(item => ({
                      value: item.dictKey,
                      label: item.dictValue,
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col span={3}>
                <Space size="small">
                  <Button type="primary" htmlType="submit" icon={<SearchOutlined />}>查询</Button>
                </Space>
              </Col>
            </Row>
          </Form>
        </div>
        <div>
          <Tabs
            onChange={onChange}
            type="card"
            defaultActiveKey='1'
            items={[{
              label: '基础设置',
              key: '1',
              children: <BasicTab param={param} />,
            }, {
              label: '防错设置',
              key: '2',
              children: <SafeTab param={param} />,
            }, {
              label: '停机设置',
              key: '3',
              children: <ShutdownTab param={param} />,
            }, {
              label: '追溯设置',
              key: '4',
              children: <TraceTab param={param} />,
            }, {
              label: '设备对接',
              key: '5',
              children: <DeviceTab param={param} />,
            }, ]}
          />
        </div>
      </div>
    </div>
  );
};

export default App;
