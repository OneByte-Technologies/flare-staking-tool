module.exports = {
    module: {
      rules: [
        {
          test: /\.(png|jpe?g|gif|js)$/i,
          use: [
            {
              loader: 'file-loader',
            },
          ],
        },
      ],
    },
  };ß