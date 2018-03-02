# waterfall
Javascript 瀑布流效果

## API
waterfall(config)
* `config` (`Object`) 配置对象
### config 属性说明
| Name       | Type         | Default-value     | Description
|:-:     | :-:   | :-:     | :-:
| `container`  | String \| HTMLElement| `''` | 瀑布流生效元素
| `itemClass`  | String   | `'item'`    | 子项className
| `cols`  | Number    | `1` | 瀑布流列数
| `gutterWidth` | String \| Number  | `10`  | 子项水平间隔，可设置成像素或百分比，以`container`宽度为参考
| `gutterHeight` | String \| Number | `10` | 子项竖直间隔，可设置成像素或百分比，以`container`宽度为参考
| `gutterType` | String | `space-between`   | 水平间隔空白的类型，`space-around`，`space-between`
| `preloadImage` | Boolean | `false` | 是否需要进行图片预加载处理
| `defaultImage` | String | `undefined`    | 图片加载失败的替换图片路径，当`preloadImage` 为 `true` 时生效
| `preloadPercent` | Function | `function (state) {}` | 图片预加载过程中的调用函数，参数 `state` 为调用信息
| `preloadComplete` | Function | `function (promise) {}` | 图片预加载完成的回调函数，参数 `promise` 为 Promise 对象
| `path` | Function \| String | `undefined` | `request` 请求地址，当为函数时，返回字符串，暂时只支持 `GET` 方式请求，使用 [`fetch API`](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) 发起请求
| `maxPage` | String | `undefined` | `request` 请求的最大次数
| `template` | String \| HTMLElement | `'no referering templates'` | 瀑布流子项的解析模板，见下例 [template](#Template)
| `callbacks` | Object | `{ loadingStart: fn, loadingFinished: fn, loadingError: fn }` | `request` 请求的回调情况，见下面代码

`config.callbacks` 属性说明

        callbacks: {
            /**
             *   fetch 请求开始前回调函数
             */
            loadingStart: function () {},

            /**
             *  fetch 请求结束回调函数
             * @param {Object} res - 请求返回结果信息
             */
            loadingFinished: function (res) {
                console.log(res)
            },

            /**
             *  fetch 请求失败回调函数
             * @param {Object} error - 请求错误信息
             */
            loadingError: function (error) {
                console.log(error)
            }
        }

## Template
`waterfall` 实现了一个简单的模板渲染引擎，用于实现瀑布流的子项显示。
使用双大括号 `{{}}` 包裹变量， `{{#}}` 包裹遍历的对象数组

模板可使用以下DOM 结构表示，或直接使用字符串

        <script type="text/template" id="waterfall-tpl">
            {{#results}}
                <div class="item">
                    <img src="{{url}}" />
                    <p>name: {{name}}</p>
                    <p>age: {{age}}</p>
                </div>
            {{/results}}
        </script>

数据模型为JSON对象

        {
            "results": [{
                "name": "Tom",
                "age": 20,
                "url": "./imgs/1.jpg"
            }, {
                "name": "Jack",
                "age": 22,
                "url": "./ims/2.jpg"
            },{
                "name": "Marry",
                "age": 16,
                "url": "./imgs/3.jpg"
            }]
        }

渲染之后的结果为

        <div class="item">
            <img src="./imgs/1.jpg" />
            <p>name: Tom</p>
            <p>age: 20</p>
        </div>
        <div class="item">
            <img src="./ims/2.jpg" />
            <p>name: Jack</p>
            <p>age: 22</p>
        </div>
        <div class="item">
            <img src="./imgs/3.jpg" />
            <p>name: Marry</p>
            <p>age: 16</p>
        </div>

## Examples
* 在页面中引入 waterfall.js
        
        <script src='./lib/waterfall.js'>

* waterfall 使用方法

        waterfall({
            container: '#box', // 瀑布流容器
            itemClass: 'item', // 子项className
            cols: 3, // 瀑布流列数
            gutterWidth: 10, // 水平间隔
            gutterHeight: 20, // 竖直间隔
            gutterType: 'space-around', // 水平空白的类型，'space-between'，'space-around'，默认'space-between'
            preloadImage: true, // 是否需要进行图片预加载
            defaultImage: './imgs/default.jpg', // 图片加载失败替换图片
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
            maxPage: 6, // 请求的最大次数
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