module.exports = {
  dependencies: {
    'react-native-plugpag-nitro': {
      platforms: {
        android: {
          packageImportPath:
            'com.margelo.nitro.plugpagnitro.PlugpagNitroPackage',
          packageInstance: 'new PlugpagNitroPackage()',
        },
      },
    },
  },
};
