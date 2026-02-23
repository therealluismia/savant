module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src',
            '@/app': './src/app',
            '@/components': './src/components',
            '@/navigation': './src/navigation',
            '@/screens': './src/screens',
            '@/features': './src/features',
            '@/store': './src/store',
            '@/services': './src/services',
            '@/api': './src/api',
            '@/hooks': './src/hooks',
            '@/types': './src/types',
            '@/theme': './src/theme',
            '@/constants': './src/constants',
            '@/utils': './src/utils',
            '@/providers': './src/providers',
            '@/config': './src/config',
            '@/core': './src/core',
            '@/core/auth': './src/core/auth',
            '@/core/events': './src/core/events',
          },
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.ts', '.tsx', '.json'],
        },
      ],
      'react-native-reanimated/plugin',
    ],
  };
};
