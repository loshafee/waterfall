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
   * 节点列表内图片img的预处理
   * @param {HTMLCollection} nodeLists - 图片预处理父级节点
   * @param {Function} loadingFn - 图片加载过程处理函数
   * @param {Function} callback - 图片加载完毕处理函数
   * @param {Mixed} args - callback 函数荷载参数 
   */
  function preloadImage (nodeLists, loadingFn, callback, ...args) {
    let imgs = []
    for (let i = 0; i < nodeLists.length; i++) {
      if (nodeLists[i] instanceof Image) {
        imgs.push(nodeLists[i])
        continue
      }
      imgs = imgs.concat([].slice.apply(nodeLists[i].getElementsByTagName('img')))
    }

    let lens = imgs.length,
      current = 0
    let promises = imgs.map(function (img) {
      let promise = new Promise(function (resolved, rejected) {
        let image = new Image()
        image.src = img.getAttribute('src')
        image.onload = function () {
          if (loadingFn && typeof loadingFn !== 'function') {
            throw new Error( loadingFn + 'is not a function')
          }
          current++
          loadingFn({
            total: lens,
            current,
            loaded: lens === current
          })
          resolved(img)
        }
        image.onerror = image.onabort = rejected
      })
      return promise
    })

    return Promise.all(promises).then(function (res) {
      res.forEach(function (img) {
        img.src =  img.getAttribute('src')
      })
      return {
        imgs: res
      }
    }).then(function () {
      if (callback && typeof callback !== 'function') {
        throw new Error( callback + 'is not a function')
      }
      callback(...args)
    })
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
      gutterType: 'space-between',
      template: 'no referering templates',
      path: undefined,
      preloadImage: false,
      preloadPercent: function () {},
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
      gutterWidth,
      gutterHeight,
      perColumnWidth = parseInt((container.offsetWidth - (cols + 1) * gutterWidth) / cols),
      totalArray = new Array(cols).fill(0),
      tpl = config.template instanceof HTMLElement ? config.template.textContent.trim() : config.template,
      perReg = /^\d*\.?\d*%$/

    gutterWidth = perReg.test(config.gutterWidth) ? container.offsetWidth * parseInt(config.gutterWidth) * 0.01 : parseInt(config.gutterWidth)
    gutterHeight = perReg.test(config.gutterHeight) ? container.offsetWidth * parseInt(config.gutterHeight) * 0.01 : parseInt(config.gutterHeight)

    console.log(gutterWidth, gutterHeight)
    if (config.gutterType === 'space-around') {
      perColumnWidth = parseInt((container.offsetWidth - 2 * cols * gutterWidth) / cols)
    }

    container.style.position = 'relative'
    appendElement(children)
    requestData()

    function calcLeft (colIndex, gutterType) {
      if (gutterType === 'space-around') {
        return colIndex * perColumnWidth + (2 * colIndex + 1) * gutterWidth
      } else {
        return colIndex * perColumnWidth + (colIndex % cols * 2 * gutterWidth)
      }
    }
    /**
     * 将元素添加到最小列中
     * @param {HTMLElement} children - HTML元素
     * @param {Boolean} newFlag - 是否为插入元素，默认false，true插入新元素
     */
    function eleAppendToMin (nodeLists, newFlag = false) {
      
      for (let i = 0; i < nodeLists.length; i++) {
        let min = Math.min.apply(null, totalArray),
          index = totalArray.indexOf(min)
        nodeLists[i].style.top = totalArray[index] + 'px'
        nodeLists[i].style.left = calcLeft(index, config.gutterType) + 'px'
        nodeLists[i].style.width = perColumnWidth + 'px'
        if (newFlag) {
          container.appendChild(nodeLists[i])          
        }
        nodeLists[i].style.display = 'block'
        totalArray[index] += nodeLists[i].offsetHeight + gutterHeight
        
      }
      container.style.height = Math.max.apply(null, totalArray) - gutterHeight + 'px'
      if (container.scrollWidth !== container.offsetWidth && container.offsetHeight > window.innerHeight) {
        /** 处理出现滚动条情况 */
        reInit()
      }
    }

    function appendElement (nodeLists, newFlag = false) {
      for (let i = 0; i < nodeLists.length; i++) {
        nodeLists[i].style.display = 'none'
        nodeLists[i].classList.add(config.itemClass)
        nodeLists[i].style.position = 'absolute'
        nodeLists[i].style.boxSizing = 'border-box'
        nodeLists[i].style.margin = 0
      }
      if (config.preloadImage) {
        preloadImage(nodeLists, config.preloadPercent, eleAppendToMin, nodeLists, newFlag)
      } else {
        eleAppendToMin(nodeLists, newFlag)
      }
    }

    /** 重新初始化，排序每一项元素 */
    function reInit() {
      perColumnWidth = parseInt((container.offsetWidth - (cols + 1) * gutterWidth) / cols)      
      if (config.gutterType === 'space-around') {
        perColumnWidth = parseInt((container.offsetWidth - 2 * cols * gutterWidth) / cols)
      }
      totalArray.fill(0)
      appendElement(children)
    }

    /** 使用fetch 请求数据 */
    function requestData () {
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
        let nodeLists = [].slice.apply(parseDom(data))
        
        appendElement(nodeLists, true)
        
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
    /**  添加鼠标滚轮处理事件 */
    window.addEventListener('scroll', debounce(function () {
      if (config.path && container.getBoundingClientRect().bottom <= window.innerHeight) {
        requestData()
      }
    }, 500))
    /** 添加改变窗口事件，自适应屏幕 */
    window.addEventListener('resize', debounce(reInit, 100))
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