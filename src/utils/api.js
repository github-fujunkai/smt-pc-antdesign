export default {
  authLogin: 'auth/login',  // 登录

  // 字典
  dictBaseFwa: 'dict/base/fwa', // 厂区、车间、产线 id-value 列表
  dictBaseAll: 'dict/base/all', // 查询所有字典列表

  itemReplaceCurrency: 'item/replace/currency',  // 新增/修改通用替代物料表
  itemReplaceCurrencyPage: 'item/replace/currency/page',  // 分页查询通用替代物料
  itemReplaceCurrencyLoadTemplate: 'item/replace/currency/loadTemplate',  // 下载模板
  itemReplaceCurrencyImportData: 'item/replace/currency/importData',  // 分页查询通用替代物料
  itemReplaceCurrencyExportData: 'item/replace/currency/exportData',  // 分页查询通用替代物料

  itemContrastAll: 'item/contrast/all',  // 料号对比-料号比对配置查询
  itemContrastSaveOrUpdate: 'item/contrast/saveOrUpdate',  // 料号对比-新增料号比对配置
  itemContrast: 'item/contrast',  // 料号对比-通过id删除新料号比对配置表

  barcodeReaderAll: 'barcode/reader/all', // 条码解析查询
  barcodeReaderSaveOrUpdate: 'barcode/reader/saveOrUpdate', // 新增条码解析
  barcodeReader: 'barcode/reader', // 通过id删除新条码解析表

  itemReplaceProgramPage: 'item/replace/program/page',  // 分页查询程序替代物料
  itemReplaceProgram: 'item/replace/program',  // 新增/修改程序替代物料表
  itemReplaceProgramLoadTemplate: 'item/replace/program/loadTemplate',  // 下载模板
  itemReplaceProgramImportData: 'item/replace/program/importData',  // 导入程序替代料
  itemReplaceProgramExportData: 'item/replace/program/exportData',  // 导出程序替代料

  itemReplaceProjectPage: 'item/replace/project/page',  // 分页查询工单替代物料
  itemReplaceProject: 'item/replace/project',  // 新增/修改工单替代物料表
  itemReplaceProjectLoadTemplate: 'item/replace/project/loadTemplate',  // 下载模板
  itemReplaceProjectImportData: 'item/replace/project/importData',  // 导入工单替代料
  itemReplaceProjectExportData: 'item/replace/project/exportData',  // 导出工单替代料

  pdaScanLogPage: 'pda/scan/log/page',  // 信息查询-扫描记录
  pdaScanLogExportData: 'pda/scan/log/exportData', // 导出扫描记录
  wipHistoryPpage: 'wip/history/page',  // 信息查询-过站记录
  wipHistoryExportData: 'wip/history/exportData',  // 导出过站记录
  deviceMaterialTracePage: 'device/material/trace/page',  // 信息查询-追溯信息
  deviceMaterialTraceExportData: 'device/material/trace/exportData',  // 导出追溯信息
  stopInfoPage: 'stop/info/page',  // 信息查询-停机信息
  stopInfoExportData: 'stop/info/exportData', // 导出停机信息
  projectItemPage: 'project/item/page',  // 信息查询-工单物料
  projectItemExportData: 'project/item/exportData', // 导出工单物料
  itemHistoryPage: 'item/history/page',  // 信息查询-物料记录
  itemHistoryExportData: 'item/history/exportData',  // 导出物料记录

  areaLine: 'area/line', // 新增/删除产线
  areaLinePage: 'area/line/page', // 产线管理-分页查询
  areaLineReadConfig: 'area/line/readConfig', // 读取设备上的设备信息

  paramConfigAll: 'param/config/all', // 查询所有参数配置
  paramConfigSaveOrUpdate: 'param/config/saveOrUpdate', // 新增或修改参数配置

  tracePreventPage: 'trace/prevent/page',  // 防错追溯-分页查询
  tracePreventExportData: 'trace/prevent/exportData',  // 防错追溯-导出程序替代物料

  authMenuTree: 'auth/menu/tree', // 返回树形菜单集合
  authMenu: 'auth/menu', // 新增/修改/删除菜单
  authRoleList: 'auth/role/list',  // 获取角色列表
  authRole: 'auth/role', // 添加/修改/删除角色
  authRoleMenu: 'auth/role/menu',  // 更新角色菜单
  authUser: 'auth/user', // 添加/修改/删除用户
  authUserPage: 'auth/user/page', // 获取用户列表分页

  areaFactoryPage: 'area/factory/page', // 厂区列表-分页查询
  areaFactory: 'area/factory', // 新增/修改/删除厂区

  areaWorkShopPage: 'area/work/shop/page', // 车间列表-分页查询
  areaWorkShop: 'area/work/shop', // 新增/修改/删除车间

  printTemplate: 'print/template',  // 新增/修改/删除打印模板
  printTemplatePage: 'print/template/page', // 打印模板-分页查询
  printTemplateVariable: 'print/template/variable', // 查询打印模板变量

  basicItemBaseInfo: 'basic/item/baseInfo', // 新增/修改/删除物料基础信息
  basicItemBaseInfoPage: 'basic/item/baseInfo/page',  // 物料基础信息-分页查询

  wmsItemStockIn: 'wms/item/stockIn',  // 新增/修改/删除物料入库单-主表
  wmsItemStockInPage: 'wms/item/stockIn/page',  // 物料入库单-主表-分页查询
  wmsItemStockInGenerateUniqueCode: 'wms/item/stockIn/generateUniqueCode', // 生成物料唯一码（来料打印）
  printTemplatePrintData: 'print/template/print/data', // 生成打印数据

  basicTestDefectCode: 'basic/test/defectCode', // 新增/修改/删除不良代码信息
  basicTestDefectCodePage: 'basic/test/defectCode/page', // 不良代码信息-分页查询

  barcodegenrule: 'barcodegenrule',  // 新增/修改/删除条码生成规则
  barcodegenrulePage: 'barcodegenrule/page',  // 新增条码生成规则-分页查询

  prodworkorder: 'prodworkorder',  // 新增/编辑/删除工单信息
  prodworkorderPage: 'prodworkorder/page',  // 工单信息-分页查询

  prodproductionorder: 'prodproductionorder', // 批量新增制令单

  device: 'device', // 新增/修改/删除设备信息
  devicePage: 'device/page',  // 设备信息-分页查询

  wmsProductStockOut: 'wms/product/stockOut',  // 新增/修改/删除产品出库单-主表 
  wmsProductStockOutPage: 'wms/product/stockOut/page', // 产品出库单-主表-分页查询

  wmsPanelUniqueCodePage: 'wms/panel/uniqueCode/page', // 产品条码信息-分页查询

  packProductPackaging: 'pack/product/packaging',  // 新增/修改/删除产品包装-主表
  packProductPackagingPage: 'pack/product/packaging/page',  // 新增产品包装-主表-分页查询

  packProductPackagingCode: 'pack/product/packaging/code', // 新增/编辑/删除产品包装-条码（子表）
  packProductPackagingCodePage: 'pack/product/packaging/code/page', // 产品包装-条码（子表）-分页查询

  wmsProductStockOutDetail: 'wms/product/stockOut/detail', // 新增/删除产品出库单-明细表

  visualInspection: 'visual/inspection', // 新增/修改/删除目检
  visualInspectionPage: 'visual/inspection/page', // 新增/修改/删除目检-分页查询

  prodRepairDefectList: 'prod/repair/defect/list', // 不良信息列表
  prodRepair: 'prod/repair', // 新增/修改/删除维修信息
  prodRepairPage: 'prod/repair/page',  // 维修信息-分页查询
  productNoGetWorkOrderNumber: 'prod/repair/productNoGetWorkOrderNumber',  // 根据产品条码查工单号

  packProductConfig: 'pack/product/config', // 新增/修改/删除产品包装-设置
  packProductConfigPage: 'pack/product/config/page',  // 产品包装-设置-分页查询

  packPproductPpackagingGenerateOrderNumber: 'pack/product/packaging/generateOrderNumber', // 生成包装单号
}