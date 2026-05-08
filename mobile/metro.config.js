// https://docs.expo.dev/guides/customizing-metro/
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '..');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(projectRoot);

// Watch monorepo root so Metro can resolve hoisted packages (e.g. react-native)
config.watchFolders = [monorepoRoot];

// mobile/node_modules first so local packages take priority over hoisted ones
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// react-native-svg exists in BOTH mobile and root node_modules.
// Block the root copy so only the mobile copy is bundled — prevents the
// "Tried to register two views with the same name RNSVGCircle" crash.
const rootSvg = path.join(monorepoRoot, 'node_modules', 'react-native-svg');
config.resolver.blockList = [
  new RegExp(`^${rootSvg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/.*$`),
];

module.exports = config;
