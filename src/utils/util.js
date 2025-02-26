// 当需要遍历嵌套结构并查找特定 key 值时，可以使用递归算法。下面是一个递归函数的示例，用于在给定的菜单项数组中查找特定 key 值：
export function findKeyInMenuItems(menuItems, targetKey) {
  // console.log(menuItems, targetKey)
  for (let i = 0; i < menuItems.length; i++) {
    const menuItem = menuItems[i];

    if ('my-app/' + menuItem.key === targetKey) {
      return menuItem; // 如果找到了目标 key，返回该菜单项
    }

    if (menuItem.children) {
      const foundItem = findKeyInMenuItems(menuItem.children, targetKey);
      if (foundItem) {
        return foundItem; // 如果在子菜单中找到了目标 key，返回子菜单项
      }
    }
  }

  return null; // 如果没有找到目标 key，返回 null
}

export function downloadCSV(csvString, filename) {
  // 创建 CSV 数据的 Blob 对象
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  // 创建下载链接
  const downloadLink = document.createElement('a');
  const url = URL.createObjectURL(blob);
  downloadLink.href = url;
  downloadLink.download = filename;

  // 触发点击事件以启动下载
  document.body.appendChild(downloadLink);
  downloadLink.click();

  // 清理资源
  document.body.removeChild(downloadLink);
  URL.revokeObjectURL(url);
}

// 示例用法
// const csvData = "Name,Email\nJohn,john@example.com\nJane,jane@example.com";
// const fileName = "example.csv";
// downloadCSV(csvData, fileName);

export function getDictionaryListByCode(name) {
  let typeList =  JSON.parse(localStorage.getItem('dictionaryType') || '[]');
  let code = typeList.find(item => item.label === name)?.value;
  // console.log('codecodecodecodecodecodecodecodecodecode',code)
  let list =  JSON.parse(localStorage.getItem('dictionaryList') || '[]');
  return list.filter(item => item.dictType == code).map(item => {
    return {
      label: item.dictKey,
      value: item.dictValue
    }
  });
}







