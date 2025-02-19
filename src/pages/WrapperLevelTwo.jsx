import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  List,
  Badge,
  Dropdown,
  Drawer,
  Typography,
  DatePicker,
  Image,
  Tag,
  Butotn,
  Table,
  Modal,
  Breadcrumb,
  Form,
  Row,
  Col,
  Select,
  Input,
  InputNumber,
  Space,
  Button,
  message,
} from "antd";
import {
  ExclamationCircleFilled,
  DownOutlined,
  LoadingOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";

import http from "../utils/http";
import { config } from "../utils/config";
import api from "../utils/api";
import  dayjs from "dayjs";
const { TextArea } = Input;

let debounceTimeout = null;

const App = () => {
  const [form] = Form.useForm();
  // const [previousPanelCodeValue, setPreviousPanelCodeValue] = useState("");
  // const [ orderNumber, setOrderNumber] = useState('');
  // const [ productCode, setProductCode] = useState('');
  // const [panelCodeList, setPanelCodeList] = useState([]);

  const onFinish = (values) => {};
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  useEffect(() => {
    form.setFieldsValue({
      workStation: localStorage.getItem("workStation3") || "",
      orderNumber: localStorage.getItem("orderNumber3") || "",
      productCode: localStorage.getItem("productCode3") || "",
    });
  }, []);

  const [codeList, setCodeList] = useState([
    // "Racing car sprays burning fuel into crowd.",
    // "Japanese princess to wed commoner."
  ]);
  const delCodeList = (index) => {
    // 删除数组中的元素
    const newCodeList = [...codeList];
    newCodeList.splice(index, 1);
    setCodeList(newCodeList);
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
  const panelCodeRef = useRef(null);
  //条码打印
  const printTemplateData = () => {
    if (!codeList?.length) {
      message.warning("容器编号列表为空！");
      return;
    }
    //根据 包装层级 +产品料号，到机型维护里获取 标签模板ID
    http
      .post(`${config.API_PREFIX}${api.packProductConfigPage}`, {
        packagingLevel: 2,
        productCode: form.getFieldValue("productCode"),
      })
      .then((res) => {
        const records = res?.bizData?.records;
        if (records.length) {
          const { labelTemplateId } = records[0];
          http
            .post(`${config.API_PREFIX}${api.printTemplatePrintData}`, {
              //'print/template/print/data'
              templateId: labelTemplateId, //打印模板ID
              // barcode: res?.bizData[0],
              // itemCode: itemCode,
              // supplierItemCode: supplierItemCode,
              // msl: msl,
              // productionDate: productionDate,
              // expirationDate: expirationDate,
              // lotNo: lotNo,
              // dateCode: dateCode,

              qty: codeList?.length, //有几个条码就是几个
              // orderNumber: "", //容器编号 条码是个列表怎么传？
              packagingLevel: 2, //包装级别
              workOrderNumber: form.getFieldValue("orderNumber"), //工单号
              productCode: form.getFieldValue("productCode"), //产品料号
              workStation: form.getFieldValue("workStation"), //工位
            })
            .then((res1) => {
              // 打印
              if (res1.respCode == "200") {
                message.success("操作成功！");
                myDesign(res1?.bizData);
                // 打印之后 清除产品列表就好了，光标定位到容器编号输入框,工位，料号，工单保留进入下个循环
                setTimeout(() => {
                  setCodeList([]);
                  form.setFieldValue("panelCode", "");
                  // 使用setTimeout确保在Modal渲染后执行
                  panelCodeRef.current.focus();
                }, 1000);
              } else {
                message.warning(res1.respMsg);
                return;
              }
            });
        }
      })
      .catch((err) => {
        // setLoadingOk1(false);
        console.log(err);
      });
  };
  //容器编号回车
  const handlePanelCodeChange = (e) => {
    e.preventDefault();
    // 清除之前的防抖计时器
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const currentValue = e.target.value;
    // 设置新的防抖计时器
    debounceTimeout = setTimeout(() => {
      // 判断当前值与上一次的值是否不同
      // if (currentValue && currentValue !== previousPanelCodeValue) {
      http
        .get(config.API_PREFIX + api.packProductPackagingPage, { //packProductPackagingPage
          orderNumber: currentValue,  //包装条码（外箱条码）不是工单！
        })
        .then((res) => {
          // console.log("res", res);
          const records = res?.bizData?.records;
          if (records.length) {
            const { workOrderNumber, productCode, boardCode, packagingId } =
              records[0];
            if(!form.getFieldValue('orderNumber')||form.getFieldValue('orderNumber') ==''){
              form.setFieldValue('orderNumber',workOrderNumber)
              localStorage.setItem("orderNumber3",workOrderNumber)
            }
            if(!form.getFieldValue('productCode')||form.getFieldValue('productCode') ==''){
              form.setFieldValue('productCode',productCode)
              localStorage.setItem("productCode3",productCode)
            }
            // 包装新增两个接口：
            // 16.3.10的产品包装，是录入条码时用的。pack/product/packaging/productPackaging
            // 16.3.8 的关箱，是手动打印前关箱用的。pack/product/packaging/packageClosureByRule

            http
              .post(
                config.API_PREFIX + "pack/product/packaging/productPackaging",
                {
                  packagingLevel: 2,
                  workOrderNumber: workOrderNumber,
                  productCode: productCode,
                  workStation: form.getFieldValue("workStation"),
                  uniqueCode: currentValue,
                }
              )
              .then((res1) => {
                const data = res1?.bizData;
                //录入条码，调用接口成功后，判断下是否已关箱，如果已关箱，前端自动打印条码
                if (data.packageClosure == "Y") {
                  message.success("该产品已关箱,执行打印中...");
                  // 打印条码
                  printTemplateData();
                } else {
                  // 如果没关箱继续录入条码进去
                  const newCodeList = [...codeList, productCode];
                  setCodeList(newCodeList);
                }
              })
              .catch((err) => {
                console.log(err);
              });
            // 下面注释开发模拟使用
            // let res = {
            //   bizData: {
            //     id: 1,
            //     orderNumber: "4",
            //     packagingLevel: 111,
            //     workOrderNumber: "2",
            //     productName: "3",
            //     productCode: "22",
            //     customerOrderNumber: null,
            //     maxPackageQty: 1,
            //     actualPackageQty: 0,
            //     packageClosure: "N",
            //     unpacking: "N",
            //     workStation: "1",
            //     packagingId: null,
            //     stockOutId: null,
            //     factoryId: null,
            //     workshopId: null,
            //     areaId: null,
            //     createBy: "admin",
            //     createTime: "2024-06-07 18:31:01",
            //     updateBy: null,
            //     updateTime: null,
            //   },
            //   respCode: "200",
            //   respMsg: "成功",
            // };
            // const data = res?.bizData;
            // //录入条码，调用接口成功后，判断下是否已关箱，如果已关箱，前端自动打印条码
            // if (data.packageClosure == "Y") {
            //   message.success("该产品已关箱,条码打印中...");
            //   // 打印条码
            //   alert("条码打印");
            //   setTimeout(() => {
            //     // 清除产品列表就好了，光标定位到产品输入框,工位，料号，工单保留进入下个循环
            //     setCodeList([]);
            //     form.setFieldValue("panelCode", "");
            //   }, 1000);
            // } else {
            //   // 如果没关箱继续录入条码进去
            //   const newCodeList = [...codeList, productCode];
            //   setCodeList(newCodeList);
            // }
          } else {
            message.error("未获取到数据");
          }
        })
        .catch((err) => {
          console.log(err);
        });
      // }

      // 更新上一次的值
      // setPreviousPanelCodeValue(currentValue);
    }, 300);
  };
  const handleSubmit = (e) => {
    // e.preventDefault();
    //录入条码，手动关箱，前端自动打印条码
    // 16.3.8 的关箱，是手动打印前关箱用的。pack/product/packaging/packageClosureByRule(get?  post?)
    // return;
    printTemplateData();
  };
  return (
    <div className="content-wrapper">
      <Breadcrumb
        className="breadcrumb"
        items={[
          {
            title: "生产管理",
          },
          {
            title: "包装",
          },
          {
            title: "二级包装",
          },
        ]}
      ></Breadcrumb>
      <div className="content">
        <Form
          form={form}
          name="basic"
          labelCol={{
            span: 8,
          }}
          wrapperCol={{
            span: 16,
          }}
          style={{
            maxWidth: 600,
          }}
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
        >
          <Form.Item
            label="工位"
            name="workStation"
            onBlur={(e) => {
              if (e?.target?.value)
                localStorage.setItem("workStation3", e.target.value);
            }}
            // extra="工位是手动输入的；下次访问浏览器缓存带出"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            label="工单号"
            name="orderNumber"
            onBlur={(e) => {
              if (e?.target?.value)
                localStorage.setItem("orderNumber3", e.target.value);
            }}
            // extra="根据扫描的第一片板子自动带出；为空自动带出，不为空根据返回的进行核对；允许手动删除，修改；下次访问浏览器缓存带出"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            label="产品料号"
            onBlur={(e) => {
              if (e?.target?.value)
                localStorage.setItem("productCode3", e.target.value);
            }}
            // extra="根据扫描的第一片板子自动带出；为空自动带出，不为空根据返回的进行核对；允许手动删除，修改；下次访问浏览器缓存带出"
            name="productCode"
            rules={[
              {
                required: true,
                message: "请输入",
              },
            ]}
          >
            <Input allowClear />
          </Form.Item>

          <Form.Item
            label="容器编号"
            name="panelCode"
            // extra="然后根据后台返回的进行校验（保证工单，料号一致）。不一致提醒，不允许进行包装"
            rules={[
              {
                required: false,
                message: "请输入",
              },
            ]}
          >
            <Input
              allowClear
              autoFocus
              ref={panelCodeRef}
              onPressEnter={handlePanelCodeChange}
            />
          </Form.Item>

          <Form.Item
            label="容器编号列表"
            rules={[
              {
                required: false,
                message: "请输入",
              },
            ]}
          >
            {/* <Tag closeIcon onClose={console.log}>
              
            </Tag> */}
            <List
              bordered
              dataSource={codeList}
              renderItem={(item, index) => (
                <List.Item
                // actions={[
                //   <a
                //     key="list-loadmore-more"
                //     onClick={() => delCodeList(index)}
                //   >
                //     删除
                //   </a>,
                // ]}
                >
                  {item}
                </List.Item>
              )}
            />
          </Form.Item>

          <Form.Item
            wrapperCol={{
              offset: 8,
              span: 16,
            }}
            // extra="满箱的时候自动打印就好了；如果不满箱点击保存，执行打印；生成箱号的时候要考虑多个点位同时生成箱号的重码问题。"
          >
            <Button type="primary"  onClick={handleSubmit}>
              保存
            </Button>
            {/* <Button type="primary" htmlType="submit" onClick={printTemplateData}>
              测试打印
            </Button> */}
          </Form.Item>
        </Form>
      </div>
    </div>
  );
};

export default App;
