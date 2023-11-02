"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = antdSassLoader;
exports.themeImporter = exports.overloadSassLoaderOptions = void 0;

var _path = _interopRequireDefault(require("path"));

var _ramda = require("ramda");

var _loaderUtils = require("loader-utils");

var _sassLoader = _interopRequireDefault(require("sass-loader"));

var _loaderUtils2 = require("./loaderUtils");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fs = require('fs');

/**
 * Utility returning a node-sass importer that provides access to all of antd's theme variables.
 * @param {string} themeScssPath - Path to SCSS file containing Ant Design theme variables.
 * @param {string} contents - The compiled content of the SCSS file at themeScssPath.
 * @returns {function} Importer that provides access to all compiled Ant Design theme variables
 *   when importing the theme file at themeScssPath.
 */
const themeImporter = (themeScssPath, contents) => (url, previousResolve, done) => {
  const request = (0, _loaderUtils.urlToRequest)(url);
  let pathsToFile;

  const baseDirectory = _path.default.dirname(previousResolve);

  if (/\.(scss|sass)$/g.test(url)) {
    pathsToFile = request;
  } else {
    if (fs.existsSync(_path.default.resolve(baseDirectory, `${request}.scss`))) {
      pathsToFile = request;
    } else if (fs.existsSync(_path.default.resolve(baseDirectory, `${request}.sass`))) {
      pathsToFile = request;
    }
  }

  if (pathsToFile && _path.default.resolve(baseDirectory, pathsToFile) === themeScssPath) {
    done({
      contents
    });
    return;
  }

  done();
};
/**
 * Modify sass-loader's options so that all antd variables are imported from the SCSS theme file.
 * @param {Object} options - Options for sass-loader.
 * @return {Object} Options modified to include a custom importer that handles the SCSS theme file.
 */


exports.themeImporter = themeImporter;

const overloadSassLoaderOptions = async options => {
  const newOptions = { ...options
  };
  const scssThemePath = (0, _loaderUtils2.getScssThemePath)(options);
  const contents = await (0, _utils.compileThemeVariables)(scssThemePath);
  const extraImporter = themeImporter(scssThemePath, contents);
  const sassOptions = (0, _ramda.propOr)({}, 'sassOptions', options);
  let importer;

  if ('importer' in sassOptions) {
    if (Array.isArray(sassOptions.importer)) {
      importer = [...sassOptions.importer, extraImporter];
    } else {
      importer = [sassOptions.importer, extraImporter];
    }
  } else {
    importer = extraImporter;
  }

  newOptions.sassOptions = {};
  newOptions.sassOptions.importer = importer;
  return newOptions;
};
/**
 * A wrapper around sass-loader which overloads loader options to include a custom importer handling
 * variable imports from the SCSS theme file, and registers the theme file as a watched dependency.
 * @param {...*} args - Arguments passed to sass-loader.
 * @return {undefined}
 */


exports.overloadSassLoaderOptions = overloadSassLoaderOptions;

function antdSassLoader(...args) {
  const loaderContext = this;
  const callback = loaderContext.async();
  const options = this.getOptions();
  const scssThemePath = (0, _loaderUtils2.getScssThemePath)(options);
  this.addDependency(scssThemePath);
  overloadSassLoaderOptions(options).then(newOptions => {
    const newLoaderContext = {};
    delete newOptions.scssThemePath; // eslint-disable-line no-param-reassign

    newLoaderContext.query = newOptions;

    newLoaderContext.getOptions = () => newOptions;

    const newContext = (0, _ramda.mergeRight)(this, newLoaderContext);
    newContext.addDependency(scssThemePath);
    return _sassLoader.default.call(newContext, ...args);
  }).catch(error => {
    // Remove unhelpful stack from error.
    error.stack = undefined; // eslint-disable-line no-param-reassign

    callback(error);
  });
}