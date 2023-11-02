"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.loadScssThemeAsLess = exports.extractLessVariables = exports.compileThemeVariables = void 0;

var _fs = _interopRequireDefault(require("fs"));

var _less = _interopRequireDefault(require("less"));

var _scssJson = _interopRequireDefault(require("scss-json"));

var _extractVariablesLessPlugin = _interopRequireDefault(require("./extractVariablesLessPlugin"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Return values of compiled Less variables from a compilable entry point.
 * @param {string} lessEntryPath - Root Less file from which to extract variables.
 * @param {Object} variableOverrides - Variable overrides of the form { '@var': 'value' } to use
 *   during compilation.
 * @return {Object} Object of the form { 'variable': 'value' }.
 */
const extractLessVariables = (lessEntryPath, variableOverrides = {}) => {
  const lessEntry = _fs.default.readFileSync(lessEntryPath, 'utf8');

  return new Promise(async (resolve, reject) => {
    try {
      await _less.default.render(lessEntry, {
        filename: lessEntryPath,
        javascriptEnabled: true,
        modifyVars: variableOverrides,
        plugins: [new _extractVariablesLessPlugin.default({
          callback: variables => resolve(variables)
        })]
      });
    } catch (error) {
      reject(error);
    }
  });
};
/**
 * Read variables from a SCSS theme file into an object with Less-style variable names as keys.
 * @param {string} themeScssPath - Path to SCSS file containing only SCSS variables.
 * @return {Object} Object of the form { '@variable': 'value' }.
 */


exports.extractLessVariables = extractLessVariables;

const loadScssThemeAsLess = themeScssPath => {
  let rawTheme;

  try {
    rawTheme = (0, _scssJson.default)(themeScssPath);
  } catch (error) {
    throw new Error(`Could not compile the SCSS theme file "${themeScssPath}" for the purpose of variable ` + 'extraction. This is likely because it contains a Sass error.');
  }

  const theme = {};
  Object.keys(rawTheme).forEach(sassVariableName => {
    const lessVariableName = sassVariableName.replace(/^\$/, '@');
    theme[lessVariableName] = rawTheme[sassVariableName];
  });
  return theme;
};
/**
 * Use SCSS theme file to seed a full set of Ant Design's theme variables returned in SCSS.
 * @param {string} themeScssPath - Path to SCSS file containing SCSS variables meaningful to Ant
 *   Design.
 * @return {string} A string representing an SCSS file containing all the theme and color
 *   variables used in Ant Design.
 */


exports.loadScssThemeAsLess = loadScssThemeAsLess;

const compileThemeVariables = themeScssPath => {
  const themeEntryPath = require.resolve('antd/lib/style/themes/default.less');

  const variableOverrides = themeScssPath ? loadScssThemeAsLess(themeScssPath) : {};
  return extractLessVariables(themeEntryPath, variableOverrides).then(variables => Object.entries(variables).map(([name, value]) => `$${name}: ${value};\n`).join(''));
};

exports.compileThemeVariables = compileThemeVariables;