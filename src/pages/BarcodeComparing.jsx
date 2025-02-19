import React, { useState, useEffect } from 'react';
import { Button, Typography, Form, Row, Col, Select, Input, Card, Breadcrumb, Space, message } from 'antd';
import { PlusOutlined, CloseOutlined, CloseCircleOutlined } from '@ant-design/icons';
import http from '../utils/http'
import {config} from '../utils/config'
import api from '../utils/api'
const { Title } = Typography;

let separator = null
let startPos = null
let itemContrasts = []

const App = () => {
  const [formFragment] = Form.useForm()
  const [formComparing] = Form.useForm()

  const [loadingRemove, setLoadingRemove] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = () => {
    setLoadingSave(true)
    http.post(config.API_PREFIX + api.itemContrastAll, {
    }).then((res) => {
      console.log(res)
      const data = res?.bizData
      
      separator = data?.separator
      startPos = data?.startPos
      itemContrasts = data?.itemContrasts || []

      // 设置初始数据到Form.List的initialValue
      formComparing.setFieldsValue({ items: data?.itemContrasts });

      formFragment.setFieldsValue({
        separatorConfigValue: data?.separator?.configValue,
        startPosConfigValue: data?.startPos?.configValue,
      })
      setLoadingSave(false)
    }).catch(err => {
      console.error(err)
      setLoadingSave(false)
    })
  }

  const onFinish = (values) => {
    console.log('Received values:', values);
    setLoadingSave(true)
    const {separatorConfigValue, startPosConfigValue} = formFragment.getFieldsValue()
    if (!separatorConfigValue) {
      setLoadingSave(false)
      message.error('请输入分隔符！')
      return
    }
    if (!startPosConfigValue) {
      setLoadingSave(false)
      message.error('请输入料号位置！')
      return
    }
    http.post(config.API_PREFIX + api.itemContrastSaveOrUpdate, {
      separator: {
        ...separator,
        configValue: separatorConfigValue
      },
      startPos: {
        ...startPos,
        configValue: startPosConfigValue
      },
      itemContrasts: values?.items,
    }).then((res) => {
      console.log(res)
      message.success('保存成功！')
      setLoadingSave(false)
      fetchData()
    }).catch(err => {
      console.error(err)
      setLoadingSave(false)
      message.error('保存失败，请重试！')
    })
  };

  const handleDeleteItem = (index, remove) => {
    if (itemContrasts[index]) {
      setLoadingRemove(true)
      http.del(config.API_PREFIX + api.itemContrast + `/${itemContrasts[index].id}`, {
      }).then((res) => {
        console.log(res)
        remove(index)
        itemContrasts.splice(index, 1)
        message.success('删除成功！')
        setLoadingRemove(false)
      }).catch(err => {
        console.error(err)
        fetchData()
        message.error('删除失败，请重试！')
        setLoadingRemove(false)
      })
    } else {
      remove(index)
    }
  };

  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[{
          title: '条码规则'
        }, {
          title: '料号比对'
        }]}
      ></Breadcrumb>
      <div className="content">
        <Card
          title="料号截取"
        >
          <Form form={formFragment}>
            <Row>
              <Col span={12}>
                <Form.Item
                  label="分隔符"
                  labelCol={{ span: 5, style: { textAlign: 'left' } }}
                  required={true}
                  name="separatorConfigValue"
                >
                  <Input />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="料号位置"
                  labelCol={{ span: 6 }}
                  required={true}
                  name="startPosConfigValue"
                >
                  <Input />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card
          title="料号比对"
          style={{marginTop: 24}}
        >
          <Form form={formComparing} onFinish={onFinish}>
            <Form.List
              name="items"
            >
              {(fields, { add, remove }) => (
                <>
                {fields.map(({ key, name, ...restField }) => (
                  <Row gutter={10} key={key}>
                    <Col span={6}>
                      <Form.Item
                        name={[name, 'num']}
                        initialValue={key}
                        style={{display: 'none'}}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        name={[name, 'id']}
                        style={{ display: 'none' }}
                      >
                        <Input />
                      </Form.Item>
                      <Form.Item
                        label="名称"
                        labelCol={{ span: 6 }}
                        name={[name, 'ruleName']}
                        rules={[
                          {
                            required: true,
                            message: '请输入',
                          },
                        ]}
                      >
                        <Input
                          placeholder="请输入"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={9}>
                      <Form.Item
                        label="规则值"
                        labelCol={{ span: 6 }}
                        name={[name, 'valueChar']}
                        rules={[
                          {
                            required: true,
                            message: '请输入',
                          },
                        ]}
                      >
                        <Input
                          placeholder="请输入"
                        />
                      </Form.Item>
                    </Col>

                    <Col span={7}>
                      <Form.Item
                        label="备注"
                        labelCol={{ span: 6 }}
                        name={[name, 'memo']} 
                      >
                        <Input
                          placeholder="请输入"
                        />
                      </Form.Item>
                    </Col>
                    <Col span={2}>
                      <Form.Item>
                        <Button
                          onClick={() => {
                            handleDeleteItem(name, remove);
                          }}
                          loading={loadingRemove}
                          shape="circle"
                          icon={<CloseOutlined />}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
                  <Space>
                    <Button
                      onClick={() => {
                        add();
                      }}
                      icon={<PlusOutlined />}
                      type="dashed"
                    >
                      添加规则
                    </Button>
                    <Button loading={loadingSave} type="primary" htmlType="submit">保存</Button>
                  </Space>
                </>
              )}
            </Form.List>
          </Form>
        </Card>

        <Card
          title="规则说明（正则表达式）"
          style={{marginTop: 24, display: 'none'}}
        >
          <p>*：表示扫描内容中的多位</p>
          <p>#：表示扫描内容中的一位，料号定长时有用</p>

          <p>%：表示任意一个字符</p>
          <p>a-z,A-Z：表示特定字符</p>
          <p>[]：为扫描结果增加[]内的字符</p>
          <p>()：为扫描结果删除()内的字符</p>
          <p>&lt;&gt;：标志符号，扫描内容中料号的开始结束标志</p>
          <p>&amp;：分割多个规则，从前往后依次处理</p>

          <Title level={5} style={{marginTop: 24}}>示例规则：</Title>
          <p>1. *：表示直接拿扫描内容直接与料号比对。</p>
          <p>2. ######：表示截取扫描内容前6为，与料号比对。</p>
          <p>3. [A]*：表示扫描内容加上前缀A，再与料号比对。</p>
          <p>4. *[%]：表示扫描的内容后面加上一个字符(即表示不比对料号的最后一个字符)，再与料号比对。</p>
          <p>5. *[]：表示扫描的内容后面加上N个字符(即表示只比对扫描内容长度的部分)，再与料号比对。</p>
          <p>6. (E)*：表示扫描内容，删除开头的E(开头非E则不删除)，再与料号比对。</p>
          <p>7. (%)*：表示扫描内容，删除第一个字符后再与料号比对。</p>
          <p>8. &lt;NO&gt;######：表示扫描内容，从NO后截取6位，与料号比对。</p>
        </Card>
      </div>
    </div>
  );
};

export default App;
