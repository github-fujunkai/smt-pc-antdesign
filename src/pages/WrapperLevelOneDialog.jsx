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

let debounceTimeout = null;

const App = ({ isModalOpen, onClose }) => {
  const [form] = Form.useForm();

  const onFinish = (values) => {};
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };
  useEffect(() => {
    form.setFieldsValue({
      workStation: localStorage.getItem("workStation2") || "",
      orderNumber: localStorage.getItem("orderNumber2") || "",
      productCode: localStorage.getItem("productCode2") || "",
      packageDateTimeFormatter: "yyyy/MM",
    });
  }, []);

  const [codeList, setCodeList] = useState([]);
  const myCodeListRef = useRef(codeList);

  useEffect(() => {
    myCodeListRef.current = codeList;
  }, [codeList]);
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
  const [isEdit, setIsEdit] = useState(false);
  const [currentCodeMsg, setCurrentCodeMsg] = useState(null); //产品条码回车详情
  const myCurrentCodeMsgRef = useRef(currentCodeMsg);

  useEffect(() => {
    myCurrentCodeMsgRef.current = currentCodeMsg;
  }, [currentCodeMsg]);
  //条码打印
  const printTemplateData = () => {
    // console.log("打印currentCodeMsg", currentCodeMsg);
    if (currentCodeMsg == null) {
      message.warning("获取不到包装信息！");
      return;
    }
    //根据 包装层级 +产品料号，到机型维护里获取 标签模板ID
    http
      .post(
        `${config.API_PREFIX}${
          api.packProductConfigPage
        }?current=1&size=10&packagingLevel=1&productCode=${form.getFieldValue(
          "productCode"
        )}`
      )
      .then((res) => {
        const records = res?.bizData?.records;
        if (records.length) {
          const { labelTemplateId } = records[0];
          http
            .post(`${config.API_PREFIX}${api.printTemplatePrintData}`, {
              //'print/template/print/data'
              // barcode: res?.bizData[0],
              // itemCode: itemCode,
              // supplierItemCode: supplierItemCode,
              // msl: msl,
              // productionDate: productionDate,
              // expirationDate: expirationDate,
              // lotNo: lotNo,
              // dateCode: dateCode,
              templateId: labelTemplateId, //打印模板ID
              qty: myCodeListRef.current.length || 0, //有几个条码就是几个
              // orderNumber: "", //产品条码 条码是个列表怎么传？
              packagingLevel: 1, //包装级别
              workOrderNumber: form.getFieldValue("orderNumber"), //工单号
              productCode: form.getFieldValue("productCode"), //产品料号
              workStation: form.getFieldValue("workStation"), //工位
              packageDateTimeFormatter: form.getFieldValue(
                "packageDateTimeFormatter"
              ),
              productName: myCurrentCodeMsgRef.current?.productName,
              orderNumber: myCurrentCodeMsgRef.current?.orderNumber, //产品条码  ---- 这是算是箱号
              actualPackageQty: myCurrentCodeMsgRef.current?.actualPackageQty, //包装数量
            })
            .then((res1) => {
              // 打印
              if (res1.respCode == "200") {
                setIsEdit(false);
                message.success("操作成功！");
                myDesign(res1?.bizData);
                // 打印之后 清除产品列表就好了，光标定位到产品条码输入框,工位，料号，工单保留进入下个循环
                setTimeout(() => {
                  setCurrentCodeMsg(null);
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
  //产品条码回车
  const handlePanelCodeChange = (e) => {
    e.preventDefault();
    // 清除之前的防抖计时器
    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }
    const currentValue = e.target.value;
    // 设置新的防抖计时器
    debounceTimeout = setTimeout(() => {
      http
        .get(config.API_PREFIX + api.wmsPanelUniqueCodePage, {
          panelCode: currentValue,
        })
        .then((res) => {
          // console.log("res", res);
          const records = res?.bizData?.records;
          if (records.length) {
            const { orderNumber, productCode, boardCode, packagingId } =
              records[0];
            if (orderNumber != form.getFieldValue("orderNumber")) {
              message.warning("工单号不一致");
              return;
            }
            if (productCode != form.getFieldValue("productCode")) {
              message.warning("产品料号不一致");
              return;
            }

            if (
              !form.getFieldValue("orderNumber") ||
              form.getFieldValue("orderNumber") == ""
            ) {
              form.setFieldValue("orderNumber", orderNumber);
              localStorage.setItem("orderNumber2", orderNumber);
            }
            if (
              !form.getFieldValue("productCode") ||
              form.getFieldValue("productCode") == ""
            ) {
              form.setFieldValue("productCode", productCode);
              localStorage.setItem("productCode2", productCode);
            }
            // 包装新增两个接口：
            // 16.3.10的产品包装，是录入条码时用的。pack/product/packaging/productPackaging
            // 16.3.8 的关箱，是手动打印前关箱用的。pack/product/packaging/packageClosureByRule

            http
              .post(
                config.API_PREFIX + "pack/product/packaging/productPackaging",
                {
                  packagingLevel: 1,
                  workOrderNumber: orderNumber,
                  productCode: productCode,
                  workStation: form.getFieldValue("workStation"),
                  uniqueCode: currentValue,
                }
              )
              .then((res1) => {
                const data = res1?.bizData;
                // 储存当前扫的条码---获取的包装信息
                setCurrentCodeMsg(res1?.bizData);
                //录入条码，调用接口成功后，判断下是否已关箱，如果已关箱，前端自动打印条码
                if (data.packageClosure == "Y") {
                  if (codeList.length < data.maxPackageQty) {
                    const newCodeList = [...codeList, currentValue];
                    setCodeList(newCodeList);
                  }
                  message.success("该产品已关箱,执行打印中...");
                  // 打印条码
                  setTimeout(() => {
                    printTemplateData();
                  }, 1500);
                } else {
                  form.setFieldValue("panelCode", "");
                  // 如果没关箱继续录入条码进去
                  const newCodeList = [...codeList, currentValue];
                  setCodeList(newCodeList);
                  setIsEdit(true);
                }
              })
              .catch((err) => {
                form.setFieldValue("panelCode", "");
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
            form.setFieldValue("panelCode", "");
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

  const handleOk = () => {
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };
  return (
    <Modal
      title="一级包装"
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
    >
      <div className="content-wrapper">
        <div className="">
          <Form
            form={form}
            name="basic"
            labelCol={{
              span: 6,
            }}
            wrapperCol={{
              span: 18,
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
                  localStorage.setItem("workStation2", e.target.value);
              }}
              // extra="工位是手动输入的；下次访问浏览器缓存带出"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear disabled={isEdit} />
            </Form.Item>

            <Form.Item
              label="工单号"
              name="orderNumber"
              onBlur={(e) => {
                if (e?.target?.value)
                  localStorage.setItem("orderNumber2", e.target.value);
              }}
              // extra="根据扫描的第一片板子自动带出；为空自动带出，不为空根据返回的进行核对；允许手动删除，修改；下次访问浏览器缓存带出"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear disabled={isEdit} />
            </Form.Item>

            <Form.Item
              label="产品料号"
              onBlur={(e) => {
                if (e?.target?.value)
                  localStorage.setItem("productCode2", e.target.value);
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
              <Input allowClear disabled={isEdit} />
            </Form.Item>
            {/* <Form.Item
              label="包装日期格式"
              name="packageDateTimeFormatter"
              rules={[
                {
                  required: true,
                  message: "请输入",
                },
              ]}
            >
              <Input allowClear disabled={isEdit} />
            </Form.Item> */}
            <Form.Item
              label="产品条码"
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
              label="产品条码列表"
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
              <Button type="primary" onClick={handleSubmit}>
                保存
              </Button>
              {/* <Button type="primary" htmlType="submit" onClick={printTemplateData}>
              测试打印
            </Button> */}
            </Form.Item>
          </Form>
        </div>
      </div>
    </Modal>
  );
};

export default App;
