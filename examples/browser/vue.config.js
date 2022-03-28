module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/demo/'
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
      entry: 'src/main.js',
      // title of the application
      title: 'OpenHPS Solid Browser',
    },
  }
}
