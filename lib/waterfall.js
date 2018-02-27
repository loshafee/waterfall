(function (root) {

  class Template {
    constructor() {
    }
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
  function debounce(func, wait, immediate) {
    var timeout
    return function () {
      var context = this, args = arguments
      var later = function () {
        timeout = null
        if (!immediate) {
          func.apply(context, args)
        }
      }
      var callNow = immediate && !timeout
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
      if (callNow) {
        func.apply(context, args)
      }
    }
  }

  function parseDom (nodelist) {
    let element = document.createElement('div')
    element.innerHTML = nodelist
    return element.children
  }
  function waterfall(config) {
    config = Object.assign({ 
      cols: 3, 
      gutterWidth: 10, 
      gutterHeight: 10, 
      template: 'no referering templates',
      path: undefined,
      params: {},
      callbacks: {
        loadingStart: function () {},
        loadingFinished: function () {},
        loadingError: function () {},
        renderData: function () {}
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

    function eleAppendToMin (children, newFlag) {
      for (let i = 0; i < children.length; i++) {
        children[i].style.display = 'none'
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
    
    window.addEventListener('scroll', debounce(function () {
      if (container.getBoundingClientRect().bottom < window.innerHeight) {
        fetch(config.path, {
          cache: 'no-cache'
        }).then((res) => {
          return res.json()
        }).then((res) => {
          let template = new Template()
          let data = template.render(tpl, res)
          let nodes = [].slice.apply(parseDom(data))
          eleAppendToMin(nodes, true)
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