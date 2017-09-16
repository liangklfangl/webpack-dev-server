var path = require("path");
module.exports = {
  entry: {
    app: [
     'webpack-dev-server/client?http://localhost:8080/',
     "./app/main.js"
    ]
  },

  output: {
    path: path.resolve(__dirname, "build"),
    publicPath: "/assets/",
    filename: "bundle.js",
    contentBase:'./build'
  }//,
  //inline mode在此配置或者在command line中加入--inline
  // devServer:{
  // 	inline:true
  //   }

};
