// debug-metro.js
const path = require('path');
const fs = require('fs');

try {
  console.log('Checking NativeWind babel plugin path...');
  const babelPluginPath = require.resolve('nativewind/babel');
  console.log('Babel plugin path exists:', babelPluginPath);
  
  console.log('\nChecking if babel plugin file exists...');
  const exists = fs.existsSync(babelPluginPath);
  console.log('Babel plugin file exists:', exists);
  
  console.log('\nChecking metro configuration...');
  const metroConfig = require('./metro.config');
  console.log('Metro config:', JSON.stringify(metroConfig, null, 2));
  
} catch (error) {
  console.error('Error during debug:', error);
}