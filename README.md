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










