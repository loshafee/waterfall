# waterfall
Javascript 瀑布流效果

## Examples
*在页面中引入 waterfall.js
        
        <script src='./lib/waterfall.js'>

* waterfall 使用方法

        waterfall({
            container: '#box', // 瀑布流容器
            itemClass: 'item', // 子项className
            cols: 3, // 瀑布流列数
            maxPage: 6, // 请求的最大次数
            gutterWidth: 10, // 水平间隔
            gutterHeight: 20, // 竖直间隔
            gutterType: 'space-around', // 水平空白的类型，'space-between'，'space-around'，默认'space-between'
            defaultImage: './imgs/default.jpg', // 图片加载失败替换图片
            preloadImage: true, // 是否需要进行图片预加载
            preloadPercent: function (state) { // 图片预加载过程中的调用函数
                console.log('图片已加载' + state.current/state.total)
                console.log(state)
            },
            preloadComplete: function (promise) { // 图片完全加载回调函数，返回promise对象
                promise.then(function (state) {
                    console.log(state)
                    document.getElementById('mask').style.display = 'none'
                })
            },
            path: function (curPage) { // fetch 请求地址
                return './users.json?page=' + curPage
            },
            template: document.getElementById('waterfall-tpl'), // 瀑布流每项的模板
            callbacks: { // fetch 请求的回调情况
                loadingStart: function () { // 请求开始函数
                    console.log('ajax request ...')
                    document.getElementById('mask').style.display = 'block'
                },
                loadingFinished: function (res) { // 请求结束函数
                    console.log('ajax response', res)               
                },
                loadingError: function (error) { // 请求失败函数
                    console.log(error)
                }
            }
        })


[瀑布流 Demo](https://loshafee.github.io/waterfall/demos/waterfall.html)

## License
MIT