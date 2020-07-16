/**
 * 加入分页监听
 * @param {*} target 分页主视图
 * @param {*} params 参数
 */
function fullPage (target, params) {
  // 可见子元素数组索引
  var visibleIndexs = []
  // 可见子元素数组索引记录
  var visibleIndexsOld = []
  // 记录已经显示过子元素索引
  var visibleIndexsRecord = []
  // 兼容IE9及以上版本
  if (!Array.from) { Array.from = function (el) { return Array.apply(this, el) } }
  // 获得所有的子节点
  var childrens = Array.from(target.children)
  // 获取子元素范围值
  var childrenRects = GetChildrenRects(childrens)
  // 监听滚动事件
  window.onscroll = function () { onScroll() }
  // 监听窗口变化
  window.onresize = function () { onScroll() }
  // 初始化调用
  onScroll(childrens, childrenRects, params)
  // 滚动函数
  function onScroll () {
    // 回调函数
    var callback = (params && params.callback) ? params.callback : null
    // 可见子元素列表回调
    var callbackVisibles = (params && params.callbackVisibles) ? params.callbackVisibles : null
    // 子元素首次显示回调，之后重复显示将不再回调
    var callbackVisiblesOnce = (params && params.callbackVisiblesOnce) ? params.callbackVisiblesOnce : null
    // 获取每个子元素头部出现多少可见区域才算可见（小于1: 按子元素本身高度的百分比计算px, 大于1: 按px进行计算）
    var callbackVisibleHeaderScales = (params && params.callbackVisibleHeaderScales) ? params.callbackVisibleHeaderScales : function () { return 0 }
    // 获取每个子元素尾部出现多少可见区域才算可见（小于1: 按子元素本身高度的百分比计算px, 大于1: 按px进行计算）
    var callbackVisibleFooterScales = (params && params.callbackVisibleFooterScales) ? params.callbackVisibleFooterScales : function () { return 0 }
    // 窗口滚动范围Y值
    var scrollY = document.documentElement.scrollTop || document.body.scrollTop
    // 窗口高度
    var scrollHeight = document.documentElement.clientHeight || document.body.clientHeight
    // 窗口滚动范围最大Y值
    var scrollMaxY = scrollY + scrollHeight
    // 便利子元素范围
    childrenRects.forEach(function (rect, index) {
      // 显示多少比例算可见
      var visibleHeaderScale = callbackVisibleHeaderScales(index, rect)
      var visibleFooterScale = callbackVisibleFooterScales(index, rect)
      // 计算可见比例
      var rectY = rect.y + (visibleHeaderScale > 1 ? visibleHeaderScale : rect.height * visibleHeaderScale)
      var rectMaxY = rect.maxY - (visibleFooterScale > 1 ? visibleHeaderScale : rect.height * visibleFooterScale)
      // 判断是否在显示范围内
      var isVisible = (rectY >= scrollY && rectY <= scrollMaxY) || (rectMaxY >= scrollY && rectMaxY <= scrollMaxY) || (scrollY >= rectY && scrollMaxY <= rectMaxY) || (scrollMaxY >= rectY && scrollMaxY <= rectMaxY)
      // 获得在可见子元素列表索引
      var indx = visibleIndexs.indexOf(index)
      // 当前子元素可见状态
      if (isVisible) {
        // 是否存在，不存在则添加
        if (indx === -1) {
          // 添加
          visibleIndexs.push(index)
          // 回调
          if (callback) { callback(index, isVisible, visibleIndexs, childrens) }
        }
      } else {
        // 是否存在，存在则移除
        if (indx !== -1) {
          // 移除
          visibleIndexs.splice(indx, 1)
          // 回调
          if (callback) { callback(index, isVisible, visibleIndexs, childrens) }
        }
      }
      // 子元素首次显示回调
      if (callbackVisiblesOnce && isVisible) {
        // 检查是否已经显示过
        var indx = visibleIndexsRecord.indexOf(index)
        // 如果首次显示则加入记录进行回调
        if (indx === -1) {
          // 添加到已显示过数组记录
          visibleIndexsRecord.push(index)
          // 回调
          callbackVisiblesOnce(index, isVisible, childrens)
        }
      }
    })
    // 可见子元素回调
    if (callbackVisibles) {
      // 是否为重复数据
      var isRepeat = visibleIndexsOld.length ? visibleIndexsOld.join() === visibleIndexs.join() : false
      // 如果没有重复数据则回调出去
      if (!isRepeat) { callbackVisibles(visibleIndexs, childrens) }
      // 记录数据下次用于比较
      visibleIndexsOld = visibleIndexs.concat()
    }
  }
  // 获取所有子元素当前状态的范围值
  function GetChildrenRects (childrens) {
    // 参数数组
    var rects = []
    // 遍历获取
    childrens.forEach(function (children) {
      // 存储
      rects.push({
        // 当前标签距离浏览器顶部Y值
        y: children.offsetTop,
        // 当前标签高度
        height: children.offsetHeight,
        // 当前标签最大Y值
        maxY: children.offsetTop + children.offsetHeight
      })
    })
    // 返回
    return rects
  }
}
