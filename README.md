### 1.webpack-dev-server配置

#### 1.1 ContentBase

webpack-dev-server会使用当前的路径作为请求的资源路径，但是你可以通过指定content base来修改这个默认行为:

```js
$ webpack-dev-server --content-base build/
```

这样webpack-dev-server就会使用build目录下的文件来处理网络请求。他会监听资源文件，当他们改变的时候会自动编译。这些改变的bundle将会从内存中直接拿出来进而处理网络请求(所谓的改变的bundle指的就是,相对你在publicPath中指定的路径的资源)，而不会被写出到我们的output路径下面。`如果一个已经存在的bundle具有相同的URL，那么我们也会使用内存中的资源来替换`他!比如我们有一个如下的配置:

```js
module.exports = {
  entry: {
    app: ["./app/main.js"]
  },
  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "bundle.js"
  }
}
```

那么我们要访问编译后的资源可以通过localhost:8080/assets/bundle.js来访问。如果我们在build目录下有一个文件，那么我们可以使用下面的方式来访问js资源:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Document</title>
</head>
<body>
  <script src="assets/bundle.js"></script>
</body>
</html>
```

此时你会看到控制台输出如下内容:

![](./contentbase.png)

主要关注下面两句输出:

Webpack result is served from /assets/

Content is served from /users/…./build(因为我们设置了contentBase)

`注意：我们此时通过http://localhost:8080/index.html来访问build下的index.html;同时，我们的会发现在build目录下并没有生成我们的bundle.js文件本身`。也就是说，此时我们的静态文件全部从build目录来获取，我们生成的静态文件bundle.js也在build目录之下，不过要访问它必须要加上publicPath路径才可以！

#### 1.2 自动刷新

##### 1.2.1 iframe mode:

我们的页面被嵌套在一个iframe中，当资源改变的时候会重新加载。只需要在路径中加入webpack-dev-server就可以了,不需要其他的任何处理:
```js
http://localhost:8080/webpack-dev-server/index.html
```

从而在页面中就会产生如下的一个iframe标签并注入css/js/DOM:

![](./iframe.png)

这个iframe页面会请求 live.bundle.js ,其中里面会新建一个 Iframe ，你的应用就被注入到了这个 Iframe 当中。同时 live.bundle.js 中含有 socket.io 的 client 代码，这样它就能和 webpack-dev-server 建立的 http server 进行 websocket 通讯了，并根据返回的信息完成相应的动作。(`总之，因为我们的http://localhost:8080/webpack-dev-server/index.html访问的时候加载了live.bundle.js，其具有websocket的client代码，所以当websocket-dev-server服务端代码发生变化的时候会通知到这个页面，这个页面只是需要重新刷新iframe中的页面就可以了`)

该模式有如下作用:

No configuration change needed.（不需要修改配置文件）

Nice information bar on top of your app.(在app上面有information bar)

URL changes in the app are not reflected in the browser’s URL bar.(在app里面的URL改变不会反应到浏览器的地址栏中)

##### 1.2.2 inline mode

一个小的webpack-dev-server的客户端入口被添加到文件中，用于自动刷新页面。其中在cli中输入的是:

```js
  webpack-dev-server --inline --content-base ./build
```

此时在页面中输出的内容中看不到插入任何的js代码:

![](./inline.png)

但是在控制台中可以清楚的知道页面的重新编译等信息:

![](./reload.png)

该模式有如下作用:

Config option or command line flag needed.(webpack配置或者命令行配置)

Status information in the console and (briefly) in the browser’s console log.(状态信息在浏览器的console.log中)

URL changes in the app are reflected in the browser’s URL bar(URL的改变会反应到浏览器的地址栏中).

每一个模式都是支持Hot Module Replacement的，在HMR模式下，每一个文件都会被通知内容已经改变而不是重新加载整个页面。因此，在HMR执行的时候可以加载更新的模块，从而把他们注册到运行的应用里面。

##### 1.2.3 如何在nodejs中开启inline mode:

在webpack-dev-server配置中没有inline:true去开启inline模式，`因为webpack-dev-server模块无法访问webpack的配置`。因此，用户必须添加webpack-dev-server的客户端入口文件到webpack的配置中，具体方式如下:

方式1：To do this, simply add the following to all entry points: webpack-dev-server/client?http://«path»:«port»/,也就是在entry中添加一个内容:

```js
entry: {
    app: [
     'webpack-dev-server/client?http://localhost:8080/',
     "./app/main.js"
    ]
  }
```

方式2：通过下面的代码来完成:

```js
var config = require("./webpack.config.js");
config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/");
var compiler = webpack(config);
var server = new WebpackDevServer(compiler, {...});
server.listen(8080);
```

或者也可以在HTML中加入下面的文件来完成:

```html
<script src="http://localhost:8080/webpack-dev-server.js"></script>
```

#### 1.3 Hot Module Replacement

为我们的webpack-dev-server开启HMR模式只需要在命令行中添加--hot，他会将HotModuleReplacementPlugin这个插件添加到webpack的配置中去，所以开启HotModuleReplacementPlugin最简单的方式就是使用inline模式。

##### 1.3.1 inline model in ClI

你只需要在命令行中添加--inline  --hot就可以自动实现。这时候webpack-dev-server就会自动添加webpack/hot/dev-server入口文件到你的配置中去，这时候你只是需要访问下面的路径就可以了http://«host»:«port»/«path»。在控制台中你可以看到如下的内容：

![](./replace.png)

其中以[HMR]开头的部分来自于webpack/hot/dev-server模块，而`以[WDS]开头的部分来自于webpack-dev-server的客户端`。下面的部分来自于webpack-dev-server/client/index.js内容，其中的log都是以[WDS]开头的:

```js
function reloadApp() {
  if(hot) {
    log("info", "[WDS] App hot update...");
    window.postMessage("webpackHotUpdate" + currentHash, "*");
  } else {
    log("info", "[WDS] App updated. Reloading...");
    window.location.reload();
  }
}
```

而在我们的webpack/hot/dev-server中的log都是以[HMR]开头的(他是来自于webpack本身的一个plugin):

```js
if(!updatedModules) {
        console.warn("[HMR] Cannot find update. Need to do a full reload!");
        console.warn("[HMR] (Probably because of restarting the webpack-dev-server)");
        window.location.reload();
        return;
      }
```

注意：我们必须指定正确的output.publicPath,否则热更新的chunks不会被加载！

##### 1.3.2 Hot Module Replacement with node.js API

此时需要修改三处配置文件：

第一：添加一个webpack的入口点，也就是webpack/hot/dev-server

第二：添加一个new webpack.HotModuleReplacementPlugin()到webpack的配置中

第三：添加hot:true到webpack-dev-server配置中，从而在服务端启动HMR(可以在cli中使用webpack-dev-server --hot)

```js
if(options.inline) {
  var devClient = [require.resolve("../client/") + "?" + protocol + "://" + (options.public || (options.host + ":" + options.port))];
  //将webpack-dev-server的客户端入口添加到的bundle中，从而达到自动刷新
  if(options.hot)
    devClient.push("webpack/hot/dev-server");
    //这里是webpack-dev-server中对hot配置的处理
  [].concat(wpOpt).forEach(function(wpOpt) {
    if(typeof wpOpt.entry === "object" && !Array.isArray(wpOpt.entry)) {
      Object.keys(wpOpt.entry).forEach(function(key) {
        wpOpt.entry[key] = devClient.concat(wpOpt.entry[key]);
      });
    } else {
      wpOpt.entry = devClient.concat(wpOpt.entry);
    }
  });
}
```

满足上面三个条件的nodejs使用方式如下:

```js
var config = require("./webpack.config.js");
config.entry.app.unshift("webpack-dev-server/client?http://localhost:8080/", "webpack/hot/dev-server");
//条件一(添加了webpack-dev-server的客户端和HMR的服务端)
var compiler = webpack(config);
var server = new webpackDevServer(compiler, {
  hot: true //条件二(--hot配置，webpack-dev-server会自动添加HotModuleReplacementPlugin),条件三
  ...
});
server.listen(8080);
```


### 2.webpack-dev-server启动proxy代理

#### 2.1 代理配置

webpack-dev-server使用[http-proxy-middleware](https://github.com/chimurai/http-proxy-middleware)去把请求代理到一个外部的服务器，配置的样例如下：

```js
proxy: {
  '/api': {
    target: 'https://other-server.example.com',
    secure: false
  }
}
// In webpack.config.js
{
  devServer: {
    proxy: {
      '/api': {
        target: 'https://other-server.example.com',
        secure: false
      }
    }
  }
}
// Multiple entry
proxy: [
  {
    context: ['/api-v1/**', '/api-v2/**'],
    target: 'https://other-server.example.com',
    secure: false
  }
]
```

这种代理在很多情况下是很重要的，比如你可以把一些静态文件通过本地的服务器加载，而一些API请求全部通过一个远程的服务器来完成。还有一个情景就是在两个独立的服务器之间进行请求分割，如一个服务器负责授权而另外一个服务应用本身。

#### 2.2 绕开代理

通过一个函数的返回值可以视情况的绕开一个代理。这个函数可以查看http请求和响应以及一些代理的选项。它必须返回要么是false要么是一个URL的path，这个path将会用于处理请求而不是使用原来代理的方式完成。下面的例子的配置将会忽略来自于浏览器的HTTP请求，他和historyApiFallback配置类似。浏览器请求可以像往常一样接收到HTML文件，但是API请求将会被代理到另外的服务器：

```js
proxy: {
  '/some/path': {
    target: 'https://other-server.example.com',
    secure: false,
    bypass: function(req, res, proxyOptions) {
      if (req.headers.accept.indexOf('html') !== -1) {
        console.log('Skipping proxy for browser request.');
        return '/index.html';
    }
  }
 }
}
```


#### 2.3 代理请求中重写URL

对于代理的请求可以通过提供一个函数来重写，这个函数可以查看或者改变http请求。下面的例子就会重写HTTP请求，其主要作用就是移除URL前面的/api部分。

```js
proxy: {
  '/api': {
    target: 'https://other-server.example.com',
    pathRewrite: {'^/api' : ''}
  }
}
```

其中pathRewrite配置来自于http-proxy-middleware。

#### 2.4 代理本地虚拟主机

http-proxy-middleware会预解析本地hostname成为localhost,你可以使用下面的配置来修改这种默认行为：

```js
var server = new webpackDevServer(compiler, {
  quiet: false,
  stats: { colors: true },
  proxy: {
    "/api": {
      "target": {
        "host": "action-js.dev",
        "protocol": 'http:',
        "port": 80
      },
      ignorePath: true,
      changeOrigin: true,
      secure: false
    }
  }
});
server.listen(8080);
```


### 3.webpack-dev-server CLI

webpack-dev-server命令行的使用如下:
```js
$ webpack-dev-server <entry>
```

所有的webpack cli配置在webpack-dev-server cli中都是存在的有效的，除了output的默认参数。
--content-base <file/directory/url/port>: base path for the content.

--quiet: don’t output anything to the console.

--no-info: suppress boring information.

--colors: add some colors to the output.

--no-colors: don’t use colors in the output.

--compress: use gzip compression.

--host <hostname/ip>: hostname or IP. 0.0.0.0 binds to all hosts.

--port <number>: port.

--inline: embed the webpack-dev-server runtime into the bundle。下面是webpack-dev-server对于--inline的处理(wpOpt中最后会得到所有的入口文件)

```js
var wpOpt = require("webpack/bin/convert-argv")(optimist, argv, {
  outputFilename: "/bundle.js"
});
if(options.inline) {
  var devClient = [require.resolve("../client/") + "?" + protocol + "://" + (options.public || (options.host + ":" + options.port))];
  if(options.hot)
    devClient.push("webpack/hot/dev-server");
    //添加webpack/hot/dev-server入口
  [].concat(wpOpt).forEach(function(wpOpt) {
    if(typeof wpOpt.entry === "object" && !Array.isArray(wpOpt.entry)) {
      Object.keys(wpOpt.entry).forEach(function(key) {
        wpOpt.entry[key] = devClient.concat(wpOpt.entry[key]);
      });
    } else {
      wpOpt.entry = devClient.concat(wpOpt.entry);
    }
  });
}
```


--hot: adds the HotModuleReplacementPlugin and switch the server to hot mode. Note: make sure you don’t add HotModuleReplacementPlugin twice.

--hot --inline also adds the webpack/hot/dev-server entry.

--public: overrides the host and port used in --inline mode for the client (useful for a VM or Docker).

--lazy: no watching, compiles on request (cannot be combined with --hot).

--https: serves webpack-dev-server over HTTPS Protocol. Includes a self-signed certificate that is used when serving the requests.

--cert, --cacert, --key: Paths the certificate files.

--open: opens the url in default browser (for webpack-dev-server versions > 2.0).

--history-api-fallback: enables support for history API fallback.

--client-log-level: controls the console log messages shown in the browser. Use error, warning, info or none.

### 4.Additional configuration options

#### 4.1 webpack-dev-server配置
当使用cli的时候，可以把webpack-dev-server的配置放在一个单独的文件中，其中key是devServer。在cli中传入的参数将会覆盖我们的配置文件的内容。如下例：

```js
module.exports = {
  // ...
  devServer: {
    hot: true
  }
}
```

```js
var WebpackDevServer = require("webpack-dev-server");
var webpack = require("webpack");
var fs = require("fs");

var compiler = webpack({
  // configuration
});
var server = new WebpackDevServer(compiler, {
  // webpack-dev-server options

  contentBase: "/path/to/directory",
  // Can also be an array, or: contentBase: "http://localhost/",

  hot: true,
  // Enable special support for Hot Module Replacement
  // Page is no longer updated, but a "webpackHotUpdate" message is sent to the content
  // Use "webpack/hot/dev-server" as additional module in your entry point
  // Note: this does _not_ add the `HotModuleReplacementPlugin` like the CLI option does. 

  historyApiFallback: false,
  // Set this as true if you want to access dev server from arbitrary url.
  // This is handy if you are using a html5 router.

  compress: true,
  // Set this if you want to enable gzip compression for assets

  proxy: {
    "**": "http://localhost:9090"
  },
  // Set this if you want webpack-dev-server to delegate a single path to an arbitrary server.
  // Use "**" to proxy all paths to the specified server.
  // This is useful if you want to get rid of 'http://localhost:8080/' in script[src],
  // and has many other use cases (see https://github.com/webpack/webpack-dev-server/pull/127 ).

  setup: function(app) {
    // Here you can access the Express app object and add your own custom middleware to it.
    // For example, to define custom handlers for some paths:
    // app.get('/some/path', function(req, res) {
    //   res.json({ custom: 'response' });
    // });
  },

  // pass [static options](http://expressjs.com/en/4x/api.html#express.static) to inner express server
  staticOptions: {
  },

  clientLogLevel: "info",
  // Control the console log messages shown in the browser when using inline mode. Can be `error`, `warning`, `info` or `none`.

  // webpack-dev-middleware options
  quiet: false,
  noInfo: false,
  lazy: true,
  filename: "bundle.js",
  watchOptions: {
    aggregateTimeout: 300,
    poll: 1000
  },
  // It's a required option.
  publicPath: "/assets/",
  headers: { "X-Custom-Header": "yes" },
  stats: { colors: true },

  https: {
    cert: fs.readFileSync("path-to-cert-file.pem"),
    key: fs.readFileSync("path-to-key-file.pem"),
    cacert: fs.readFileSync("path-to-cacert-file.pem")
  }
});
server.listen(8080, "localhost", function() {});
// server.close();
```

其中的配置可以查看[webpack-dev-server](http://webpack.github.io/docs/webpack-dev-middleware.html)。注意：我们的webpack配置没有传入到我们的WebpackDevServer中，因此，webpack中的devServer配置并非用于这个场景。而且，在webpackDevServer中是没有inline模式的，因此如下的js必须手动插入到页面中:

```js
<script src="http://localhost:8080/webpack-dev-server.js"><\/script>
```

#### 4.2 historyApiFallback选项

当你使用HTML5的history API的时候，当404出现的时候你可能希望使用index.html来作为请求的资源，这时候你可以使用这个配置historyApiFallback:true。然而，如果你修改了output.publicPath，你就需要指定重定向的URL，你可以使用historyApiFallback.index选项。

```js
// output.publicPath: '/foo-app/'
historyApiFallback: {
  index: '/foo-app/'
}
```

使用rewrite选项你可以重新设置静态资源

```js
historyApiFallback: {
    rewrites: [
        // shows views/landing.html as the landing page
        { from: /^\/$/, to: '/views/landing.html' },
        // shows views/subpage.html for all routes starting with /subpage
        { from: /^\/subpage/, to: '/views/subpage.html' },
        // shows views/404.html on all other pages
        { from: /./, to: '/views/404.html' },
    ],
},
```

使用disableDotRule来满足一个需求，即如果一个资源请求包含一个`.`符号,那么表示是对某一个特定资源的请求，也就满足dotRule。我们看看[connect-history-api-fallback](https://github.com/liangklfang/connect-history-api-fallback)内部是如何处理的：

```js
 if (parsedUrl.pathname.indexOf('.') !== -1 &&
        options.disableDotRule !== true) {
      logger(
        'Not rewriting',
        req.method,
        req.url,
        'because the path includes a dot (.) character.'
      );
      return next();
    }
    rewriteTarget = options.index || '/index.html';
    logger('Rewriting', req.method, req.url, 'to', rewriteTarget);
    req.url = rewriteTarget;
    next();
  };
```

也就是说，如果是对绝对资源的请求，也就是满足dotRule,但是disableDotRule(disable dot rule file request)为false,表示我们会自己对满足dotRule的资源进行处理，所以不用定向到index.html中!如果disableDotRule为true表示我们不会对满足dotRule的资源进行处理，所以直接定向到index.html!


```js
history({
  disableDotRule: true
})
```



### 5.组合一个已经存在的服务器

你可能想要在生产环境中运行一个后置服务器，而我们的webpack-dev-server是不应该作为一个后置服务器的，他的主要工作就是处理静态文件的请求。

你可以运行两个服务器：webpack-dev-server和后置服务器

这时候，`一方面`：你需要让webpack产生的资源去请求我们的webpack-dev-server，即使是后置服务器中的HTML请求。`另一方面`：你需要让你的后置服务器产生HTML页面，而这个页面包括script标签，其指向我们的webpack-dev-server中的资源；除了这两点，你需要把webpack-dev-server和webpack-dev-server runtime连接起来以便当重新编译后可以触发加载。

让webpack请求我们的webpack-dev-server，你需要在output.publicPath选项中提供一个完整的URL；为了让webpack-dev-server和他的runtime链接起来，我们可以开启--inline模式。webpack-dev-server cli会自动添加一个入口点，其可以建立Websocket连接(你也可以使用iframe模式，如果你为webpack-dev-server指定了--content-base，这个contentBase指向后置服务器。如果你需要为你的后置服务器添加一个websocket连接，那么你就需要使用iframe模式)。

当你使用的是inline模式的时候，你只需要在web浏览器中打开你的后置服务器的URL即可(iframe模式的时候，你需要为URL添加/webpack-dev-server/前缀)。下面是一个例子:

webpack-dev-server on port 8080.

backend server on port 9090.

generate HTML pages with <script src="http://localhost:8080/assets/bundle.js">.

webpack configuration with output.publicPath = "http://localhost:8080/assets/".

when compiling files for production, use --output-public-path /assets/.

inline mode:

--inline.

open http://localhost:9090.

or iframe mode:

webpack-dev-server contentBase = "http://localhost:9090/" (--content-base).

open http://localhost:8080/webpack-dev-server/.



参考文献:

[详情介绍webpack-dev-server，iframe与inline的区别](http://blog.csdn.net/chengnuo628/article/details/52441977)

[详解webpack-dev-server的使用](https://segmentfault.com/a/1190000006964335)

[[译] Webpack 用来做模块热替换(hot module replacement)](https://segmentfault.com/a/1190000003872635)

[React Actions Recorder 的模块热替换(HMR)](https://segmentfault.com/a/1190000003879041)  

[Webpack——解决疑惑,让你明白](http://www.imooc.com/article/13357)  


