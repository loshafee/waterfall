(function (root) {

  function waterfall (config = {cols: 2, gutterWidth: 10, gutterHeight: 10}) {
    let cols = config.cols,
      container = document.querySelector(config.container),
      children = container.children,
      gutterWidth = config.gutterWidth || parseInt(getComputedStyle(children[0]).marginLeft),
      gutterHeight = config.gutterHeight || parseInt(getComputedStyle(children[0]).marginTop),
      perColumnWidth = parseInt(container.clientWidth / cols) - 2 * gutterWidth,
      totalArray = new Array(cols).fill(0)
    
    container.style.position = 'relative'
    for (let i = 0; i < children.length; i++) {
      children[i].style.position = 'absolute'
      children[i].style.boxSizing = 'border-box'
      children[i].style.width = perColumnWidth + 'px'

      let min = Math.min.apply(null, totalArray),
        index = totalArray.indexOf(min)
      children[i].style.top = totalArray[index] + 'px'
      children[i].style.left = index * (perColumnWidth + 2 * gutterWidth) + 'px'
      totalArray[index] += children[i].offsetHeight + gutterHeight
    }
    container.style.height = Math.max.apply(null, totalArray) + 'px'
  }

  /** 模块化封装 */
  if (typeof define !== 'undefined' && define.amd) {
    define([], function () {
      return waterfall
    })
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = waterfall
  } else {
    root.waterfall = waterfall
  }
}(this))