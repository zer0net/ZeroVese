module.exports = {
  entry: './app/index.js',
  output: {
    path: `${__dirname}/`,
    filename: 'all.js'
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react'
            ]
          }
        },
        exclude: /node_modules/
      }
    ]
  }
};
