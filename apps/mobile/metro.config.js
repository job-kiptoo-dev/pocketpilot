// Metro config for an Expo app inside a pnpm/Turborepo monorepo.
// Lets Metro resolve the shared workspace packages (@pocketpilot/*) and the
// hoisted dependencies at the repo root.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Watch the whole monorepo so changes in packages/* trigger reloads.
config.watchFolders = [workspaceRoot];

// Resolve modules from the app first, then the hoisted root node_modules.
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];

// Required for pnpm's symlinked store and the workspace packages' "exports".
config.resolver.unstable_enableSymlinks = true;
config.resolver.unstable_enablePackageExports = true;

module.exports = config;
