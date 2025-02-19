import React, { useState, useEffect } from 'react';
import { Space, Button, TimePicker, List, Form, Row, Col, Select, Input, InputNumber, message } from 'antd';
// import dayjs from 'dayjs';
import { PlusOutlined, CloseCircleOutlined } from '@ant-design/icons';
import http from '../../utils/http'
import {config} from '../../utils/config'
import api from '../../utils/api'

const App = (props) => {
  const { param } = props;
  const [ form ] = Form.useForm()
  const [data, setData] = useState([])
  useEffect(() => {
    console.log('props', props)
    const baseConfig = param?.baseConfig
    form.setFieldsValue({
      refreshInterval: baseConfig?.refreshInterval?.configValue || 20,
      journalRetention: baseConfig?.journalRetention?.configValue || 30,
      delayedShutdown: baseConfig?.delayedShutdown?.configValue || 20,
      delayedReset: baseConfig?.delayedReset?.configValue || 30,
      defaultState: baseConfig?.defaultState?.configValue || '1',
    })
    if (baseConfig?.inspectionSchedule?.configValue) {
      setData(baseConfig?.inspectionSchedule?.configValue?.split(','))
    }
  }, [param])

  const [time, setTime] = useState('')
  const onChange = (time, timeString) => {
    setTime(timeString)
  };

  const addTime = () => {
    if (data.includes(time)) {
      message.warning('请勿添加重复值！')
      return
    }
    const sortedArray = [...data, time].sort((a, b) => {
      const timeA = new Date(`1970-01-01T${a}`);
      const timeB = new Date(`1970-01-01T${b}`);
    
      return timeA - timeB;
    });
    setData(sortedArray)
  }

  const remove = (index) => {
    setData(prevData => prevData.filter((_, i) => i !== index));
  }

  const onFinish = (values) => {
    console.log(values)
    const obj = {
      factoryId: param?.factoryId,
      workshopId: param?.workshopId,
      areaId: param?.areaId,

      configType: '1',
    }
    const { baseConfig } = param
    let params = {
      ...obj,
      baseConfig: {
        refreshInterval: {
          ...obj,
          id: baseConfig?.refreshInterval?.id || null,
          configKey: 'Refresh_interval',
          configName: '刷新间隔(s)',
          configValue: values?.refreshInterval,
        },
        journalRetention: {
          ...obj,
          id: baseConfig?.journalRetention?.id || null,
          configKey: 'Journal_retention(days)',
          configName: '日志留存(天）',
          configValue: values?.journalRetention,
        },
        delayedShutdown: {
          ...obj,
          id: baseConfig?.delayedShutdown?.id || null,
          configKey: 'Delayed_Shutdown(m)',
          configName: '延时停机(m)',
          configValue: values?.delayedShutdown,
        },
        delayedReset: {
          ...obj,
          id: baseConfig?.delayedReset?.id || null,
          configKey: 'Delayed_reset(m)',
          configName: '延时复位(m)',
          configValue: values?.delayedReset,
        },
        defaultState: {
          ...obj,
          id: baseConfig?.defaultState?.id || null,
          configKey: 'Default_state',
          configName: '默认状态',
          configValue: values?.defaultState,
        },
        inspectionSchedule: {
          ...obj,
          id: baseConfig?.inspectionSchedule?.id || null,
          configKey: 'Inspection_schedule',
          configName: '巡检计划',
          configValue: data.join(','),
        }
      }
    }
    console.log('params', params)
    http.post(config.API_PREFIX + api.paramConfigSaveOrUpdate, params).then(res => {
      console.log(res)
      message.success('保存成功！')
    }).catch(err => {
      console.error(err)
    })
  }
  return (
    <Form form={form} onFinish={onFinish}>
      <Row>
        <Col span={12}>
          <Form.Item
            label="刷新间隔(s)"
            name="refreshInterval"
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: '请输入刷新间隔(s)' }]}
          >
            <InputNumber placeholder="请输入" style={{width: '100%'}} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="日志留存(天)"
            name="journalRetention"
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: '请输入日志留存(天)' }]}
          >
            <InputNumber placeholder="请输入" style={{width: '100%'}} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="延时停机(m)"
            name="delayedShutdown"
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: '请输入延时停机(m)' }]}
          >
            <InputNumber placeholder="请输入" style={{width: '100%'}} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="延时复位(m)"
            name="delayedReset"
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: '请输入延时复位(m)' }]}
          >
            <InputNumber placeholder="请输入" style={{width: '100%'}} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="默认状态"
            name="defaultState"
            labelCol={{ span: 6 }}
            rules={[{ required: true, message: '请选择默认状态' }]}
          >
          {/* 默认状态 1.待核；2.已核；3.错料；4.缺料 */}
            <Select
              placeholder="请选择"
              allowClear
              options={[{
                value: '1',
                label: '待核'
              }, {
                value: '2',
                label: '已核'
              }, {
                value: '3',
                label: '错料'
              }, {
                value: '4',
                label: '缺料'
              }]}
            />
          </Form.Item>
        </Col>
      </Row>
      
      <List
        header={<div>巡检计划</div>}
        footer={
          <Space>
            <TimePicker format="HH:mm" onChange={onChange} />
            <Button icon={<PlusOutlined />} onClick={addTime}>添加</Button>
          </Space>
        }
        bordered
        dataSource={data}
        renderItem={(item, index) => (
          <List.Item key={index}>
            <Space>
              {item}
              <CloseCircleOutlined style={{cursor: "pointer"}} onClick={() => remove(index)} />
            </Space>
          </List.Item>
        )}
      />

      <div style={{textAlign: 'center', marginTop: 25}}>
        <Space>
          <Button style={{width: 200}} type="primary" htmlType="submit">保存</Button>
        </Space>
      </div>
    </Form>
  );
};

export default App;
