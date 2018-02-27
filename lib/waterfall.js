(function (root) {

  /**
   * Template 字符串渲染模板
  */
  class Template {
    constructor() {
    }
    /**
     * 使用模板渲染数据模型，数据使用双大括号"{{}}"作为标识
     * @param {String} tpl - 字符串模板
     * @param {Object} view - 数据模型
     * @return {String} - 返回绑定数据后的字符串模板
     */
    render(tpl, view) {
      var outerReg = /{{#\s*(.*?)\s*}}((.|\s)*){{\/\s*\1\s*}}/g
      var innerReg = /{{\s*(.*?)\s*}}/g
      return tpl.replace(outerReg, function (match, $1, $2) {
        if (view[$1]) {
          if (Array.isArray(view[$1])) {
            return view[$1].map(function (item) {
              return $2.trim().replace(innerReg, function (match, $1) {
                return item[$1] || ''
              })
            }).join('')
          }
          return $2.trim().replace(innerReg, function (match, $1) {
            return view[$1] || ''
          })
        } else {
          return ''
        }
      }).trim()
        .replace(innerReg, function (match, $1) {
          return $1.split('.').reduce((result, item) => {
            return result[item]
          }, view) || ''
        })
    }
  }

  /**
   * 
   * @param {Function} func - 延迟执行函数
   * @param {String} wait - 延迟毫秒数
   * @param {Boolean} immediate - true 立即执行
   * @return {Function} - 返回函数
   */
  function debounce(func, wait, immediate) {
    var timeout
    return function () {
      var context = this, args = arguments
      var later = function () {
        /** 延迟wait执行的函数 */
        timeout = null
        if (!immediate) {
          func.apply(context, args)
        }
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) {
        /** 立即执行函数，无延迟 */
        func.apply(context, args)
      }
    }
  }

  /**
   * 解析字符串为DOM对象
   * @param {String} nodelist - DOM元素的字符串表示
   * @return {ArrayLike} - 类数组对象
   */
  function parseDom (nodelist) {
    let element = document.createElement('div')
    element.innerHTML = nodelist
    return element.children
  }

  /**
   * 瀑布流效果
   * @param {Objec} config - 瀑布流效果的配置选项
   */
  function waterfall(config) {
    config = Object.assign({ 
      cols: 3,
      itemClass: 'item', 
      gutterWidth: 10, 
      gutterHeight: 10, 
      template: 'no referering templates',
      path: undefined,
      params: {},
      callbacks: {
        loadingStart: function () {},
        loadingFinished: function () {},
        loadingError: function () {}
      },
      maxPage: undefined,
      state: {
        curPage: 0
      }
    }, config)
    let cols = config.cols,
      container = document.querySelector(config.container),
      children = container.children,
      gutterWidth = config.gutterWidth || parseInt(getComputedStyle(children[0]).marginLeft),
      gutterHeight = config.gutterHeight || parseInt(getComputedStyle(children[0]).marginTop),
      perColumnWidth = parseInt(container.clientWidth / cols) - 2 * gutterWidth,
      totalArray = new Array(cols).fill(0),
      tpl = config.template instanceof HTMLElement ? config.template.textContent.trim() : config.template
    
    container.style.position = 'relative'

    /**
     * 将元素添加到最小列中
     * @param {HTMLElement} children - HTML元素
     * @param {Boolean} newFlag - 是否插入元素，默认false
     */
    function eleAppendToMin (children, newFlag = false) {
      for (let i = 0; i < children.length; i++) {
        children[i].style.display = 'none'
        children[i].classList.add(config.itemClass)
        children[i].style.position = 'absolute'
        children[i].style.boxSizing = 'border-box'
        children[i].style.width = perColumnWidth + 'px'
        let min = Math.min.apply(null, totalArray),
          index = totalArray.indexOf(min)
        children[i].style.top = totalArray[index] + 'px'
        children[i].style.left = index * (perColumnWidth + 2 * gutterWidth) + 'px'
        if (newFlag) {
          container.appendChild(children[i])          
        }
        children[i].style.display = 'block'
        totalArray[index] += children[i].offsetHeight + gutterHeight
        
      }
      container.style.height = Math.max.apply(null, totalArray) + 'px'      
    }
    eleAppendToMin(children)
    
    /**
     * 添加鼠标滚轮处理事件
     */
    window.addEventListener('scroll', debounce(function () {
      if (config.path && container.getBoundingClientRect().bottom < window.innerHeight) {
        let pageUrl
        config.state.curPage++
        pageUrl = typeof config.path === 'function' ? config.path(config.state.curPage) : config.path 
        if (!pageUrl || (config.maxPage && config.state.curPage > config.maxPage)) {
          config.callbacks.loadingFinished({
            state: 'ok',
            message: 'no more data'
          })
          return
        }
        config.callbacks.loadingStart()
        fetch(pageUrl, {
          cache: 'no-cache'
        }).then((res) => {
          return res.json()
        }).then((res) => {
          let template = new Template()
          let data = template.render(tpl, res)
          let nodes = [].slice.apply(parseDom(data))
          eleAppendToMin(nodes, true)
          return {
            status: 'ok',
            res
          }
        }).then((res) => {
          config.callbacks.loadingFinished(res)
        }).catch((error) => {
          config.callbacks.loadingError(error)
        })
      }
    }, 500))
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