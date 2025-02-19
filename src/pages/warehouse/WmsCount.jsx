import React, { useState, useEffect } from "react";
import { Space, Table, Tag, Checkbox, Col, Row } from "antd";
import http from "../../utils/http";
import { config } from "../../utils/config";
import api from "../../utils/api";
import qs, { stringify } from "qs";
const App = (props) => {
  const { type = 1, WmsCountData } = props;
  const [checkedValues, setCheckedValues] = useState([]);
  const onChange = (checkedValues) => {
    console.log("checked = ", checkedValues);
    console.log("fieldsColumns[type] = ", fieldsColumns[type]);
    setCheckedValues(checkedValues);
    if (WmsCountData) {
      WmsCountData.size = undefined;
      WmsCountData.current = undefined;
    }
    http
      .post(config.API_PREFIX + `statistics/wms`, {
        type: type,
        fields: checkedValues,
        param: WmsCountData,
      })
      .then((res) => {
        setData(res?.bizData || []);
      })
      .catch((err) => {});
  };
  const [data, setData] = useState([]);

  const fieldsOptions = {
    1: [
      {
        label: "供应商",
        value: "supplier",
      },
      {
        label: "采购单号",
        value: "purchase_order_number",
      },
      {
        label: "入库单",
        value: "inbound_order_id",
      },
      {
        label: "入库人",
        value: "create_by",
      },
    ],
    2: [
      {
        label: "出库单",
        value: "outbound_order_id",
        key: "outbound_order_id",
      },
      {
        label: "产线",
        value: "area_id",
        key: "area_id",
      },
      {
        label: "领料人",
        value: "issuer",
        key: "issuer",
      },
      {
        label: "发料人",
        value: "receiver",
        key: "receiver",
      },
    ],
    3: [
      {
        label: "库位",
        value: "STORAGE_LOCATION",
        key: "STORAGE_LOCATION",
      },
      {
        label: "供应商",
        value: "SUPPLIER",
        key: "SUPPLIER",
      },
      {
        label: "批次号",
        value: "LOT_NO",
        key: "LOT_NO",
      },
    ],
    4: [
      {
        label: "盘点单",
        value: "inventory_order_id",
        key: "inventory_order_id",
      },
      {
        label: "库位",
        value: "storage_location",
        key: "storage_location",
      },
      {
        label: "盘点人",
        value: "create_by",
        key: "create_by",
      },
      {
        label: "盘点类型",
        value: "inventory_type",
        key: "inventory_type",
      },
    ],
  };
  //   字段列表:
  // 通用字段列表：qty 数量,package_qty 盘数,item_code 物料代码,material_description 物料描述
  // 1(入库单): "supplier" 供应商,"purchase_order_number" 采购单号,"inbound_order_id" 入库单,"create_by" 入库人。
  // 2(出库单): "outbound_order_id" 出库单,"area_id" 产线,"issuer" 领料人,"receiver" 发料人。
  // 3(库存查询): "STORAGE_LOCATION" 库位,"SUPPLIER" 供应商,"LOT_NO" 批次号 （这里目前没有物料状态）。
  // 4(盘点单): "inventory_order_id" 盘点单,"storage_location" 库位,"create_by" 盘点人,"inventory_type" 盘点类型。

  const fieldsColumns = {
    1: [
      {
        title: "料号",
        dataIndex: "item_code",
        key: "item_code",
      },
      {
        title: "物料描述",
        dataIndex: "material_description",
        key: "material_description",
      },
      {
        title: "盘数",
        dataIndex: "package_qty",
        key: "package_qty",
      },
      {
        title: "数量",
        dataIndex: "qty",
        key: "qty",
      },
      {
        title: "供应商",
        dataIndex: "supplier",
        key: "supplier",
      },
      {
        title: "采购单号",
        dataIndex: "purchase_order_number",
        key: "purchase_order_number",
      },
      {
        title: "入库单",
        dataIndex: "inbound_order_id",
        key: "inbound_order_id",
      },
      {
        title: "入库人",
        dataIndex: "create_by",
        key: "create_by",
      },
    ],
    2: [
      {
        title: "料号",
        dataIndex: "item_code",
        key: "item_code",
      },
      {
        title: "物料描述",
        dataIndex: "material_description",
        key: "material_description",
      },
      {
        title: "盘数",
        dataIndex: "package_qty",
        key: "package_qty",
      },
      {
        title: "数量",
        dataIndex: "qty",
        key: "qty",
      },
      {
        title: "出库单",
        dataIndex: "outbound_order_id",
        key: "outbound_order_id",
      },
      {
        title: "产线",
        dataIndex: "area_id",
        key: "area_id",
      },
      {
        title: "领料人",
        dataIndex: "issuer",
        key: "issuer",
      },
      {
        title: "发料人",
        dataIndex: "receiver",
        key: "receiver",
      },
    ],
    3: [
      {
        title: "料号",
        dataIndex: "item_code",
        key: "item_code",
      },
      {
        title: "物料描述",
        dataIndex: "material_description",
        key: "material_description",
      },
      {
        title: "盘数",
        dataIndex: "package_qty",
        key: "package_qty",
      },
      {
        title: "数量",
        dataIndex: "qty",
        key: "qty",
      },
      {
        title: "库位",
        dataIndex: "STORAGE_LOCATION",
        key: "STORAGE_LOCATION",
      },
      {
        title: "供应商",
        dataIndex: "SUPPLIER",
        key: "SUPPLIER",
      },
      {
        title: "批次号",
        dataIndex: "LOT_NO",
        key: "LOT_NO",
      },
    ],
    4: [
      {
        title: "料号",
        dataIndex: "item_code",
        key: "item_code",
      },
      {
        title: "物料描述",
        dataIndex: "material_description",
        key: "material_description",
      },
      {
        title: "盘数",
        dataIndex: "package_qty",
        key: "package_qty",
      },
      {
        title: "数量",
        dataIndex: "qty",
        key: "qty",
      },
      {
        title: "盘点单",
        dataIndex: "inventory_order_id",
        key: "inventory_order_id",
      },
      {
        title: "库位",
        dataIndex: "storage_location",
        key: "storage_location",
      },
      {
        title: "盘点人",
        dataIndex: "create_by",
        key: "create_by",
      },
      {
        title: "盘点类型",
        dataIndex: "inventory_type",
        key: "inventory_type",
      },
    ],
  };
  useEffect(() => {
    console.log("WmsCountData", WmsCountData);
    if (WmsCountData) {
      WmsCountData.size = undefined;
      WmsCountData.current = undefined;
    }
    http
      .post(config.API_PREFIX + `statistics/wms`, {
        type: type,
        fields: fieldsOptions[type].filter((item) => item.dataIndex).concat(checkedValues), //['item_code', 'material_description', 'package_qty', 'qty']
        param: WmsCountData,
      })
      .then((res) => {
        setData(res?.bizData || []);
      })
      .catch((err) => {});
  }, [WmsCountData]);
  return (
    <div className="p-4">
      <Row>
        <Col span={2}>汇总方式：</Col>
        {/* defaultValue={["出库单"]} */}
        <Col span={12}>
          {/* defaultValue={['item_code', 'material_description', 'package_qty', 'qty']} */}
          <Checkbox.Group options={fieldsOptions[type]} onChange={onChange} />
        </Col>
      </Row>

      <Table
        columns={fieldsColumns[type].filter((item) => {
          return (
            checkedValues.includes(item.dataIndex) ||
            item.dataIndex === "item_code" ||
            item.dataIndex === "material_description" ||
            item.dataIndex === "package_qty" ||
            item.dataIndex === "qty"
          );
        })}
        dataSource={data}
      />
    </div>
  );
};
export default App;
