import React, { useState, useEffect } from 'react';
import { Switch, Space, Button, Divider, message, Form, Row, Col, Select, Input } from 'antd';
import { MinusOutlined } from '@ant-design/icons';
import http from '../../utils/http'
import {config} from '../../utils/config'
import api from '../../utils/api'

const App = (props) => {
  const { param } = props;
  const [form] = Form.useForm();

  useEffect(() => {
    console.log('props', props)
    const abutmentConfig = param?.abutmentConfig
    let fields = {
      contactPointDetection: abutmentConfig?.contactPointDetection?.configValue === 'Y' ? true : false,
      forcedTrigger: abutmentConfig?.forcedTrigger?.configValue || null,
      keepTheFeedStationStatus: abutmentConfig?.keepTheFeedStationStatus?.configValue === 'Y' ? true : false,
      dosageIs0Skip: abutmentConfig?.dosageIs0Skip?.configValue === 'Y' ? true : false,
      feederPullsOutHeavyNuclearMaterial: abutmentConfig?.feederPullsOutHeavyNuclearMaterial?.configValue === 'Y' ? true : false,
    }
    console.log('fields', fields)
    form.setFieldsValue(fields)
  }, [param])

  const onFinish = (values) => {
    console.log(values)
    const obj = {
      factoryId: param?.factoryId,
      workshopId: param?.workshopId,
      areaId: param?.areaId,

      configType: '5',
    }
    const { abutmentConfig } = param
    let params = {
      ...obj,
      abutmentConfig: {
        contactPointDetection: {
          ...obj,
          id: abutmentConfig?.contactPointDetection?.id || null,
          configKey: 'Contact_point_detection',
          configName: '接料点侦测',
          configValue: values?.contactPointDetection ? 'Y' : 'N',
        },
        forcedTrigger: {
          ...obj,
          id: abutmentConfig?.forcedTrigger?.id || null,
          configKey: 'Forced_trigger',
          configName: '强制触发',
          configValue: values?.forcedTrigger || '',
        },
        keepTheFeedStationStatus: {
          ...obj,
          id: abutmentConfig?.keepTheFeedStationStatus?.id || null,
          configKey: 'Keep_the_feed_station_status',
          configName: '保持料站状态',
          configValue: values?.keepTheFeedStationStatus ? 'Y' : 'N',
        },
        dosageIs0Skip: {
          ...obj,
          id: abutmentConfig?.dosageIs0Skip?.id || null,
          configKey: 'The_dosage_is_0_skip',
          configName: '用量为0跳过',
          configValue: values?.dosageIs0Skip ? 'Y' : 'N',
        },
        feederPullsOutHeavyNuclearMaterial: {
          ...obj,
          id: abutmentConfig?.feederPullsOutHeavyNuclearMaterial?.id || null,
          configKey: 'Feeder_pulls_out_heavy_nuclear_material',
          configName: 'Feeder拔出重核物料',
          configValue: values?.feederPullsOutHeavyNuclearMaterial ? 'Y' : 'N',
        },
      }
    }
    console.log('params', params)
    // return
    http.post(config.API_PREFIX + api.paramConfigSaveOrUpdate, params).then(res => {
      console.log(res)
      message.success('保存成功！')
    }).catch(err => {
      console.error(err)
      message.error('保存失败，请重试！')
    })
  }
  return (
    <Form
      form={form}
      onFinish={onFinish}
    >
      <Row>
        <Col span={12}>
          <Form.Item
            label="接料点侦测"
            name="contactPointDetection"
            valuePropName="checked"
            labelCol={{ span: 8 }}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="强制触发"
            name="forcedTrigger"
            labelCol={{ span: 8 }}
          >
            <Input placeholder="请输入" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="保持料站状态"
            name="keepTheFeedStationStatus"
            valuePropName="checked"
            labelCol={{ span: 8 }}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="用量为0跳过"
            name="dosageIs0Skip"
            valuePropName="checked"
            labelCol={{ span: 8 }}
          >
            <Switch />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Feeder拔出重核物料"
            name="feederPullsOutHeavyNuclearMaterial"
            valuePropName="checked"
            labelCol={{ span: 8 }}
          >
            <Switch />
          </Form.Item>
        </Col>
      </Row>
      <Divider />
      <div style={{textAlign: 'center'}}>
        <Button style={{width: 200}} type="primary" htmlType="submit">保存</Button>
      </div>
    </Form>
  );
};

export default App;

