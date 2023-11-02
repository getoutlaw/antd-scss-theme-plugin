"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = antdLessLoader;
exports.overloadLessLoaderOptions = void 0;

var _lessLoader = _interopRequireDefault(require("less-loader"));

var _ramda = require("ramda");

var _utils = require("./utils");

var _loaderUtils = require("./loaderUtils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Modify less-loader's options with variable overrides extracted from the SCSS theme.
 * @param {Object} options - Options for less-loader.
 * @return {Object} Options modified to include theme variables in the modifyVars property.
 */
const overloadLessLoaderOptions = (options = {}) => {
  const scssThemePath = (0, _loaderUtils.getScssThemePath)(options);
  const themeModifyVars = (0, _utils.loadScssThemeAsLess)(scssThemePath);
  return (0, _ramda.mergeDeepRight)({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: { ...themeModifyVars
      }
    }
  }, options);
};
/**
 * A wrapper around less-loader which overloads loader options and registers the theme file
 * as a watched dependency.
 * @param {...*} args - Arguments passed to less-loader.
 * @return {*} The return value of less-loader, if any.
 */


exports.overloadLessLoaderOptions = overloadLessLoaderOptions;

function antdLessLoader(...args) {
  const options = this.getOptions();
  const newLoaderContext = {};

  try {
    const newOptions = overloadLessLoaderOptions(options);
    delete newOptions.scssThemePath;
    newLoaderContext.query = newOptions;

    newLoaderContext.getOptions = () => newOptions;
  } catch (error) {
    // Remove unhelpful stack from error.
    error.stack = undefined; // eslint-disable-line no-param-reassign

    throw error;
  }

  const scssThemePath = (0, _loaderUtils.getScssThemePath)(options);
  const newContext = (0, _ramda.mergeRight)(this, newLoaderContext);
  newContext.addDependency(scssThemePath);
  return _lessLoader.default.call(newContext, ...args);
}