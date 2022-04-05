const fs = require('fs');

module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/'
    : '/',
  transpileDependencies: [],
  chainWebpack: config => {
    config.module
      .rule('json')
      .test(/\.(json|geojson)$/i)
      .use('json')
      .loader('json-loader')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        options.transformAssetUrls = {
          'vl-style-icon': 'src',
          'VlStyleIcon': 'src',
        }
        return options
      })
  },
  pages: {
    index: {
      // entry for the page
      entry: 'src/main.ts',
      // title of the application
      title: 'OpenHPS Solid Browser',
    },
  },
  devServer: {
    port: 8081,
    host: '0.0.0.0',
    https: {
      key: fs.readFileSync('cert/key.pem'),
      cert: fs.readFileSync('cert/server.crt'),
    },
  }
}
