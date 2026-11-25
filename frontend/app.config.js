export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    'expo-sharing',
  ],
});
