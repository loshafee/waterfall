# waterfall
Javascript waterfall effection with images preloader

## Installation && Usage
Browser

In a browser, you can use `fetch-waterfall` as follows:

    <script src='./lib/waterfall.js' charset='utf8'><script>
it also can be a AMD module while using require.js

NodeJS

Install for Node.js using npm

    $ npm install fetch-waterfall

Require module use `require`
    
    const waterfall = require('fetch-waterfall)


## API
waterfall(config)
* `config` (`Object`) configure object
### configure property details
| Name       | Type         | Default-value     | Description
|:-:     | :-:   | :-:     | :-:
| `container`  | String \| HTMLElement| `''` | container element
| `itemClass`  | String   | `'item'`    | item's className
| `cols`  | Number    | `1` |  Waterfall effections columns
| `gutterWidth` | String \| Number  | `10`  | the gaps of horizonta with pixel or percentage unit refering to `container` width
| `gutterHeight` | String \| Number | `10` | the gaps of verticle with pixel or percentage unit refering to `container` width
| `gutterType` | String | `space-between`   | gaps types，`space-around`，`space-between`
| `preloadImage` | Boolean | `false` | if need images preload(default to false)
| `defaultImage` | String | `undefined`    | the replace image url when target image loads failly(it effects when `preloadImage` is `true`)
| `preloadPercent` | Function | `function (state) {}` | images preload function，payload `state`
| `preloadComplete` | Function | `function (promise) {}` | images loaded calllback function, argument `promise` is a Promise Object
| `path` | Function \| String | `undefined` | `request` request url, when it is a function which return a string. it only supports the method `GET` request, it uses [`fetch API`](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API) to request
| `maxPage` | String | `undefined` | `request` the max number of request
| `template` | String \| HTMLElement | `'no referering templates'` | the Waterfall items rendering template, as follows [template](#template)
| `callbacks` | Object | `{ loadingStart: fn, loadingFinished: fn, loadingError: fn }` | `request` request callback function, see as follows

`config.callbacks` details

        callbacks: {
            /**
             *  the begining function of fetch request 
             */
            loadingStart: function () {},

            /**
             *  the end function of fetch request
             * @param {Object} res - return response
             */
            loadingFinished: function (res) {
                console.log(res)
            },

            /**
             *  fetch request error function
             * @param {Object} error - request error message
             */
            loadingError: function (error) {
                console.log(error)
            }
        }

## Template
`fetch-waterfall` it supports a simple template rendering engine, in order to display the items in the waterfall
it uses `{{}}` to contain variable, `{{#}}` contain the iterable array

template use DOM elements or string straightly.

        <script type="text/template" id="waterfall-tpl">
            {{#results}}
                <div class="item">
                    <img src="{{url}}" />
                    <p>name: {{name}}</p>
                    <p>age: {{age}}</p>
                </div>
            {{/results}}
        </script>

a json data model

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

after rendering result, as follows:

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
* html structure

        <div id="box"></div>
        <script src='./lib/waterfall.js'>

* script

        waterfall({
            container: '#box', // container
            itemClass: 'item', // item's className
            cols: 3, // columns
            gutterWidth: 10, // horizonal gutter
            gutterHeight: 20, // vertical gutter
            gutterType: 'space-around', // gutter type
            preloadImage: true, // preload images
            defaultImage: './imgs/default.jpg', // target image load error which to replace it
            preloadPercent: function (state) { // images preloading
                console.log('images has loaded ' + state.current/state.total)
                console.log(state)
            },
            preloadComplete: function (promise) { // images loaded
                promise.then(function (state) {
                    console.log(state)
                    document.getElementById('mask').style.display = 'none'
                })
            },
            path: function (curPage) { // fetch request url
                return './users.json?page=' + curPage
            },
            maxPage: 6, // request max count
            template: document.getElementById('waterfall-tpl'), // tempalte
            callbacks: {
                loadingStart: function () {
                    console.log('ajax request ...')
                    document.getElementById('mask').style.display = 'block'
                },
                loadingFinished: function (res) {
                    console.log('ajax response', res)               
                },
                loadingError: function (error) {
                    console.log(error)
                }
            }
        })


[waterfall Demo](https://loshafee.github.io/waterfall/demos/waterfall.html)

## License
MIT