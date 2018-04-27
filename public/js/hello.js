webpackJsonp([5],[
/* 0 */
/***/ (function(module, exports) {

/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file.
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

module.exports = function normalizeComponent (
  rawScriptExports,
  compiledTemplate,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */
) {
  var esModule
  var scriptExports = rawScriptExports = rawScriptExports || {}

  // ES6 modules interop
  var type = typeof rawScriptExports.default
  if (type === 'object' || type === 'function') {
    esModule = rawScriptExports
    scriptExports = rawScriptExports.default
  }

  // Vue.extend constructor export interop
  var options = typeof scriptExports === 'function'
    ? scriptExports.options
    : scriptExports

  // render functions
  if (compiledTemplate) {
    options.render = compiledTemplate.render
    options.staticRenderFns = compiledTemplate.staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = scopeId
  }

  var hook
  if (moduleIdentifier) { // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = injectStyles
  }

  if (hook) {
    var functional = options.functional
    var existing = functional
      ? options.render
      : options.beforeCreate

    if (!functional) {
      // inject component registration as beforeCreate hook
      options.beforeCreate = existing
        ? [].concat(existing, hook)
        : [hook]
    } else {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functioal component in vue file
      options.render = function renderWithStyleInjection (h, context) {
        hook.call(context)
        return existing(h, context)
      }
    }
  }

  return {
    esModule: esModule,
    exports: scriptExports,
    options: options
  }
}


/***/ }),
/* 1 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/

var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

var listToStyles = __webpack_require__(9)

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

module.exports = function (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),
/* 3 */,
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(5)
/* template */
var __vue_template__ = __webpack_require__(12)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = null
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/layouts/SideBar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4badc1cf", Component.options)
  } else {
    hotAPI.reload("data-v-4badc1cf", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 5 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_bulma_expanding_src_Expanding__ = __webpack_require__(6);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_vue_bulma_expanding_src_Expanding___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_vue_bulma_expanding_src_Expanding__);
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// import { mapGetters, mapActions } from 'vuex'


/* harmony default export */ __webpack_exports__["default"] = ({
  data: function data() {
    return {
      sideBarMenus: [{
        "icon": "fas fa-database fa-lg",
        "path": "/dashboard",
        "title": "總覽"
      }, {
        "icon": "fas fa-address-book fa-lg",
        "path": "/member",
        "title": "人員管理"
      }, {
        "icon": "fas fa-building fa-lg",
        "title": "組織管理",
        "expanded": false,
        "children": [{
          "path": "/company/basic",
          "title": "組織基本資料"
        }, {
          "path": "/company/department",
          "title": "部門管理"
        }, {
          "path": "/company/plan",
          "title": "方案管理"
        }, {
          "path": "/company/files",
          "title": "檔案管理"
        }]
      }, {
        "icon": "fas fa-user fa-lg",
        "title": "個人層級",
        "expanded": false,
        "children": [{
          "path": "/person/basic",
          "title": "基本資料"
        }, {
          "path": "/person/sis",
          "title": "支持強度強表(SIS)"
        }, {
          "path": "/person/mysupport_plan",
          "title": "我的支持計畫"
        }, {
          "path": "/person/support_plan",
          "title": "個別化支持計畫"
        }, {
          "path": "/person/metting_record",
          "title": "ISP會議記錄"
        }, {
          "path": "/person/pos",
          "title": "個人成果量表(POS)"
        }, {
          "path": "/person/community_skill",
          "title": "社區生活技能評量表"
        }, {
          "path": "/person/statistic",
          "title": "統計分析"
        }]
      }, {
        "icon": "fas fa-users fa-lg",
        "title": "團隊層級",
        "expanded": false,
        "children": [{
          "path": "/team/basic",
          "title": "團隊管理"
        }, {
          "path": "/team/person_team",
          "title": "個人與團隊特質量表"
        }, {
          "path": "/team/develop_plan",
          "title": "發展計畫"
        }, {
          "path": "/team/cfi_statistic",
          "title": "CFI統計"
        }]
      }, {
        "icon": "fas fa-sitemap fa-lg",
        "title": "組織層級",
        "expanded": false,
        "children": [{
          "path": "/organization/oees",
          "title": "組織效益效率量表(OEES)"
        }, {
          "path": "/organization/develop_plan",
          "title": "發展及改善計畫"
        }, {
          "path": "/organization/statistic",
          "title": "統計分析"
        }]
      }, {
        "icon": "fas fa-briefcase",
        "title": "工作管理",
        "expanded": false,
        "children": [{
          "path": "/person/management",
          "title": "個人層級"
        }, {
          "path": "/team/management",
          "title": "團隊層級"
        }, {
          "path": "/organization/management",
          "title": "組織層級"
        }]
      }]
    };
  },

  components: {
    Expanding: __WEBPACK_IMPORTED_MODULE_0_vue_bulma_expanding_src_Expanding___default.a
  },
  methods: {
    toggleMenuItem: function toggleMenuItem(item) {
      if (item.children) {
        item.expanded = !item.expanded;
      }
    }
  }
});

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(7)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(10)
/* template */
var __vue_template__ = __webpack_require__(11)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = "data-v-4409f938"
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "node_modules/vue-bulma-expanding/src/Expanding.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-4409f938", Component.options)
  } else {
    hotAPI.reload("data-v-4409f938", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(8);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("314e653d", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../css-loader/index.js!../../vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4409f938\",\"scoped\":true,\"hasInlineConfig\":true}!../../sass-loader/lib/loader.js!../../vue-loader/lib/selector.js?type=styles&index=0!./Expanding.vue", function() {
     var newContent = require("!!../../css-loader/index.js!../../vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-4409f938\",\"scoped\":true,\"hasInlineConfig\":true}!../../sass-loader/lib/loader.js!../../vue-loader/lib/selector.js?type=styles&index=0!./Expanding.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.collapse[data-v-4409f938] {\n  display: none;\n}\n.collapse.in[data-v-4409f938] {\n    display: block;\n}\n.collapsing[data-v-4409f938] {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition: height .377s ease;\n  transition: height .377s ease;\n}\n", ""]);

// exports


/***/ }),
/* 9 */
/***/ (function(module, exports) {

/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
module.exports = function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}


/***/ }),
/* 10 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
  methods: {
    beforeEnter: function beforeEnter(el) {
      el.classList.remove('collapse');
      el.style.display = 'block';
      el.classList.add('collapsing');
      el.style.height = el.scrollHeight + 'px';
    },
    afterEnter: function afterEnter(el) {
      el.classList.remove('collapsing');
      el.classList.add('collapse', 'in');
    },
    beforeLeave: function beforeLeave(el) {
      el.classList.add('collapsing');
      el.classList.remove('collapse', 'in');
      el.style.height = 0;
    },
    afterLeave: function afterLeave(el) {
      el.classList.remove('collapsing');
      el.classList.add('collapse');
      el.style.display = 'none';
    }
  }

});

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c(
    "transition",
    {
      on: {
        beforeEnter: _vm.beforeEnter,
        afterEnter: _vm.afterEnter,
        beforeLeave: _vm.beforeLeave,
        afterLeave: _vm.afterLeave
      }
    },
    [_vm._t("default")],
    2
  )
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4409f938", module.exports)
  }
}

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("aside", { staticClass: "sidebar" }, [
    _c("div", { staticClass: "scrollbar-content" }, [
      _c(
        "ul",
        { staticClass: "sidebar-menu" },
        _vm._l(_vm.sideBarMenus, function(item) {
          return _c(
            "li",
            { key: item.name },
            [
              item.path
                ? _c(
                    "a",
                    { staticClass: "sidebar-link", attrs: { href: item.path } },
                    [
                      _c("i", {
                        staticClass: "sidebar-menu-item-icon",
                        class: item.icon
                      }),
                      _vm._v("\n          " + _vm._s(item.title) + "\n        ")
                    ]
                  )
                : _c(
                    "a",
                    {
                      staticClass: "sidebar-link",
                      attrs: { href: "#" },
                      on: {
                        click: function($event) {
                          $event.preventDefault()
                          _vm.toggleMenuItem(item)
                        }
                      }
                    },
                    [
                      _c("i", {
                        staticClass: "sidebar-menu-item-icon",
                        class: item.icon
                      }),
                      _vm._v(
                        "\n          " + _vm._s(item.title) + "\n          "
                      ),
                      _c("i", { staticClass: "expand-icon fa fa-angle-down" })
                    ]
                  ),
              _vm._v(" "),
              _c("expanding", [
                _c(
                  "ul",
                  {
                    directives: [
                      {
                        name: "show",
                        rawName: "v-show",
                        value: item.expanded,
                        expression: "item.expanded"
                      }
                    ],
                    staticClass: "sidebar-submenu in"
                  },
                  _vm._l(item.children, function(childItem) {
                    return _c("li", { key: childItem.name }, [
                      _c(
                        "a",
                        {
                          staticClass: "sidebar-link sidebar-submenu-link",
                          attrs: { href: childItem.path }
                        },
                        [
                          childItem.icon
                            ? _c("i", {
                                staticClass: "sidebar-menu-item-icon",
                                class: childItem.icon
                              })
                            : _vm._e(),
                          _vm._v(
                            "\n                " +
                              _vm._s(childItem.title) +
                              "\n              "
                          )
                        ]
                      )
                    ])
                  })
                )
              ])
            ],
            1
          )
        })
      )
    ])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-4badc1cf", module.exports)
  }
}

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(14)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(16)
/* template */
var __vue_template__ = __webpack_require__(17)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/layouts/NavBar.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-1cbfb92d", Component.options)
  } else {
    hotAPI.reload("data-v-1cbfb92d", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(15);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("8c53491a", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1cbfb92d\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./NavBar.vue", function() {
     var newContent = require("!!../../../../../node_modules/css-loader/index.js!../../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-1cbfb92d\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../../node_modules/sass-loader/lib/loader.js!../../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./NavBar.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports
exports.push([module.i, "@import url(https://fonts.googleapis.com/css?family=Raleway:300,400,600);", ""]);

// module
exports.push([module.i, "\n/*!\n * Bootstrap v4.0.0 (https://getbootstrap.com)\n * Copyright 2011-2018 The Bootstrap Authors\n * Copyright 2011-2018 Twitter, Inc.\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)\n */\n:root {\n  --blue: #007bff;\n  --indigo: #6610f2;\n  --purple: #6f42c1;\n  --pink: #e83e8c;\n  --red: #dc3545;\n  --orange: #fd7e14;\n  --yellow: #ffc107;\n  --green: #28a745;\n  --teal: #20c997;\n  --cyan: #17a2b8;\n  --white: #fff;\n  --gray: #6c757d;\n  --gray-dark: #343a40;\n  --primary: #f7c980;\n  --secondary: #fff;\n  --success: #c8f9c5;\n  --info: #4ab2e3;\n  --warning: #f7c980;\n  --danger: #e34a4a;\n  --light: #eff4f5;\n  --dark: #161616;\n  --pale: #d9d9d9;\n  --breakpoint-xs: 0;\n  --breakpoint-sm: 576px;\n  --breakpoint-md: 768px;\n  --breakpoint-lg: 992px;\n  --breakpoint-xl: 1200px;\n  --font-family-sans-serif: \"Source Sans Pro\", sans-serif;\n  --font-family-monospace: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\n*,\n*::before,\n*::after {\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n}\nhtml {\n  font-family: sans-serif;\n  line-height: 1.15;\n  -webkit-text-size-adjust: 100%;\n  -ms-text-size-adjust: 100%;\n  -ms-overflow-style: scrollbar;\n  -webkit-tap-highlight-color: transparent;\n}\n@-ms-viewport {\n  width: device-width;\n}\narticle, aside, dialog, figcaption, figure, footer, header, hgroup, main, nav, section {\n  display: block;\n}\nbody {\n  margin: 0;\n  font-family: \"Source Sans Pro\", sans-serif;\n  font-size: 1rem;\n  font-weight: 300;\n  line-height: 1.5;\n  color: #34495e;\n  text-align: left;\n  background-color: #eee;\n}\n[tabindex=\"-1\"]:focus {\n  outline: 0 !important;\n}\nhr {\n  -webkit-box-sizing: content-box;\n          box-sizing: content-box;\n  height: 0;\n  overflow: visible;\n}\nh1, h2, h3, h4, h5, h6 {\n  margin-top: 0;\n  margin-bottom: 0.5rem;\n}\np {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\nabbr[title],\nabbr[data-original-title] {\n  text-decoration: underline;\n  -webkit-text-decoration: underline dotted;\n          text-decoration: underline dotted;\n  cursor: help;\n  border-bottom: 0;\n}\naddress {\n  margin-bottom: 1rem;\n  font-style: normal;\n  line-height: inherit;\n}\nol,\nul,\ndl {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\nol ol,\nul ul,\nol ul,\nul ol {\n  margin-bottom: 0;\n}\ndt {\n  font-weight: 700;\n}\ndd {\n  margin-bottom: .5rem;\n  margin-left: 0;\n}\nblockquote {\n  margin: 0 0 1rem;\n}\ndfn {\n  font-style: italic;\n}\nb,\nstrong {\n  font-weight: bolder;\n}\nsmall {\n  font-size: 80%;\n}\nsub,\nsup {\n  position: relative;\n  font-size: 75%;\n  line-height: 0;\n  vertical-align: baseline;\n}\nsub {\n  bottom: -.25em;\n}\nsup {\n  top: -.5em;\n}\na {\n  color: #f7c980;\n  text-decoration: none;\n  background-color: transparent;\n  -webkit-text-decoration-skip: objects;\n}\na:hover {\n    color: #faddb0;\n    text-decoration: none;\n}\na:not([href]):not([tabindex]) {\n  color: inherit;\n  text-decoration: none;\n}\na:not([href]):not([tabindex]):hover, a:not([href]):not([tabindex]):focus {\n    color: inherit;\n    text-decoration: none;\n}\na:not([href]):not([tabindex]):focus {\n    outline: 0;\n}\npre,\ncode,\nkbd,\nsamp {\n  font-family: monospace, monospace;\n  font-size: 1em;\n}\npre {\n  margin-top: 0;\n  margin-bottom: 1rem;\n  overflow: auto;\n  -ms-overflow-style: scrollbar;\n}\nfigure {\n  margin: 0 0 1rem;\n}\nimg {\n  vertical-align: middle;\n  border-style: none;\n}\nsvg:not(:root) {\n  overflow: hidden;\n}\ntable {\n  border-collapse: collapse;\n}\ncaption {\n  padding-top: 0.75rem;\n  padding-bottom: 0.75rem;\n  color: #6c757d;\n  text-align: left;\n  caption-side: bottom;\n}\nth {\n  text-align: inherit;\n}\nlabel {\n  display: inline-block;\n  margin-bottom: .5rem;\n}\nbutton {\n  border-radius: 0;\n}\nbutton:focus {\n  outline: 1px dotted;\n  outline: 5px auto -webkit-focus-ring-color;\n}\ninput,\nbutton,\nselect,\noptgroup,\ntextarea {\n  margin: 0;\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\nbutton,\ninput {\n  overflow: visible;\n}\nbutton,\nselect {\n  text-transform: none;\n}\nbutton,\nhtml [type=\"button\"],\n[type=\"reset\"],\n[type=\"submit\"] {\n  -webkit-appearance: button;\n}\nbutton::-moz-focus-inner,\n[type=\"button\"]::-moz-focus-inner,\n[type=\"reset\"]::-moz-focus-inner,\n[type=\"submit\"]::-moz-focus-inner {\n  padding: 0;\n  border-style: none;\n}\ninput[type=\"radio\"],\ninput[type=\"checkbox\"] {\n  -webkit-box-sizing: border-box;\n          box-sizing: border-box;\n  padding: 0;\n}\ninput[type=\"date\"],\ninput[type=\"time\"],\ninput[type=\"datetime-local\"],\ninput[type=\"month\"] {\n  -webkit-appearance: listbox;\n}\ntextarea {\n  overflow: auto;\n  resize: vertical;\n}\nfieldset {\n  min-width: 0;\n  padding: 0;\n  margin: 0;\n  border: 0;\n}\nlegend {\n  display: block;\n  width: 100%;\n  max-width: 100%;\n  padding: 0;\n  margin-bottom: .5rem;\n  font-size: 1.5rem;\n  line-height: inherit;\n  color: inherit;\n  white-space: normal;\n}\nprogress {\n  vertical-align: baseline;\n}\n[type=\"number\"]::-webkit-inner-spin-button,\n[type=\"number\"]::-webkit-outer-spin-button {\n  height: auto;\n}\n[type=\"search\"] {\n  outline-offset: -2px;\n  -webkit-appearance: none;\n}\n[type=\"search\"]::-webkit-search-cancel-button,\n[type=\"search\"]::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n::-webkit-file-upload-button {\n  font: inherit;\n  -webkit-appearance: button;\n}\noutput {\n  display: inline-block;\n}\nsummary {\n  display: list-item;\n  cursor: pointer;\n}\ntemplate {\n  display: none;\n}\n[hidden] {\n  display: none !important;\n}\nh1, h2, h3, h4, h5, h6,\n.h1, .h2, .h3, .h4, .h5, .h6 {\n  margin-bottom: 0.5rem;\n  font-family: inherit;\n  font-weight: 500;\n  line-height: 1;\n  color: inherit;\n}\nh1, .h1 {\n  font-size: 2.5rem;\n}\nh2, .h2 {\n  font-size: 2rem;\n}\nh3, .h3 {\n  font-size: 1.75rem;\n}\nh4, .h4 {\n  font-size: 1.5rem;\n}\nh5, .h5 {\n  font-size: 1.25rem;\n}\nh6, .h6 {\n  font-size: 1rem;\n}\n.lead {\n  font-size: 1.25rem;\n  font-weight: 300;\n}\n.display-1 {\n  font-size: 6rem;\n  font-weight: 300;\n  line-height: 1;\n}\n.display-2 {\n  font-size: 5.5rem;\n  font-weight: 300;\n  line-height: 1;\n}\n.display-3 {\n  font-size: 4.5rem;\n  font-weight: 300;\n  line-height: 1;\n}\n.display-4 {\n  font-size: 3.5rem;\n  font-weight: 300;\n  line-height: 1;\n}\nhr {\n  margin-top: 1rem;\n  margin-bottom: 1rem;\n  border: 0;\n  border-top: 1px solid rgba(0, 0, 0, 0.1);\n}\nsmall,\n.small {\n  font-size: 80%;\n  font-weight: 400;\n}\nmark,\n.mark {\n  padding: 0.2em;\n  background-color: #fcf8e3;\n}\n.list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline-item {\n  display: inline-block;\n}\n.list-inline-item:not(:last-child) {\n    margin-right: 0.5rem;\n}\n.initialism {\n  font-size: 90%;\n  text-transform: uppercase;\n}\n.blockquote {\n  margin-bottom: 1rem;\n  font-size: 1.5rem;\n}\n.blockquote-footer {\n  display: block;\n  font-size: 80%;\n  color: #acb5be;\n}\n.blockquote-footer::before {\n    content: \"\\2014   \\A0\";\n}\n.img-fluid {\n  max-width: 100%;\n  height: auto;\n}\n.img-thumbnail {\n  padding: 0.25rem;\n  background-color: #eee;\n  border: 1px solid #dee2e6;\n  border-radius: 0.25rem;\n  max-width: 100%;\n  height: auto;\n}\n.figure {\n  display: inline-block;\n}\n.figure-img {\n  margin-bottom: 0.5rem;\n  line-height: 1;\n}\n.figure-caption {\n  font-size: 90%;\n  color: #6c757d;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;\n}\ncode {\n  font-size: 87.5%;\n  color: #e83e8c;\n  word-break: break-word;\n}\na > code {\n    color: inherit;\n}\nkbd {\n  padding: 0.2rem 0.4rem;\n  font-size: 87.5%;\n  color: #fff;\n  background-color: #212529;\n  border-radius: 0.2rem;\n}\nkbd kbd {\n    padding: 0;\n    font-size: 100%;\n    font-weight: 700;\n}\npre {\n  display: block;\n  font-size: 87.5%;\n  color: #212529;\n}\npre code {\n    font-size: inherit;\n    color: inherit;\n    word-break: normal;\n}\n.pre-scrollable {\n  max-height: 340px;\n  overflow-y: scroll;\n}\n.container {\n  width: 100%;\n  padding-right: 15px;\n  padding-left: 15px;\n  margin-right: auto;\n  margin-left: auto;\n}\n@media (min-width: 576px) {\n.container {\n      max-width: 540px;\n}\n}\n@media (min-width: 768px) {\n.container {\n      max-width: 720px;\n}\n}\n@media (min-width: 992px) {\n.container {\n      max-width: 960px;\n}\n}\n@media (min-width: 1200px) {\n.container {\n      max-width: 1140px;\n}\n}\n.container-fluid {\n  width: 100%;\n  padding-right: 15px;\n  padding-left: 15px;\n  margin-right: auto;\n  margin-left: auto;\n}\n.row {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  margin-right: -15px;\n  margin-left: -15px;\n}\n.no-gutters {\n  margin-right: 0;\n  margin-left: 0;\n}\n.no-gutters > .col,\n  .no-gutters > [class*=\"col-\"] {\n    padding-right: 0;\n    padding-left: 0;\n}\n.col-1, .col-2, .col-3, .col-4, .col-5, .col-6, .col-7, .col-8, .col-9, .col-10, .col-11, .col-12, .col,\n.col-auto, .col-sm-1, .col-sm-2, .col-sm-3, .col-sm-4, .col-sm-5, .col-sm-6, .col-sm-7, .col-sm-8, .col-sm-9, .col-sm-10, .col-sm-11, .col-sm-12, .col-sm,\n.col-sm-auto, .col-md-1, .col-md-2, .col-md-3, .col-md-4, .col-md-5, .col-md-6, .col-md-7, .col-md-8, .col-md-9, .col-md-10, .col-md-11, .col-md-12, .col-md,\n.col-md-auto, .col-lg-1, .col-lg-2, .col-lg-3, .col-lg-4, .col-lg-5, .col-lg-6, .col-lg-7, .col-lg-8, .col-lg-9, .col-lg-10, .col-lg-11, .col-lg-12, .col-lg,\n.col-lg-auto, .col-xl-1, .col-xl-2, .col-xl-3, .col-xl-4, .col-xl-5, .col-xl-6, .col-xl-7, .col-xl-8, .col-xl-9, .col-xl-10, .col-xl-11, .col-xl-12, .col-xl,\n.col-xl-auto {\n  position: relative;\n  width: 100%;\n  min-height: 1px;\n  padding-right: 15px;\n  padding-left: 15px;\n}\n.col {\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  max-width: 100%;\n}\n.col-auto {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 auto;\n          flex: 0 0 auto;\n  width: auto;\n  max-width: none;\n}\n.col-1 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 8.33333%;\n          flex: 0 0 8.33333%;\n  max-width: 8.33333%;\n}\n.col-2 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 16.66667%;\n          flex: 0 0 16.66667%;\n  max-width: 16.66667%;\n}\n.col-3 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 25%;\n          flex: 0 0 25%;\n  max-width: 25%;\n}\n.col-4 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 33.33333%;\n          flex: 0 0 33.33333%;\n  max-width: 33.33333%;\n}\n.col-5 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 41.66667%;\n          flex: 0 0 41.66667%;\n  max-width: 41.66667%;\n}\n.col-6 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 50%;\n          flex: 0 0 50%;\n  max-width: 50%;\n}\n.col-7 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 58.33333%;\n          flex: 0 0 58.33333%;\n  max-width: 58.33333%;\n}\n.col-8 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 66.66667%;\n          flex: 0 0 66.66667%;\n  max-width: 66.66667%;\n}\n.col-9 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 75%;\n          flex: 0 0 75%;\n  max-width: 75%;\n}\n.col-10 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 83.33333%;\n          flex: 0 0 83.33333%;\n  max-width: 83.33333%;\n}\n.col-11 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 91.66667%;\n          flex: 0 0 91.66667%;\n  max-width: 91.66667%;\n}\n.col-12 {\n  -webkit-box-flex: 0;\n      -ms-flex: 0 0 100%;\n          flex: 0 0 100%;\n  max-width: 100%;\n}\n.order-first {\n  -webkit-box-ordinal-group: 0;\n      -ms-flex-order: -1;\n          order: -1;\n}\n.order-last {\n  -webkit-box-ordinal-group: 14;\n      -ms-flex-order: 13;\n          order: 13;\n}\n.order-0 {\n  -webkit-box-ordinal-group: 1;\n      -ms-flex-order: 0;\n          order: 0;\n}\n.order-1 {\n  -webkit-box-ordinal-group: 2;\n      -ms-flex-order: 1;\n          order: 1;\n}\n.order-2 {\n  -webkit-box-ordinal-group: 3;\n      -ms-flex-order: 2;\n          order: 2;\n}\n.order-3 {\n  -webkit-box-ordinal-group: 4;\n      -ms-flex-order: 3;\n          order: 3;\n}\n.order-4 {\n  -webkit-box-ordinal-group: 5;\n      -ms-flex-order: 4;\n          order: 4;\n}\n.order-5 {\n  -webkit-box-ordinal-group: 6;\n      -ms-flex-order: 5;\n          order: 5;\n}\n.order-6 {\n  -webkit-box-ordinal-group: 7;\n      -ms-flex-order: 6;\n          order: 6;\n}\n.order-7 {\n  -webkit-box-ordinal-group: 8;\n      -ms-flex-order: 7;\n          order: 7;\n}\n.order-8 {\n  -webkit-box-ordinal-group: 9;\n      -ms-flex-order: 8;\n          order: 8;\n}\n.order-9 {\n  -webkit-box-ordinal-group: 10;\n      -ms-flex-order: 9;\n          order: 9;\n}\n.order-10 {\n  -webkit-box-ordinal-group: 11;\n      -ms-flex-order: 10;\n          order: 10;\n}\n.order-11 {\n  -webkit-box-ordinal-group: 12;\n      -ms-flex-order: 11;\n          order: 11;\n}\n.order-12 {\n  -webkit-box-ordinal-group: 13;\n      -ms-flex-order: 12;\n          order: 12;\n}\n.offset-1 {\n  margin-left: 8.33333%;\n}\n.offset-2 {\n  margin-left: 16.66667%;\n}\n.offset-3 {\n  margin-left: 25%;\n}\n.offset-4 {\n  margin-left: 33.33333%;\n}\n.offset-5 {\n  margin-left: 41.66667%;\n}\n.offset-6 {\n  margin-left: 50%;\n}\n.offset-7 {\n  margin-left: 58.33333%;\n}\n.offset-8 {\n  margin-left: 66.66667%;\n}\n.offset-9 {\n  margin-left: 75%;\n}\n.offset-10 {\n  margin-left: 83.33333%;\n}\n.offset-11 {\n  margin-left: 91.66667%;\n}\n@media (min-width: 576px) {\n.col-sm {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-sm-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-sm-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-sm-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-sm-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-sm-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-sm-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-sm-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-sm-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-sm-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-sm-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-sm-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-sm-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-sm-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-sm-first {\n    -webkit-box-ordinal-group: 0;\n        -ms-flex-order: -1;\n            order: -1;\n}\n.order-sm-last {\n    -webkit-box-ordinal-group: 14;\n        -ms-flex-order: 13;\n            order: 13;\n}\n.order-sm-0 {\n    -webkit-box-ordinal-group: 1;\n        -ms-flex-order: 0;\n            order: 0;\n}\n.order-sm-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-sm-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-sm-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-sm-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-sm-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-sm-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-sm-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-sm-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-sm-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-sm-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-sm-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-sm-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n.offset-sm-0 {\n    margin-left: 0;\n}\n.offset-sm-1 {\n    margin-left: 8.33333%;\n}\n.offset-sm-2 {\n    margin-left: 16.66667%;\n}\n.offset-sm-3 {\n    margin-left: 25%;\n}\n.offset-sm-4 {\n    margin-left: 33.33333%;\n}\n.offset-sm-5 {\n    margin-left: 41.66667%;\n}\n.offset-sm-6 {\n    margin-left: 50%;\n}\n.offset-sm-7 {\n    margin-left: 58.33333%;\n}\n.offset-sm-8 {\n    margin-left: 66.66667%;\n}\n.offset-sm-9 {\n    margin-left: 75%;\n}\n.offset-sm-10 {\n    margin-left: 83.33333%;\n}\n.offset-sm-11 {\n    margin-left: 91.66667%;\n}\n}\n@media (min-width: 768px) {\n.col-md {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-md-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-md-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-md-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-md-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-md-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-md-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-md-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-md-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-md-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-md-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-md-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-md-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-md-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-md-first {\n    -webkit-box-ordinal-group: 0;\n        -ms-flex-order: -1;\n            order: -1;\n}\n.order-md-last {\n    -webkit-box-ordinal-group: 14;\n        -ms-flex-order: 13;\n            order: 13;\n}\n.order-md-0 {\n    -webkit-box-ordinal-group: 1;\n        -ms-flex-order: 0;\n            order: 0;\n}\n.order-md-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-md-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-md-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-md-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-md-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-md-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-md-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-md-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-md-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-md-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-md-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-md-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n.offset-md-0 {\n    margin-left: 0;\n}\n.offset-md-1 {\n    margin-left: 8.33333%;\n}\n.offset-md-2 {\n    margin-left: 16.66667%;\n}\n.offset-md-3 {\n    margin-left: 25%;\n}\n.offset-md-4 {\n    margin-left: 33.33333%;\n}\n.offset-md-5 {\n    margin-left: 41.66667%;\n}\n.offset-md-6 {\n    margin-left: 50%;\n}\n.offset-md-7 {\n    margin-left: 58.33333%;\n}\n.offset-md-8 {\n    margin-left: 66.66667%;\n}\n.offset-md-9 {\n    margin-left: 75%;\n}\n.offset-md-10 {\n    margin-left: 83.33333%;\n}\n.offset-md-11 {\n    margin-left: 91.66667%;\n}\n}\n@media (min-width: 992px) {\n.col-lg {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-lg-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-lg-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-lg-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-lg-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-lg-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-lg-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-lg-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-lg-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-lg-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-lg-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-lg-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-lg-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-lg-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-lg-first {\n    -webkit-box-ordinal-group: 0;\n        -ms-flex-order: -1;\n            order: -1;\n}\n.order-lg-last {\n    -webkit-box-ordinal-group: 14;\n        -ms-flex-order: 13;\n            order: 13;\n}\n.order-lg-0 {\n    -webkit-box-ordinal-group: 1;\n        -ms-flex-order: 0;\n            order: 0;\n}\n.order-lg-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-lg-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-lg-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-lg-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-lg-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-lg-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-lg-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-lg-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-lg-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-lg-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-lg-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-lg-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n.offset-lg-0 {\n    margin-left: 0;\n}\n.offset-lg-1 {\n    margin-left: 8.33333%;\n}\n.offset-lg-2 {\n    margin-left: 16.66667%;\n}\n.offset-lg-3 {\n    margin-left: 25%;\n}\n.offset-lg-4 {\n    margin-left: 33.33333%;\n}\n.offset-lg-5 {\n    margin-left: 41.66667%;\n}\n.offset-lg-6 {\n    margin-left: 50%;\n}\n.offset-lg-7 {\n    margin-left: 58.33333%;\n}\n.offset-lg-8 {\n    margin-left: 66.66667%;\n}\n.offset-lg-9 {\n    margin-left: 75%;\n}\n.offset-lg-10 {\n    margin-left: 83.33333%;\n}\n.offset-lg-11 {\n    margin-left: 91.66667%;\n}\n}\n@media (min-width: 1200px) {\n.col-xl {\n    -ms-flex-preferred-size: 0;\n        flex-basis: 0;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    max-width: 100%;\n}\n.col-xl-auto {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 auto;\n            flex: 0 0 auto;\n    width: auto;\n    max-width: none;\n}\n.col-xl-1 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 8.33333%;\n            flex: 0 0 8.33333%;\n    max-width: 8.33333%;\n}\n.col-xl-2 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 16.66667%;\n            flex: 0 0 16.66667%;\n    max-width: 16.66667%;\n}\n.col-xl-3 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 25%;\n            flex: 0 0 25%;\n    max-width: 25%;\n}\n.col-xl-4 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 33.33333%;\n            flex: 0 0 33.33333%;\n    max-width: 33.33333%;\n}\n.col-xl-5 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 41.66667%;\n            flex: 0 0 41.66667%;\n    max-width: 41.66667%;\n}\n.col-xl-6 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 50%;\n            flex: 0 0 50%;\n    max-width: 50%;\n}\n.col-xl-7 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 58.33333%;\n            flex: 0 0 58.33333%;\n    max-width: 58.33333%;\n}\n.col-xl-8 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 66.66667%;\n            flex: 0 0 66.66667%;\n    max-width: 66.66667%;\n}\n.col-xl-9 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 75%;\n            flex: 0 0 75%;\n    max-width: 75%;\n}\n.col-xl-10 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 83.33333%;\n            flex: 0 0 83.33333%;\n    max-width: 83.33333%;\n}\n.col-xl-11 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 91.66667%;\n            flex: 0 0 91.66667%;\n    max-width: 91.66667%;\n}\n.col-xl-12 {\n    -webkit-box-flex: 0;\n        -ms-flex: 0 0 100%;\n            flex: 0 0 100%;\n    max-width: 100%;\n}\n.order-xl-first {\n    -webkit-box-ordinal-group: 0;\n        -ms-flex-order: -1;\n            order: -1;\n}\n.order-xl-last {\n    -webkit-box-ordinal-group: 14;\n        -ms-flex-order: 13;\n            order: 13;\n}\n.order-xl-0 {\n    -webkit-box-ordinal-group: 1;\n        -ms-flex-order: 0;\n            order: 0;\n}\n.order-xl-1 {\n    -webkit-box-ordinal-group: 2;\n        -ms-flex-order: 1;\n            order: 1;\n}\n.order-xl-2 {\n    -webkit-box-ordinal-group: 3;\n        -ms-flex-order: 2;\n            order: 2;\n}\n.order-xl-3 {\n    -webkit-box-ordinal-group: 4;\n        -ms-flex-order: 3;\n            order: 3;\n}\n.order-xl-4 {\n    -webkit-box-ordinal-group: 5;\n        -ms-flex-order: 4;\n            order: 4;\n}\n.order-xl-5 {\n    -webkit-box-ordinal-group: 6;\n        -ms-flex-order: 5;\n            order: 5;\n}\n.order-xl-6 {\n    -webkit-box-ordinal-group: 7;\n        -ms-flex-order: 6;\n            order: 6;\n}\n.order-xl-7 {\n    -webkit-box-ordinal-group: 8;\n        -ms-flex-order: 7;\n            order: 7;\n}\n.order-xl-8 {\n    -webkit-box-ordinal-group: 9;\n        -ms-flex-order: 8;\n            order: 8;\n}\n.order-xl-9 {\n    -webkit-box-ordinal-group: 10;\n        -ms-flex-order: 9;\n            order: 9;\n}\n.order-xl-10 {\n    -webkit-box-ordinal-group: 11;\n        -ms-flex-order: 10;\n            order: 10;\n}\n.order-xl-11 {\n    -webkit-box-ordinal-group: 12;\n        -ms-flex-order: 11;\n            order: 11;\n}\n.order-xl-12 {\n    -webkit-box-ordinal-group: 13;\n        -ms-flex-order: 12;\n            order: 12;\n}\n.offset-xl-0 {\n    margin-left: 0;\n}\n.offset-xl-1 {\n    margin-left: 8.33333%;\n}\n.offset-xl-2 {\n    margin-left: 16.66667%;\n}\n.offset-xl-3 {\n    margin-left: 25%;\n}\n.offset-xl-4 {\n    margin-left: 33.33333%;\n}\n.offset-xl-5 {\n    margin-left: 41.66667%;\n}\n.offset-xl-6 {\n    margin-left: 50%;\n}\n.offset-xl-7 {\n    margin-left: 58.33333%;\n}\n.offset-xl-8 {\n    margin-left: 66.66667%;\n}\n.offset-xl-9 {\n    margin-left: 75%;\n}\n.offset-xl-10 {\n    margin-left: 83.33333%;\n}\n.offset-xl-11 {\n    margin-left: 91.66667%;\n}\n}\n.table {\n  width: 100%;\n  max-width: 100%;\n  margin-bottom: 1rem;\n  background-color: transparent;\n}\n.table th,\n  .table td {\n    padding: 0.75rem;\n    vertical-align: top;\n    border-top: 0 solid #eceeef;\n}\n.table thead th {\n    vertical-align: bottom;\n    border-bottom: 0 solid #eceeef;\n}\n.table tbody + tbody {\n    border-top: 0 solid #eceeef;\n}\n.table .table {\n    background-color: #eee;\n}\n.table-sm th,\n.table-sm td {\n  padding: 0.3rem;\n}\n.table-bordered {\n  border: 0 solid #eceeef;\n}\n.table-bordered th,\n  .table-bordered td {\n    border: 0 solid #eceeef;\n}\n.table-bordered thead th,\n  .table-bordered thead td {\n    border-bottom-width: 0;\n}\n.table-striped tbody tr:nth-of-type(odd) {\n  background-color: rgba(0, 0, 0, 0.05);\n}\n.table-hover tbody tr:hover {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.table-primary,\n.table-primary > th,\n.table-primary > td {\n  background-color: #fdf0db;\n}\n.table-hover .table-primary:hover {\n  background-color: #fce6c3;\n}\n.table-hover .table-primary:hover > td,\n  .table-hover .table-primary:hover > th {\n    background-color: #fce6c3;\n}\n.table-secondary,\n.table-secondary > th,\n.table-secondary > td {\n  background-color: white;\n}\n.table-hover .table-secondary:hover {\n  background-color: #f2f2f2;\n}\n.table-hover .table-secondary:hover > td,\n  .table-hover .table-secondary:hover > th {\n    background-color: #f2f2f2;\n}\n.table-success,\n.table-success > th,\n.table-success > td {\n  background-color: #f0fdef;\n}\n.table-hover .table-success:hover {\n  background-color: #dbfad8;\n}\n.table-hover .table-success:hover > td,\n  .table-hover .table-success:hover > th {\n    background-color: #dbfad8;\n}\n.table-info,\n.table-info > th,\n.table-info > td {\n  background-color: #cce9f7;\n}\n.table-hover .table-info:hover {\n  background-color: #b6dff4;\n}\n.table-hover .table-info:hover > td,\n  .table-hover .table-info:hover > th {\n    background-color: #b6dff4;\n}\n.table-warning,\n.table-warning > th,\n.table-warning > td {\n  background-color: #fdf0db;\n}\n.table-hover .table-warning:hover {\n  background-color: #fce6c3;\n}\n.table-hover .table-warning:hover > td,\n  .table-hover .table-warning:hover > th {\n    background-color: #fce6c3;\n}\n.table-danger,\n.table-danger > th,\n.table-danger > td {\n  background-color: #f7cccc;\n}\n.table-hover .table-danger:hover {\n  background-color: #f4b6b6;\n}\n.table-hover .table-danger:hover > td,\n  .table-hover .table-danger:hover > th {\n    background-color: #f4b6b6;\n}\n.table-light,\n.table-light > th,\n.table-light > td {\n  background-color: #fbfcfc;\n}\n.table-hover .table-light:hover {\n  background-color: #ecf1f1;\n}\n.table-hover .table-light:hover > td,\n  .table-hover .table-light:hover > th {\n    background-color: #ecf1f1;\n}\n.table-dark,\n.table-dark > th,\n.table-dark > td {\n  background-color: #bebebe;\n}\n.table-hover .table-dark:hover {\n  background-color: #b1b1b1;\n}\n.table-hover .table-dark:hover > td,\n  .table-hover .table-dark:hover > th {\n    background-color: #b1b1b1;\n}\n.table-pale,\n.table-pale > th,\n.table-pale > td {\n  background-color: #f4f4f4;\n}\n.table-hover .table-pale:hover {\n  background-color: #e7e7e7;\n}\n.table-hover .table-pale:hover > td,\n  .table-hover .table-pale:hover > th {\n    background-color: #e7e7e7;\n}\n.table-active,\n.table-active > th,\n.table-active > td {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.table-hover .table-active:hover {\n  background-color: rgba(0, 0, 0, 0.075);\n}\n.table-hover .table-active:hover > td,\n  .table-hover .table-active:hover > th {\n    background-color: rgba(0, 0, 0, 0.075);\n}\n.table .thead-dark th {\n  color: #eee;\n  background-color: #212529;\n  border-color: #32383e;\n}\n.table .thead-light th {\n  color: #495057;\n  background-color: #e9ecef;\n  border-color: #eceeef;\n}\n.table-dark {\n  color: #eee;\n  background-color: #212529;\n}\n.table-dark th,\n  .table-dark td,\n  .table-dark thead th {\n    border-color: #32383e;\n}\n.table-dark.table-bordered {\n    border: 0;\n}\n.table-dark.table-striped tbody tr:nth-of-type(odd) {\n    background-color: rgba(255, 255, 255, 0.05);\n}\n.table-dark.table-hover tbody tr:hover {\n    background-color: rgba(255, 255, 255, 0.075);\n}\n@media (max-width: 575.98px) {\n.table-responsive-sm {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.table-responsive-sm > .table-bordered {\n      border: 0;\n}\n}\n@media (max-width: 767.98px) {\n.table-responsive-md {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.table-responsive-md > .table-bordered {\n      border: 0;\n}\n}\n@media (max-width: 991.98px) {\n.table-responsive-lg {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.table-responsive-lg > .table-bordered {\n      border: 0;\n}\n}\n@media (max-width: 1199.98px) {\n.table-responsive-xl {\n    display: block;\n    width: 100%;\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n    -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.table-responsive-xl > .table-bordered {\n      border: 0;\n}\n}\n.table-responsive {\n  display: block;\n  width: 100%;\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n  -ms-overflow-style: -ms-autohiding-scrollbar;\n}\n.table-responsive > .table-bordered {\n    border: 0;\n}\n.form-control {\n  display: block;\n  width: 100%;\n  padding: 0.375rem 0.75rem;\n  font-size: 1rem;\n  line-height: 1.5;\n  color: #495057;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 0px solid #ddd;\n  border-radius: 0.25rem;\n  -webkit-transition: border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;\n  transition: border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;\n  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;\n}\n.form-control::-ms-expand {\n    background-color: transparent;\n    border: 0;\n}\n.form-control:focus {\n    color: #495057;\n    background-color: #fff;\n    border-color: #fffcf8;\n    outline: 0;\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n}\n.form-control::-webkit-input-placeholder {\n    color: #6c757d;\n    opacity: 1;\n}\n.form-control:-ms-input-placeholder {\n    color: #6c757d;\n    opacity: 1;\n}\n.form-control::-ms-input-placeholder {\n    color: #6c757d;\n    opacity: 1;\n}\n.form-control::placeholder {\n    color: #6c757d;\n    opacity: 1;\n}\n.form-control:disabled, .form-control[readonly] {\n    background-color: #e9ecef;\n    opacity: 1;\n}\nselect.form-control:not([size]):not([multiple]) {\n  height: calc(2.25rem + 0px);\n}\nselect.form-control:focus::-ms-value {\n  color: #495057;\n  background-color: #fff;\n}\n.form-control-file,\n.form-control-range {\n  display: block;\n  width: 100%;\n}\n.col-form-label {\n  padding-top: calc(0.375rem + 0px);\n  padding-bottom: calc(0.375rem + 0px);\n  margin-bottom: 0;\n  font-size: inherit;\n  line-height: 1.5;\n}\n.col-form-label-lg {\n  padding-top: calc(0.5rem + 0px);\n  padding-bottom: calc(0.5rem + 0px);\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\n.col-form-label-sm {\n  padding-top: calc(0.25rem + 0px);\n  padding-bottom: calc(0.25rem + 0px);\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n.form-control-plaintext {\n  display: block;\n  width: 100%;\n  padding-top: 0.375rem;\n  padding-bottom: 0.375rem;\n  margin-bottom: 0;\n  line-height: 1.5;\n  background-color: transparent;\n  border: solid transparent;\n  border-width: 0px 0;\n}\n.form-control-plaintext.form-control-sm, .input-group-sm > .form-control-plaintext.form-control,\n  .input-group-sm > .input-group-prepend > .form-control-plaintext.input-group-text,\n  .input-group-sm > .input-group-append > .form-control-plaintext.input-group-text,\n  .input-group-sm > .input-group-prepend > .form-control-plaintext.btn,\n  .input-group-sm > .input-group-append > .form-control-plaintext.btn, .form-control-plaintext.form-control-lg, .input-group-lg > .form-control-plaintext.form-control,\n  .input-group-lg > .input-group-prepend > .form-control-plaintext.input-group-text,\n  .input-group-lg > .input-group-append > .form-control-plaintext.input-group-text,\n  .input-group-lg > .input-group-prepend > .form-control-plaintext.btn,\n  .input-group-lg > .input-group-append > .form-control-plaintext.btn {\n    padding-right: 0;\n    padding-left: 0;\n}\n.form-control-sm, .input-group-sm > .form-control,\n.input-group-sm > .input-group-prepend > .input-group-text,\n.input-group-sm > .input-group-append > .input-group-text,\n.input-group-sm > .input-group-prepend > .btn,\n.input-group-sm > .input-group-append > .btn {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n  border-radius: 0.2rem;\n}\nselect.form-control-sm:not([size]):not([multiple]), .input-group-sm > select.form-control:not([size]):not([multiple]),\n.input-group-sm > .input-group-prepend > select.input-group-text:not([size]):not([multiple]),\n.input-group-sm > .input-group-append > select.input-group-text:not([size]):not([multiple]),\n.input-group-sm > .input-group-prepend > select.btn:not([size]):not([multiple]),\n.input-group-sm > .input-group-append > select.btn:not([size]):not([multiple]) {\n  height: calc(1.8125rem + 0px);\n}\n.form-control-lg, .input-group-lg > .form-control,\n.input-group-lg > .input-group-prepend > .input-group-text,\n.input-group-lg > .input-group-append > .input-group-text,\n.input-group-lg > .input-group-prepend > .btn,\n.input-group-lg > .input-group-append > .btn {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n  border-radius: 0.3rem;\n}\nselect.form-control-lg:not([size]):not([multiple]), .input-group-lg > select.form-control:not([size]):not([multiple]),\n.input-group-lg > .input-group-prepend > select.input-group-text:not([size]):not([multiple]),\n.input-group-lg > .input-group-append > select.input-group-text:not([size]):not([multiple]),\n.input-group-lg > .input-group-prepend > select.btn:not([size]):not([multiple]),\n.input-group-lg > .input-group-append > select.btn:not([size]):not([multiple]) {\n  height: calc(2.875rem + 0px);\n}\n.form-group {\n  margin-bottom: 1rem;\n}\n.form-text {\n  display: block;\n  margin-top: 0.25rem;\n}\n.form-row {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  margin-right: -5px;\n  margin-left: -5px;\n}\n.form-row > .col,\n  .form-row > [class*=\"col-\"] {\n    padding-right: 5px;\n    padding-left: 5px;\n}\n.form-check {\n  position: relative;\n  display: block;\n  padding-left: 1.25rem;\n}\n.form-check-input {\n  position: absolute;\n  margin-top: 0.3rem;\n  margin-left: -1.25rem;\n}\n.form-check-input:disabled ~ .form-check-label {\n    color: #6c757d;\n}\n.form-check-label {\n  margin-bottom: 0;\n}\n.form-check-inline {\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  padding-left: 0;\n  margin-right: 0.75rem;\n}\n.form-check-inline .form-check-input {\n    position: static;\n    margin-top: 0;\n    margin-right: 0.3125rem;\n    margin-left: 0;\n}\n.valid-feedback {\n  display: none;\n  width: 100%;\n  margin-top: 0.25rem;\n  font-size: 80%;\n  color: #c8f9c5;\n}\n.valid-tooltip {\n  position: absolute;\n  top: 100%;\n  z-index: 5;\n  display: none;\n  max-width: 100%;\n  padding: .5rem;\n  margin-top: .1rem;\n  font-size: .875rem;\n  line-height: 1;\n  color: #fff;\n  background-color: rgba(200, 249, 197, 0.8);\n  border-radius: .2rem;\n}\n.was-validated .form-control:valid, .form-control.is-valid, .was-validated\n.custom-select:valid,\n.custom-select.is-valid {\n  border-color: #c8f9c5;\n}\n.was-validated .form-control:valid:focus, .form-control.is-valid:focus, .was-validated\n  .custom-select:valid:focus,\n  .custom-select.is-valid:focus {\n    border-color: #c8f9c5;\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.25);\n            box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.25);\n}\n.was-validated .form-control:valid ~ .valid-feedback,\n  .was-validated .form-control:valid ~ .valid-tooltip, .form-control.is-valid ~ .valid-feedback,\n  .form-control.is-valid ~ .valid-tooltip, .was-validated\n  .custom-select:valid ~ .valid-feedback,\n  .was-validated\n  .custom-select:valid ~ .valid-tooltip,\n  .custom-select.is-valid ~ .valid-feedback,\n  .custom-select.is-valid ~ .valid-tooltip {\n    display: block;\n}\n.was-validated .form-check-input:valid ~ .form-check-label, .form-check-input.is-valid ~ .form-check-label {\n  color: #c8f9c5;\n}\n.was-validated .form-check-input:valid ~ .valid-feedback,\n.was-validated .form-check-input:valid ~ .valid-tooltip, .form-check-input.is-valid ~ .valid-feedback,\n.form-check-input.is-valid ~ .valid-tooltip {\n  display: block;\n}\n.was-validated .custom-control-input:valid ~ .custom-control-label, .custom-control-input.is-valid ~ .custom-control-label {\n  color: #c8f9c5;\n}\n.was-validated .custom-control-input:valid ~ .custom-control-label::before, .custom-control-input.is-valid ~ .custom-control-label::before {\n    background-color: white;\n}\n.was-validated .custom-control-input:valid ~ .valid-feedback,\n.was-validated .custom-control-input:valid ~ .valid-tooltip, .custom-control-input.is-valid ~ .valid-feedback,\n.custom-control-input.is-valid ~ .valid-tooltip {\n  display: block;\n}\n.was-validated .custom-control-input:valid:checked ~ .custom-control-label::before, .custom-control-input.is-valid:checked ~ .custom-control-label::before {\n  background-color: #f4fef3;\n}\n.was-validated .custom-control-input:valid:focus ~ .custom-control-label::before, .custom-control-input.is-valid:focus ~ .custom-control-label::before {\n  -webkit-box-shadow: 0 0 0 1px #eee, 0 0 0 0.2rem rgba(200, 249, 197, 0.25);\n          box-shadow: 0 0 0 1px #eee, 0 0 0 0.2rem rgba(200, 249, 197, 0.25);\n}\n.was-validated .custom-file-input:valid ~ .custom-file-label, .custom-file-input.is-valid ~ .custom-file-label {\n  border-color: #c8f9c5;\n}\n.was-validated .custom-file-input:valid ~ .custom-file-label::before, .custom-file-input.is-valid ~ .custom-file-label::before {\n    border-color: inherit;\n}\n.was-validated .custom-file-input:valid ~ .valid-feedback,\n.was-validated .custom-file-input:valid ~ .valid-tooltip, .custom-file-input.is-valid ~ .valid-feedback,\n.custom-file-input.is-valid ~ .valid-tooltip {\n  display: block;\n}\n.was-validated .custom-file-input:valid:focus ~ .custom-file-label, .custom-file-input.is-valid:focus ~ .custom-file-label {\n  -webkit-box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.25);\n          box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.25);\n}\n.invalid-feedback {\n  display: none;\n  width: 100%;\n  margin-top: 0.25rem;\n  font-size: 80%;\n  color: #e34a4a;\n}\n.invalid-tooltip {\n  position: absolute;\n  top: 100%;\n  z-index: 5;\n  display: none;\n  max-width: 100%;\n  padding: .5rem;\n  margin-top: .1rem;\n  font-size: .875rem;\n  line-height: 1;\n  color: #fff;\n  background-color: rgba(227, 74, 74, 0.8);\n  border-radius: .2rem;\n}\n.was-validated .form-control:invalid, .form-control.is-invalid, .was-validated\n.custom-select:invalid,\n.custom-select.is-invalid {\n  border-color: #e34a4a;\n}\n.was-validated .form-control:invalid:focus, .form-control.is-invalid:focus, .was-validated\n  .custom-select:invalid:focus,\n  .custom-select.is-invalid:focus {\n    border-color: #e34a4a;\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.25);\n            box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.25);\n}\n.was-validated .form-control:invalid ~ .invalid-feedback,\n  .was-validated .form-control:invalid ~ .invalid-tooltip, .form-control.is-invalid ~ .invalid-feedback,\n  .form-control.is-invalid ~ .invalid-tooltip, .was-validated\n  .custom-select:invalid ~ .invalid-feedback,\n  .was-validated\n  .custom-select:invalid ~ .invalid-tooltip,\n  .custom-select.is-invalid ~ .invalid-feedback,\n  .custom-select.is-invalid ~ .invalid-tooltip {\n    display: block;\n}\n.was-validated .form-check-input:invalid ~ .form-check-label, .form-check-input.is-invalid ~ .form-check-label {\n  color: #e34a4a;\n}\n.was-validated .form-check-input:invalid ~ .invalid-feedback,\n.was-validated .form-check-input:invalid ~ .invalid-tooltip, .form-check-input.is-invalid ~ .invalid-feedback,\n.form-check-input.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n.was-validated .custom-control-input:invalid ~ .custom-control-label, .custom-control-input.is-invalid ~ .custom-control-label {\n  color: #e34a4a;\n}\n.was-validated .custom-control-input:invalid ~ .custom-control-label::before, .custom-control-input.is-invalid ~ .custom-control-label::before {\n    background-color: #f4b8b8;\n}\n.was-validated .custom-control-input:invalid ~ .invalid-feedback,\n.was-validated .custom-control-input:invalid ~ .invalid-tooltip, .custom-control-input.is-invalid ~ .invalid-feedback,\n.custom-control-input.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n.was-validated .custom-control-input:invalid:checked ~ .custom-control-label::before, .custom-control-input.is-invalid:checked ~ .custom-control-label::before {\n  background-color: #ea7676;\n}\n.was-validated .custom-control-input:invalid:focus ~ .custom-control-label::before, .custom-control-input.is-invalid:focus ~ .custom-control-label::before {\n  -webkit-box-shadow: 0 0 0 1px #eee, 0 0 0 0.2rem rgba(227, 74, 74, 0.25);\n          box-shadow: 0 0 0 1px #eee, 0 0 0 0.2rem rgba(227, 74, 74, 0.25);\n}\n.was-validated .custom-file-input:invalid ~ .custom-file-label, .custom-file-input.is-invalid ~ .custom-file-label {\n  border-color: #e34a4a;\n}\n.was-validated .custom-file-input:invalid ~ .custom-file-label::before, .custom-file-input.is-invalid ~ .custom-file-label::before {\n    border-color: inherit;\n}\n.was-validated .custom-file-input:invalid ~ .invalid-feedback,\n.was-validated .custom-file-input:invalid ~ .invalid-tooltip, .custom-file-input.is-invalid ~ .invalid-feedback,\n.custom-file-input.is-invalid ~ .invalid-tooltip {\n  display: block;\n}\n.was-validated .custom-file-input:invalid:focus ~ .custom-file-label, .custom-file-input.is-invalid:focus ~ .custom-file-label {\n  -webkit-box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.25);\n          box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.25);\n}\n.form-inline {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-flow: row wrap;\n          flex-flow: row wrap;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.form-inline .form-check {\n    width: 100%;\n}\n@media (min-width: 576px) {\n.form-inline label {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      margin-bottom: 0;\n}\n.form-inline .form-group {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-flex: 0;\n          -ms-flex: 0 0 auto;\n              flex: 0 0 auto;\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-flow: row wrap;\n              flex-flow: row wrap;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      margin-bottom: 0;\n}\n.form-inline .form-control {\n      display: inline-block;\n      width: auto;\n      vertical-align: middle;\n}\n.form-inline .form-control-plaintext {\n      display: inline-block;\n}\n.form-inline .input-group {\n      width: auto;\n}\n.form-inline .form-check {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      width: auto;\n      padding-left: 0;\n}\n.form-inline .form-check-input {\n      position: relative;\n      margin-top: 0;\n      margin-right: 0.25rem;\n      margin-left: 0;\n}\n.form-inline .custom-control {\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n}\n.form-inline .custom-control-label {\n      margin-bottom: 0;\n}\n}\n.btn {\n  display: inline-block;\n  font-weight: 400;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: middle;\n  -webkit-user-select: none;\n     -moz-user-select: none;\n      -ms-user-select: none;\n          user-select: none;\n  border: 0px solid transparent;\n  padding: 1.1rem 3.9rem;\n  font-size: 1rem;\n  line-height: 1.25;\n  border-radius: 1.875rem;\n  -webkit-transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;\n  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;\n  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;\n  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;\n}\n.btn:hover, .btn:focus {\n    text-decoration: none;\n}\n.btn:focus, .btn.focus {\n    outline: 0;\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n}\n.btn.disabled, .btn:disabled {\n    opacity: 0.65;\n}\n.btn:not(:disabled):not(.disabled) {\n    cursor: pointer;\n}\n.btn:not(:disabled):not(.disabled):active, .btn:not(:disabled):not(.disabled).active {\n    background-image: none;\n}\na.btn.disabled,\nfieldset:disabled a.btn {\n  pointer-events: none;\n}\n.btn-primary {\n  color: #212529;\n  background-color: #f7c980;\n  border-color: #f7c980;\n}\n.btn-primary:hover {\n    color: #212529;\n    background-color: #f5ba5c;\n    border-color: #f4b550;\n}\n.btn-primary:focus, .btn-primary.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-primary.disabled, .btn-primary:disabled {\n    color: #212529;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.btn-primary:not(:disabled):not(.disabled):active, .btn-primary:not(:disabled):not(.disabled).active,\n  .show > .btn-primary.dropdown-toggle {\n    color: #212529;\n    background-color: #f4b550;\n    border-color: #f3b044;\n}\n.btn-primary:not(:disabled):not(.disabled):active:focus, .btn-primary:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-primary.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-secondary {\n  color: #212529;\n  background-color: #fff;\n  border-color: #fff;\n}\n.btn-secondary:hover {\n    color: #212529;\n    background-color: #ececec;\n    border-color: #e6e6e6;\n}\n.btn-secondary:focus, .btn-secondary.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n}\n.btn-secondary.disabled, .btn-secondary:disabled {\n    color: #212529;\n    background-color: #fff;\n    border-color: #fff;\n}\n.btn-secondary:not(:disabled):not(.disabled):active, .btn-secondary:not(:disabled):not(.disabled).active,\n  .show > .btn-secondary.dropdown-toggle {\n    color: #212529;\n    background-color: #e6e6e6;\n    border-color: #dfdfdf;\n}\n.btn-secondary:not(:disabled):not(.disabled):active:focus, .btn-secondary:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-secondary.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n}\n.btn-success {\n  color: #212529;\n  background-color: #c8f9c5;\n  border-color: #c8f9c5;\n}\n.btn-success:hover {\n    color: #212529;\n    background-color: #a7f5a2;\n    border-color: #9cf497;\n}\n.btn-success:focus, .btn-success.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n}\n.btn-success.disabled, .btn-success:disabled {\n    color: #212529;\n    background-color: #c8f9c5;\n    border-color: #c8f9c5;\n}\n.btn-success:not(:disabled):not(.disabled):active, .btn-success:not(:disabled):not(.disabled).active,\n  .show > .btn-success.dropdown-toggle {\n    color: #212529;\n    background-color: #9cf497;\n    border-color: #91f38b;\n}\n.btn-success:not(:disabled):not(.disabled):active:focus, .btn-success:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-success.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n}\n.btn-info {\n  color: #212529;\n  background-color: #4ab2e3;\n  border-color: #4ab2e3;\n}\n.btn-info:hover {\n    color: #fff;\n    background-color: #29a4de;\n    border-color: #219ed9;\n}\n.btn-info:focus, .btn-info.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n}\n.btn-info.disabled, .btn-info:disabled {\n    color: #212529;\n    background-color: #4ab2e3;\n    border-color: #4ab2e3;\n}\n.btn-info:not(:disabled):not(.disabled):active, .btn-info:not(:disabled):not(.disabled).active,\n  .show > .btn-info.dropdown-toggle {\n    color: #fff;\n    background-color: #219ed9;\n    border-color: #2096cd;\n}\n.btn-info:not(:disabled):not(.disabled):active:focus, .btn-info:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-info.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n}\n.btn-warning {\n  color: #212529;\n  background-color: #f7c980;\n  border-color: #f7c980;\n}\n.btn-warning:hover {\n    color: #212529;\n    background-color: #f5ba5c;\n    border-color: #f4b550;\n}\n.btn-warning:focus, .btn-warning.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-warning.disabled, .btn-warning:disabled {\n    color: #212529;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.btn-warning:not(:disabled):not(.disabled):active, .btn-warning:not(:disabled):not(.disabled).active,\n  .show > .btn-warning.dropdown-toggle {\n    color: #212529;\n    background-color: #f4b550;\n    border-color: #f3b044;\n}\n.btn-warning:not(:disabled):not(.disabled):active:focus, .btn-warning:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-warning.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-danger {\n  color: #fff;\n  background-color: #e34a4a;\n  border-color: #e34a4a;\n}\n.btn-danger:hover {\n    color: #fff;\n    background-color: #de2929;\n    border-color: #d92121;\n}\n.btn-danger:focus, .btn-danger.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n}\n.btn-danger.disabled, .btn-danger:disabled {\n    color: #fff;\n    background-color: #e34a4a;\n    border-color: #e34a4a;\n}\n.btn-danger:not(:disabled):not(.disabled):active, .btn-danger:not(:disabled):not(.disabled).active,\n  .show > .btn-danger.dropdown-toggle {\n    color: #fff;\n    background-color: #d92121;\n    border-color: #cd2020;\n}\n.btn-danger:not(:disabled):not(.disabled):active:focus, .btn-danger:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-danger.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n}\n.btn-light {\n  color: #212529;\n  background-color: #eff4f5;\n  border-color: #eff4f5;\n}\n.btn-light:hover {\n    color: #212529;\n    background-color: #d7e4e6;\n    border-color: #d0dee1;\n}\n.btn-light:focus, .btn-light.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n}\n.btn-light.disabled, .btn-light:disabled {\n    color: #212529;\n    background-color: #eff4f5;\n    border-color: #eff4f5;\n}\n.btn-light:not(:disabled):not(.disabled):active, .btn-light:not(:disabled):not(.disabled).active,\n  .show > .btn-light.dropdown-toggle {\n    color: #212529;\n    background-color: #d0dee1;\n    border-color: #c8d9dc;\n}\n.btn-light:not(:disabled):not(.disabled):active:focus, .btn-light:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-light.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n}\n.btn-dark {\n  color: #fff;\n  background-color: #161616;\n  border-color: #161616;\n}\n.btn-dark:hover {\n    color: #fff;\n    background-color: #030303;\n    border-color: black;\n}\n.btn-dark:focus, .btn-dark.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n}\n.btn-dark.disabled, .btn-dark:disabled {\n    color: #fff;\n    background-color: #161616;\n    border-color: #161616;\n}\n.btn-dark:not(:disabled):not(.disabled):active, .btn-dark:not(:disabled):not(.disabled).active,\n  .show > .btn-dark.dropdown-toggle {\n    color: #fff;\n    background-color: black;\n    border-color: black;\n}\n.btn-dark:not(:disabled):not(.disabled):active:focus, .btn-dark:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-dark.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n}\n.btn-pale {\n  color: #212529;\n  background-color: #d9d9d9;\n  border-color: #d9d9d9;\n}\n.btn-pale:hover {\n    color: #212529;\n    background-color: #c6c6c6;\n    border-color: silver;\n}\n.btn-pale:focus, .btn-pale.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n}\n.btn-pale.disabled, .btn-pale:disabled {\n    color: #212529;\n    background-color: #d9d9d9;\n    border-color: #d9d9d9;\n}\n.btn-pale:not(:disabled):not(.disabled):active, .btn-pale:not(:disabled):not(.disabled).active,\n  .show > .btn-pale.dropdown-toggle {\n    color: #212529;\n    background-color: silver;\n    border-color: #b9b9b9;\n}\n.btn-pale:not(:disabled):not(.disabled):active:focus, .btn-pale:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-pale.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n}\n.btn-outline-primary {\n  color: #f7c980;\n  background-color: transparent;\n  background-image: none;\n  border-color: #f7c980;\n}\n.btn-outline-primary:hover {\n    color: #212529;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.btn-outline-primary:focus, .btn-outline-primary.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-outline-primary.disabled, .btn-outline-primary:disabled {\n    color: #f7c980;\n    background-color: transparent;\n}\n.btn-outline-primary:not(:disabled):not(.disabled):active, .btn-outline-primary:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-primary.dropdown-toggle {\n    color: #212529;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.btn-outline-primary:not(:disabled):not(.disabled):active:focus, .btn-outline-primary:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-primary.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-outline-secondary {\n  color: #fff;\n  background-color: transparent;\n  background-image: none;\n  border-color: #fff;\n}\n.btn-outline-secondary:hover {\n    color: #212529;\n    background-color: #fff;\n    border-color: #fff;\n}\n.btn-outline-secondary:focus, .btn-outline-secondary.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n}\n.btn-outline-secondary.disabled, .btn-outline-secondary:disabled {\n    color: #fff;\n    background-color: transparent;\n}\n.btn-outline-secondary:not(:disabled):not(.disabled):active, .btn-outline-secondary:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-secondary.dropdown-toggle {\n    color: #212529;\n    background-color: #fff;\n    border-color: #fff;\n}\n.btn-outline-secondary:not(:disabled):not(.disabled):active:focus, .btn-outline-secondary:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-secondary.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(255, 255, 255, 0.5);\n}\n.btn-outline-success {\n  color: #c8f9c5;\n  background-color: transparent;\n  background-image: none;\n  border-color: #c8f9c5;\n}\n.btn-outline-success:hover {\n    color: #212529;\n    background-color: #c8f9c5;\n    border-color: #c8f9c5;\n}\n.btn-outline-success:focus, .btn-outline-success.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n}\n.btn-outline-success.disabled, .btn-outline-success:disabled {\n    color: #c8f9c5;\n    background-color: transparent;\n}\n.btn-outline-success:not(:disabled):not(.disabled):active, .btn-outline-success:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-success.dropdown-toggle {\n    color: #212529;\n    background-color: #c8f9c5;\n    border-color: #c8f9c5;\n}\n.btn-outline-success:not(:disabled):not(.disabled):active:focus, .btn-outline-success:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-success.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(200, 249, 197, 0.5);\n}\n.btn-outline-info {\n  color: #4ab2e3;\n  background-color: transparent;\n  background-image: none;\n  border-color: #4ab2e3;\n}\n.btn-outline-info:hover {\n    color: #212529;\n    background-color: #4ab2e3;\n    border-color: #4ab2e3;\n}\n.btn-outline-info:focus, .btn-outline-info.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n}\n.btn-outline-info.disabled, .btn-outline-info:disabled {\n    color: #4ab2e3;\n    background-color: transparent;\n}\n.btn-outline-info:not(:disabled):not(.disabled):active, .btn-outline-info:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-info.dropdown-toggle {\n    color: #212529;\n    background-color: #4ab2e3;\n    border-color: #4ab2e3;\n}\n.btn-outline-info:not(:disabled):not(.disabled):active:focus, .btn-outline-info:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-info.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(74, 178, 227, 0.5);\n}\n.btn-outline-warning {\n  color: #f7c980;\n  background-color: transparent;\n  background-image: none;\n  border-color: #f7c980;\n}\n.btn-outline-warning:hover {\n    color: #212529;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.btn-outline-warning:focus, .btn-outline-warning.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-outline-warning.disabled, .btn-outline-warning:disabled {\n    color: #f7c980;\n    background-color: transparent;\n}\n.btn-outline-warning:not(:disabled):not(.disabled):active, .btn-outline-warning:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-warning.dropdown-toggle {\n    color: #212529;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.btn-outline-warning:not(:disabled):not(.disabled):active:focus, .btn-outline-warning:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-warning.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.5);\n}\n.btn-outline-danger {\n  color: #e34a4a;\n  background-color: transparent;\n  background-image: none;\n  border-color: #e34a4a;\n}\n.btn-outline-danger:hover {\n    color: #fff;\n    background-color: #e34a4a;\n    border-color: #e34a4a;\n}\n.btn-outline-danger:focus, .btn-outline-danger.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n}\n.btn-outline-danger.disabled, .btn-outline-danger:disabled {\n    color: #e34a4a;\n    background-color: transparent;\n}\n.btn-outline-danger:not(:disabled):not(.disabled):active, .btn-outline-danger:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-danger.dropdown-toggle {\n    color: #fff;\n    background-color: #e34a4a;\n    border-color: #e34a4a;\n}\n.btn-outline-danger:not(:disabled):not(.disabled):active:focus, .btn-outline-danger:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-danger.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(227, 74, 74, 0.5);\n}\n.btn-outline-light {\n  color: #eff4f5;\n  background-color: transparent;\n  background-image: none;\n  border-color: #eff4f5;\n}\n.btn-outline-light:hover {\n    color: #212529;\n    background-color: #eff4f5;\n    border-color: #eff4f5;\n}\n.btn-outline-light:focus, .btn-outline-light.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n}\n.btn-outline-light.disabled, .btn-outline-light:disabled {\n    color: #eff4f5;\n    background-color: transparent;\n}\n.btn-outline-light:not(:disabled):not(.disabled):active, .btn-outline-light:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-light.dropdown-toggle {\n    color: #212529;\n    background-color: #eff4f5;\n    border-color: #eff4f5;\n}\n.btn-outline-light:not(:disabled):not(.disabled):active:focus, .btn-outline-light:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-light.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(239, 244, 245, 0.5);\n}\n.btn-outline-dark {\n  color: #161616;\n  background-color: transparent;\n  background-image: none;\n  border-color: #161616;\n}\n.btn-outline-dark:hover {\n    color: #fff;\n    background-color: #161616;\n    border-color: #161616;\n}\n.btn-outline-dark:focus, .btn-outline-dark.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n}\n.btn-outline-dark.disabled, .btn-outline-dark:disabled {\n    color: #161616;\n    background-color: transparent;\n}\n.btn-outline-dark:not(:disabled):not(.disabled):active, .btn-outline-dark:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-dark.dropdown-toggle {\n    color: #fff;\n    background-color: #161616;\n    border-color: #161616;\n}\n.btn-outline-dark:not(:disabled):not(.disabled):active:focus, .btn-outline-dark:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-dark.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(22, 22, 22, 0.5);\n}\n.btn-outline-pale {\n  color: #d9d9d9;\n  background-color: transparent;\n  background-image: none;\n  border-color: #d9d9d9;\n}\n.btn-outline-pale:hover {\n    color: #212529;\n    background-color: #d9d9d9;\n    border-color: #d9d9d9;\n}\n.btn-outline-pale:focus, .btn-outline-pale.focus {\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n            box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n}\n.btn-outline-pale.disabled, .btn-outline-pale:disabled {\n    color: #d9d9d9;\n    background-color: transparent;\n}\n.btn-outline-pale:not(:disabled):not(.disabled):active, .btn-outline-pale:not(:disabled):not(.disabled).active,\n  .show > .btn-outline-pale.dropdown-toggle {\n    color: #212529;\n    background-color: #d9d9d9;\n    border-color: #d9d9d9;\n}\n.btn-outline-pale:not(:disabled):not(.disabled):active:focus, .btn-outline-pale:not(:disabled):not(.disabled).active:focus,\n    .show > .btn-outline-pale.dropdown-toggle:focus {\n      -webkit-box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n              box-shadow: 0 0 0 0.2rem rgba(217, 217, 217, 0.5);\n}\n.btn-link {\n  font-weight: 400;\n  color: #f7c980;\n  background-color: transparent;\n}\n.btn-link:hover {\n    color: #faddb0;\n    text-decoration: none;\n    background-color: transparent;\n    border-color: transparent;\n}\n.btn-link:focus, .btn-link.focus {\n    text-decoration: none;\n    border-color: transparent;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n}\n.btn-link:disabled, .btn-link.disabled {\n    color: #6c757d;\n}\n.btn-lg, .btn-group-lg > .btn {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n  border-radius: 0.3rem;\n}\n.btn-sm, .btn-group-sm > .btn {\n  padding: 0.7rem 2.5rem;\n  font-size: 0.875rem;\n  line-height: 1.25;\n  border-radius: 0.2rem;\n}\n.btn-block {\n  display: block;\n  width: 100%;\n}\n.btn-block + .btn-block {\n    margin-top: 0.5rem;\n}\ninput[type=\"submit\"].btn-block,\ninput[type=\"reset\"].btn-block,\ninput[type=\"button\"].btn-block {\n  width: 100%;\n}\n.fade {\n  opacity: 0;\n  -webkit-transition: opacity 0.15s linear;\n  transition: opacity 0.15s linear;\n}\n.fade.show {\n    opacity: 1;\n}\n.collapse {\n  display: none;\n}\n.collapse.show {\n    display: block;\n}\ntr.collapse.show {\n  display: table-row;\n}\ntbody.collapse.show {\n  display: table-row-group;\n}\n.collapsing {\n  position: relative;\n  height: 0;\n  overflow: hidden;\n  -webkit-transition: height 0.35s ease;\n  transition: height 0.35s ease;\n}\n.dropup,\n.dropdown {\n  position: relative;\n}\n.dropdown-toggle::after {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0;\n  border-left: 0.3em solid transparent;\n}\n.dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropdown-menu {\n  position: absolute;\n  top: 100%;\n  left: 0;\n  z-index: 1000;\n  display: none;\n  float: left;\n  min-width: 15rem;\n  padding: 0.5rem 0;\n  margin: 0.125rem 0 0;\n  font-size: 1rem;\n  color: #34495e;\n  text-align: left;\n  list-style: none;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 1px solid rgba(0, 0, 0, 0.15);\n  border-radius: 0.25rem;\n}\n.dropup .dropdown-menu {\n  margin-top: 0;\n  margin-bottom: 0.125rem;\n}\n.dropup .dropdown-toggle::after {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0.3em solid;\n  border-left: 0.3em solid transparent;\n}\n.dropup .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropright .dropdown-menu {\n  margin-top: 0;\n  margin-left: 0.125rem;\n}\n.dropright .dropdown-toggle::after {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid transparent;\n  border-bottom: 0.3em solid transparent;\n  border-left: 0.3em solid;\n}\n.dropright .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropright .dropdown-toggle::after {\n  vertical-align: 0;\n}\n.dropleft .dropdown-menu {\n  margin-top: 0;\n  margin-right: 0.125rem;\n}\n.dropleft .dropdown-toggle::after {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n}\n.dropleft .dropdown-toggle::after {\n  display: none;\n}\n.dropleft .dropdown-toggle::before {\n  display: inline-block;\n  width: 0;\n  height: 0;\n  margin-right: 0.255em;\n  vertical-align: 0.255em;\n  content: \"\";\n  border-top: 0.3em solid transparent;\n  border-right: 0.3em solid;\n  border-bottom: 0.3em solid transparent;\n}\n.dropleft .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropleft .dropdown-toggle::before {\n  vertical-align: 0;\n}\n.dropdown-divider {\n  height: 0;\n  margin: 0.5rem 0;\n  overflow: hidden;\n  border-top: 1px solid #e9ecef;\n}\n.dropdown-item {\n  display: block;\n  width: 100%;\n  padding: 0 25px;\n  clear: both;\n  font-weight: 400;\n  color: #fff;\n  text-align: inherit;\n  white-space: nowrap;\n  background-color: transparent;\n  border: 0;\n}\n.dropdown-item:hover, .dropdown-item:focus {\n    color: #fff;\n    text-decoration: none;\n    background-color: #161616;\n}\n.dropdown-item.active, .dropdown-item:active {\n    color: #fff;\n    text-decoration: none;\n    background-color: #161616;\n}\n.dropdown-item.disabled, .dropdown-item:disabled {\n    color: #6c757d;\n    background-color: transparent;\n}\n.dropdown-menu.show {\n  display: block;\n}\n.dropdown-header {\n  display: block;\n  padding: 0.5rem 25px;\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  color: #6c757d;\n  white-space: nowrap;\n}\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  vertical-align: middle;\n}\n.btn-group > .btn,\n  .btn-group-vertical > .btn {\n    position: relative;\n    -webkit-box-flex: 0;\n        -ms-flex: 0 1 auto;\n            flex: 0 1 auto;\n}\n.btn-group > .btn:hover,\n    .btn-group-vertical > .btn:hover {\n      z-index: 1;\n}\n.btn-group > .btn:focus, .btn-group > .btn:active, .btn-group > .btn.active,\n    .btn-group-vertical > .btn:focus,\n    .btn-group-vertical > .btn:active,\n    .btn-group-vertical > .btn.active {\n      z-index: 1;\n}\n.btn-group .btn + .btn,\n  .btn-group .btn + .btn-group,\n  .btn-group .btn-group + .btn,\n  .btn-group .btn-group + .btn-group,\n  .btn-group-vertical .btn + .btn,\n  .btn-group-vertical .btn + .btn-group,\n  .btn-group-vertical .btn-group + .btn,\n  .btn-group-vertical .btn-group + .btn-group {\n    margin-left: 0px;\n}\n.btn-toolbar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.btn-toolbar .input-group {\n    width: auto;\n}\n.btn-group > .btn:first-child {\n  margin-left: 0;\n}\n.btn-group > .btn:not(:last-child):not(.dropdown-toggle),\n.btn-group > .btn-group:not(:last-child) > .btn {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.btn-group > .btn:not(:first-child),\n.btn-group > .btn-group:not(:first-child) > .btn {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.dropdown-toggle-split {\n  padding-right: 2.925rem;\n  padding-left: 2.925rem;\n}\n.dropdown-toggle-split::after {\n    margin-left: 0;\n}\n.btn-sm + .dropdown-toggle-split, .btn-group-sm > .btn + .dropdown-toggle-split {\n  padding-right: 1.875rem;\n  padding-left: 1.875rem;\n}\n.btn-lg + .dropdown-toggle-split, .btn-group-lg > .btn + .dropdown-toggle-split {\n  padding-right: 0.75rem;\n  padding-left: 0.75rem;\n}\n.btn-group-vertical {\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n}\n.btn-group-vertical .btn,\n  .btn-group-vertical .btn-group {\n    width: 100%;\n}\n.btn-group-vertical > .btn + .btn,\n  .btn-group-vertical > .btn + .btn-group,\n  .btn-group-vertical > .btn-group + .btn,\n  .btn-group-vertical > .btn-group + .btn-group {\n    margin-top: 0px;\n    margin-left: 0;\n}\n.btn-group-vertical > .btn:not(:last-child):not(.dropdown-toggle),\n  .btn-group-vertical > .btn-group:not(:last-child) > .btn {\n    border-bottom-right-radius: 0;\n    border-bottom-left-radius: 0;\n}\n.btn-group-vertical > .btn:not(:first-child),\n  .btn-group-vertical > .btn-group:not(:first-child) > .btn {\n    border-top-left-radius: 0;\n    border-top-right-radius: 0;\n}\n.btn-group-toggle > .btn,\n.btn-group-toggle > .btn-group > .btn {\n  margin-bottom: 0;\n}\n.btn-group-toggle > .btn input[type=\"radio\"],\n  .btn-group-toggle > .btn input[type=\"checkbox\"],\n  .btn-group-toggle > .btn-group > .btn input[type=\"radio\"],\n  .btn-group-toggle > .btn-group > .btn input[type=\"checkbox\"] {\n    position: absolute;\n    clip: rect(0, 0, 0, 0);\n    pointer-events: none;\n}\n.input-group {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-align: stretch;\n      -ms-flex-align: stretch;\n          align-items: stretch;\n  width: 100%;\n}\n.input-group > .form-control,\n  .input-group > .custom-select,\n  .input-group > .custom-file {\n    position: relative;\n    -webkit-box-flex: 1;\n        -ms-flex: 1 1 auto;\n            flex: 1 1 auto;\n    width: 1%;\n    margin-bottom: 0;\n}\n.input-group > .form-control:focus,\n    .input-group > .custom-select:focus,\n    .input-group > .custom-file:focus {\n      z-index: 3;\n}\n.input-group > .form-control + .form-control,\n    .input-group > .form-control + .custom-select,\n    .input-group > .form-control + .custom-file,\n    .input-group > .custom-select + .form-control,\n    .input-group > .custom-select + .custom-select,\n    .input-group > .custom-select + .custom-file,\n    .input-group > .custom-file + .form-control,\n    .input-group > .custom-file + .custom-select,\n    .input-group > .custom-file + .custom-file {\n      margin-left: 0px;\n}\n.input-group > .form-control:not(:last-child),\n  .input-group > .custom-select:not(:last-child) {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n}\n.input-group > .form-control:not(:first-child),\n  .input-group > .custom-select:not(:first-child) {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n}\n.input-group > .custom-file {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n}\n.input-group > .custom-file:not(:last-child) .custom-file-label,\n    .input-group > .custom-file:not(:last-child) .custom-file-label::before {\n      border-top-right-radius: 0;\n      border-bottom-right-radius: 0;\n}\n.input-group > .custom-file:not(:first-child) .custom-file-label,\n    .input-group > .custom-file:not(:first-child) .custom-file-label::before {\n      border-top-left-radius: 0;\n      border-bottom-left-radius: 0;\n}\n.input-group-prepend,\n.input-group-append {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n}\n.input-group-prepend .btn,\n  .input-group-append .btn {\n    position: relative;\n    z-index: 2;\n}\n.input-group-prepend .btn + .btn,\n  .input-group-prepend .btn + .input-group-text,\n  .input-group-prepend .input-group-text + .input-group-text,\n  .input-group-prepend .input-group-text + .btn,\n  .input-group-append .btn + .btn,\n  .input-group-append .btn + .input-group-text,\n  .input-group-append .input-group-text + .input-group-text,\n  .input-group-append .input-group-text + .btn {\n    margin-left: 0px;\n}\n.input-group-prepend {\n  margin-right: 0px;\n}\n.input-group-append {\n  margin-left: 0px;\n}\n.input-group-text {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  padding: 0.375rem 0.75rem;\n  margin-bottom: 0;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: #495057;\n  text-align: center;\n  white-space: nowrap;\n  background-color: #e9ecef;\n  border: 0px solid #ddd;\n  border-radius: 0.25rem;\n}\n.input-group-text input[type=\"radio\"],\n  .input-group-text input[type=\"checkbox\"] {\n    margin-top: 0;\n}\n.input-group > .input-group-prepend > .btn,\n.input-group > .input-group-prepend > .input-group-text,\n.input-group > .input-group-append:not(:last-child) > .btn,\n.input-group > .input-group-append:not(:last-child) > .input-group-text,\n.input-group > .input-group-append:last-child > .btn:not(:last-child):not(.dropdown-toggle),\n.input-group > .input-group-append:last-child > .input-group-text:not(:last-child) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.input-group > .input-group-append > .btn,\n.input-group > .input-group-append > .input-group-text,\n.input-group > .input-group-prepend:not(:first-child) > .btn,\n.input-group > .input-group-prepend:not(:first-child) > .input-group-text,\n.input-group > .input-group-prepend:first-child > .btn:not(:first-child),\n.input-group > .input-group-prepend:first-child > .input-group-text:not(:first-child) {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.custom-control {\n  position: relative;\n  display: block;\n  min-height: 1.5rem;\n  padding-left: 1.5rem;\n}\n.custom-control-inline {\n  display: -webkit-inline-box;\n  display: -ms-inline-flexbox;\n  display: inline-flex;\n  margin-right: 1rem;\n}\n.custom-control-input {\n  position: absolute;\n  z-index: -1;\n  opacity: 0;\n}\n.custom-control-input:checked ~ .custom-control-label::before {\n    color: #fff;\n    background-color: #f7c980;\n}\n.custom-control-input:focus ~ .custom-control-label::before {\n    -webkit-box-shadow: 0 0 0 1px #eee, 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n            box-shadow: 0 0 0 1px #eee, 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n}\n.custom-control-input:active ~ .custom-control-label::before {\n    color: #fff;\n    background-color: white;\n}\n.custom-control-input:disabled ~ .custom-control-label {\n    color: #6c757d;\n}\n.custom-control-input:disabled ~ .custom-control-label::before {\n      background-color: #e9ecef;\n}\n.custom-control-label {\n  margin-bottom: 0;\n}\n.custom-control-label::before {\n    position: absolute;\n    top: 0.25rem;\n    left: 0;\n    display: block;\n    width: 1rem;\n    height: 1rem;\n    pointer-events: none;\n    content: \"\";\n    -webkit-user-select: none;\n       -moz-user-select: none;\n        -ms-user-select: none;\n            user-select: none;\n    background-color: #dee2e6;\n}\n.custom-control-label::after {\n    position: absolute;\n    top: 0.25rem;\n    left: 0;\n    display: block;\n    width: 1rem;\n    height: 1rem;\n    content: \"\";\n    background-repeat: no-repeat;\n    background-position: center center;\n    background-size: 50% 50%;\n}\n.custom-checkbox .custom-control-label::before {\n  border-radius: 0.25rem;\n}\n.custom-checkbox .custom-control-input:checked ~ .custom-control-label::before {\n  background-color: #f7c980;\n}\n.custom-checkbox .custom-control-input:checked ~ .custom-control-label::after {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 8'%3E%3Cpath fill='%23fff' d='M6.564.75l-3.59 3.612-1.538-1.55L0 4.26 2.974 7.25 8 2.193z'/%3E%3C/svg%3E\");\n}\n.custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::before {\n  background-color: #f7c980;\n}\n.custom-checkbox .custom-control-input:indeterminate ~ .custom-control-label::after {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 4'%3E%3Cpath stroke='%23fff' d='M0 2h4'/%3E%3C/svg%3E\");\n}\n.custom-checkbox .custom-control-input:disabled:checked ~ .custom-control-label::before {\n  background-color: rgba(247, 201, 128, 0.5);\n}\n.custom-checkbox .custom-control-input:disabled:indeterminate ~ .custom-control-label::before {\n  background-color: rgba(247, 201, 128, 0.5);\n}\n.custom-radio .custom-control-label::before {\n  border-radius: 50%;\n}\n.custom-radio .custom-control-input:checked ~ .custom-control-label::before {\n  background-color: #f7c980;\n}\n.custom-radio .custom-control-input:checked ~ .custom-control-label::after {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-4 -4 8 8'%3E%3Ccircle r='3' fill='%23fff'/%3E%3C/svg%3E\");\n}\n.custom-radio .custom-control-input:disabled:checked ~ .custom-control-label::before {\n  background-color: rgba(247, 201, 128, 0.5);\n}\n.custom-select {\n  display: inline-block;\n  width: 100%;\n  height: calc(2.25rem + 0px);\n  padding: 0.375rem 1.75rem 0.375rem 0.75rem;\n  line-height: 1.5;\n  color: #495057;\n  vertical-align: middle;\n  background: #fff url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3E%3Cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3E%3C/svg%3E\") no-repeat right 0.75rem center;\n  background-size: 8px 10px;\n  border: 0px solid #ddd;\n  border-radius: 0.25rem;\n  -webkit-appearance: none;\n     -moz-appearance: none;\n          appearance: none;\n}\n.custom-select:focus {\n    border-color: #fffcf8;\n    outline: 0;\n    -webkit-box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 5px rgba(255, 252, 248, 0.5);\n            box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.075), 0 0 5px rgba(255, 252, 248, 0.5);\n}\n.custom-select:focus::-ms-value {\n      color: #495057;\n      background-color: #fff;\n}\n.custom-select[multiple], .custom-select[size]:not([size=\"1\"]) {\n    height: auto;\n    padding-right: 0.75rem;\n    background-image: none;\n}\n.custom-select:disabled {\n    color: #6c757d;\n    background-color: #e9ecef;\n}\n.custom-select::-ms-expand {\n    opacity: 0;\n}\n.custom-select-sm {\n  height: calc(1.8125rem + 0px);\n  padding-top: 0.375rem;\n  padding-bottom: 0.375rem;\n  font-size: 75%;\n}\n.custom-select-lg {\n  height: calc(2.875rem + 0px);\n  padding-top: 0.375rem;\n  padding-bottom: 0.375rem;\n  font-size: 125%;\n}\n.custom-file {\n  position: relative;\n  display: inline-block;\n  width: 100%;\n  height: calc(2.25rem + 0px);\n  margin-bottom: 0;\n}\n.custom-file-input {\n  position: relative;\n  z-index: 2;\n  width: 100%;\n  height: calc(2.25rem + 0px);\n  margin: 0;\n  opacity: 0;\n}\n.custom-file-input:focus ~ .custom-file-control {\n    border-color: #fffcf8;\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n}\n.custom-file-input:focus ~ .custom-file-control::before {\n      border-color: #fffcf8;\n}\n.custom-file-input:lang(en) ~ .custom-file-label::after {\n    content: \"Browse\";\n}\n.custom-file-label {\n  position: absolute;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 1;\n  height: calc(2.25rem + 0px);\n  padding: 0.375rem 0.75rem;\n  line-height: 1.5;\n  color: #495057;\n  background-color: #fff;\n  border: 0px solid #ddd;\n  border-radius: 0.25rem;\n}\n.custom-file-label::after {\n    position: absolute;\n    top: 0;\n    right: 0;\n    bottom: 0;\n    z-index: 3;\n    display: block;\n    height: calc(calc(2.25rem + 0px) - 0px * 2);\n    padding: 0.375rem 0.75rem;\n    line-height: 1.5;\n    color: #495057;\n    content: \"Browse\";\n    background-color: #e9ecef;\n    border-left: 0px solid #ddd;\n    border-radius: 0 0.25rem 0.25rem 0;\n}\n.nav {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.nav-link {\n  display: block;\n  padding: 0.5rem 1rem;\n}\n.nav-link:hover, .nav-link:focus {\n    text-decoration: none;\n}\n.nav-link.disabled {\n    color: #6c757d;\n}\n.nav-tabs {\n  border-bottom: 1px solid #dee2e6;\n}\n.nav-tabs .nav-item {\n    margin-bottom: -1px;\n}\n.nav-tabs .nav-link {\n    border: 1px solid transparent;\n    border-top-left-radius: 0.25rem;\n    border-top-right-radius: 0.25rem;\n}\n.nav-tabs .nav-link:hover, .nav-tabs .nav-link:focus {\n      border-color: #e9ecef #e9ecef #dee2e6;\n}\n.nav-tabs .nav-link.disabled {\n      color: #6c757d;\n      background-color: transparent;\n      border-color: transparent;\n}\n.nav-tabs .nav-link.active,\n  .nav-tabs .nav-item.show .nav-link {\n    color: #495057;\n    background-color: #eee;\n    border-color: #dee2e6 #dee2e6 #eee;\n}\n.nav-tabs .dropdown-menu {\n    margin-top: -1px;\n    border-top-left-radius: 0;\n    border-top-right-radius: 0;\n}\n.nav-pills .nav-link {\n  border-radius: 0.25rem;\n}\n.nav-pills .nav-link.active,\n.nav-pills .show > .nav-link {\n  color: #fff;\n  background-color: #f7c980;\n}\n.nav-fill .nav-item {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  text-align: center;\n}\n.nav-justified .nav-item {\n  -ms-flex-preferred-size: 0;\n      flex-basis: 0;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  text-align: center;\n}\n.tab-content > .tab-pane {\n  display: none;\n}\n.tab-content > .active {\n  display: block;\n}\n.navbar {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  padding: 0.5rem 1rem;\n}\n.navbar > .container,\n  .navbar > .container-fluid {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    -webkit-box-pack: justify;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n}\n.navbar-brand {\n  display: inline-block;\n  padding-top: 0.3125rem;\n  padding-bottom: 0.3125rem;\n  margin-right: 1rem;\n  font-size: 1.25rem;\n  line-height: inherit;\n  white-space: nowrap;\n}\n.navbar-brand:hover, .navbar-brand:focus {\n    text-decoration: none;\n}\n.navbar-nav {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.navbar-nav .nav-link {\n    padding-right: 0;\n    padding-left: 0;\n}\n.navbar-nav .dropdown-menu {\n    position: static;\n    float: none;\n}\n.navbar-text {\n  display: inline-block;\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n}\n.navbar-collapse {\n  -ms-flex-preferred-size: 100%;\n      flex-basis: 100%;\n  -webkit-box-flex: 1;\n      -ms-flex-positive: 1;\n          flex-grow: 1;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.navbar-toggler {\n  padding: 0.25rem 0.75rem;\n  font-size: 1.25rem;\n  line-height: 1;\n  background-color: transparent;\n  border: 1px solid transparent;\n  border-radius: 1.875rem;\n}\n.navbar-toggler:hover, .navbar-toggler:focus {\n    text-decoration: none;\n}\n.navbar-toggler:not(:disabled):not(.disabled) {\n    cursor: pointer;\n}\n.navbar-toggler-icon {\n  display: inline-block;\n  width: 1.5em;\n  height: 1.5em;\n  vertical-align: middle;\n  content: \"\";\n  background: no-repeat center center;\n  background-size: 100% 100%;\n}\n@media (max-width: 575.98px) {\n.navbar-expand-sm > .container,\n  .navbar-expand-sm > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 576px) {\n.navbar-expand-sm {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-flow: row nowrap;\n            flex-flow: row nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-sm .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-sm .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-sm .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-sm .navbar-nav .nav-link {\n        padding-right: 0.5rem;\n        padding-left: 0.5rem;\n}\n.navbar-expand-sm > .container,\n    .navbar-expand-sm > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-sm .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n      -ms-flex-preferred-size: auto;\n          flex-basis: auto;\n}\n.navbar-expand-sm .navbar-toggler {\n      display: none;\n}\n.navbar-expand-sm .dropup .dropdown-menu {\n      top: auto;\n      bottom: 100%;\n}\n}\n@media (max-width: 767.98px) {\n.navbar-expand-md > .container,\n  .navbar-expand-md > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 768px) {\n.navbar-expand-md {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-flow: row nowrap;\n            flex-flow: row nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-md .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-md .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-md .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-md .navbar-nav .nav-link {\n        padding-right: 0.5rem;\n        padding-left: 0.5rem;\n}\n.navbar-expand-md > .container,\n    .navbar-expand-md > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-md .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n      -ms-flex-preferred-size: auto;\n          flex-basis: auto;\n}\n.navbar-expand-md .navbar-toggler {\n      display: none;\n}\n.navbar-expand-md .dropup .dropdown-menu {\n      top: auto;\n      bottom: 100%;\n}\n}\n@media (max-width: 991.98px) {\n.navbar-expand-lg > .container,\n  .navbar-expand-lg > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 992px) {\n.navbar-expand-lg {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-flow: row nowrap;\n            flex-flow: row nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-lg .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-lg .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-lg .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-lg .navbar-nav .nav-link {\n        padding-right: 0.5rem;\n        padding-left: 0.5rem;\n}\n.navbar-expand-lg > .container,\n    .navbar-expand-lg > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-lg .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n      -ms-flex-preferred-size: auto;\n          flex-basis: auto;\n}\n.navbar-expand-lg .navbar-toggler {\n      display: none;\n}\n.navbar-expand-lg .dropup .dropdown-menu {\n      top: auto;\n      bottom: 100%;\n}\n}\n@media (max-width: 1199.98px) {\n.navbar-expand-xl > .container,\n  .navbar-expand-xl > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n}\n@media (min-width: 1200px) {\n.navbar-expand-xl {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-flow: row nowrap;\n            flex-flow: row nowrap;\n    -webkit-box-pack: start;\n        -ms-flex-pack: start;\n            justify-content: flex-start;\n}\n.navbar-expand-xl .navbar-nav {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.navbar-expand-xl .navbar-nav .dropdown-menu {\n        position: absolute;\n}\n.navbar-expand-xl .navbar-nav .dropdown-menu-right {\n        right: 0;\n        left: auto;\n}\n.navbar-expand-xl .navbar-nav .nav-link {\n        padding-right: 0.5rem;\n        padding-left: 0.5rem;\n}\n.navbar-expand-xl > .container,\n    .navbar-expand-xl > .container-fluid {\n      -ms-flex-wrap: nowrap;\n          flex-wrap: nowrap;\n}\n.navbar-expand-xl .navbar-collapse {\n      display: -webkit-box !important;\n      display: -ms-flexbox !important;\n      display: flex !important;\n      -ms-flex-preferred-size: auto;\n          flex-basis: auto;\n}\n.navbar-expand-xl .navbar-toggler {\n      display: none;\n}\n.navbar-expand-xl .dropup .dropdown-menu {\n      top: auto;\n      bottom: 100%;\n}\n}\n.navbar-expand {\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-flow: row nowrap;\n          flex-flow: row nowrap;\n  -webkit-box-pack: start;\n      -ms-flex-pack: start;\n          justify-content: flex-start;\n}\n.navbar-expand > .container,\n  .navbar-expand > .container-fluid {\n    padding-right: 0;\n    padding-left: 0;\n}\n.navbar-expand .navbar-nav {\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n}\n.navbar-expand .navbar-nav .dropdown-menu {\n      position: absolute;\n}\n.navbar-expand .navbar-nav .dropdown-menu-right {\n      right: 0;\n      left: auto;\n}\n.navbar-expand .navbar-nav .nav-link {\n      padding-right: 0.5rem;\n      padding-left: 0.5rem;\n}\n.navbar-expand > .container,\n  .navbar-expand > .container-fluid {\n    -ms-flex-wrap: nowrap;\n        flex-wrap: nowrap;\n}\n.navbar-expand .navbar-collapse {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n    -ms-flex-preferred-size: auto;\n        flex-basis: auto;\n}\n.navbar-expand .navbar-toggler {\n    display: none;\n}\n.navbar-expand .dropup .dropdown-menu {\n    top: auto;\n    bottom: 100%;\n}\n.navbar-light .navbar-brand {\n  color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-brand:hover, .navbar-light .navbar-brand:focus {\n    color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-nav .nav-link {\n  color: rgba(0, 0, 0, 0.5);\n}\n.navbar-light .navbar-nav .nav-link:hover, .navbar-light .navbar-nav .nav-link:focus {\n    color: rgba(0, 0, 0, 0.7);\n}\n.navbar-light .navbar-nav .nav-link.disabled {\n    color: rgba(0, 0, 0, 0.3);\n}\n.navbar-light .navbar-nav .show > .nav-link,\n.navbar-light .navbar-nav .active > .nav-link,\n.navbar-light .navbar-nav .nav-link.show,\n.navbar-light .navbar-nav .nav-link.active {\n  color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-toggler {\n  color: rgba(0, 0, 0, 0.5);\n  border-color: rgba(0, 0, 0, 0.1);\n}\n.navbar-light .navbar-toggler-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(0, 0, 0, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\");\n}\n.navbar-light .navbar-text {\n  color: rgba(0, 0, 0, 0.5);\n}\n.navbar-light .navbar-text a {\n    color: rgba(0, 0, 0, 0.9);\n}\n.navbar-light .navbar-text a:hover, .navbar-light .navbar-text a:focus {\n      color: rgba(0, 0, 0, 0.9);\n}\n.navbar-dark .navbar-brand {\n  color: #fff;\n}\n.navbar-dark .navbar-brand:hover, .navbar-dark .navbar-brand:focus {\n    color: #fff;\n}\n.navbar-dark .navbar-nav .nav-link {\n  color: rgba(255, 255, 255, 0.5);\n}\n.navbar-dark .navbar-nav .nav-link:hover, .navbar-dark .navbar-nav .nav-link:focus {\n    color: rgba(255, 255, 255, 0.75);\n}\n.navbar-dark .navbar-nav .nav-link.disabled {\n    color: rgba(255, 255, 255, 0.25);\n}\n.navbar-dark .navbar-nav .show > .nav-link,\n.navbar-dark .navbar-nav .active > .nav-link,\n.navbar-dark .navbar-nav .nav-link.show,\n.navbar-dark .navbar-nav .nav-link.active {\n  color: #fff;\n}\n.navbar-dark .navbar-toggler {\n  color: rgba(255, 255, 255, 0.5);\n  border-color: rgba(255, 255, 255, 0.1);\n}\n.navbar-dark .navbar-toggler-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 30 30' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255, 255, 255, 0.5)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 7h22M4 15h22M4 23h22'/%3E%3C/svg%3E\");\n}\n.navbar-dark .navbar-text {\n  color: rgba(255, 255, 255, 0.5);\n}\n.navbar-dark .navbar-text a {\n    color: #fff;\n}\n.navbar-dark .navbar-text a:hover, .navbar-dark .navbar-text a:focus {\n      color: #fff;\n}\n.card {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  min-width: 0;\n  word-wrap: break-word;\n  background-color: #fff;\n  background-clip: border-box;\n  border: 1px solid rgba(0, 0, 0, 0.125);\n  border-radius: 0.25rem;\n}\n.card > hr {\n    margin-right: 0;\n    margin-left: 0;\n}\n.card > .list-group:first-child .list-group-item:first-child {\n    border-top-left-radius: 0.25rem;\n    border-top-right-radius: 0.25rem;\n}\n.card > .list-group:last-child .list-group-item:last-child {\n    border-bottom-right-radius: 0.25rem;\n    border-bottom-left-radius: 0.25rem;\n}\n.card-body {\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  padding: 1.25rem;\n}\n.card-title {\n  margin-bottom: 0.75rem;\n}\n.card-subtitle {\n  margin-top: -0.375rem;\n  margin-bottom: 0;\n}\n.card-text:last-child {\n  margin-bottom: 0;\n}\n.card-link:hover {\n  text-decoration: none;\n}\n.card-link + .card-link {\n  margin-left: 1.25rem;\n}\n.card-header {\n  padding: 0.75rem 1.25rem;\n  margin-bottom: 0;\n  background-color: rgba(0, 0, 0, 0.03);\n  border-bottom: 1px solid rgba(0, 0, 0, 0.125);\n}\n.card-header:first-child {\n    border-radius: calc(0.25rem - 1px) calc(0.25rem - 1px) 0 0;\n}\n.card-header + .list-group .list-group-item:first-child {\n    border-top: 0;\n}\n.card-footer {\n  padding: 0.75rem 1.25rem;\n  background-color: rgba(0, 0, 0, 0.03);\n  border-top: 1px solid rgba(0, 0, 0, 0.125);\n}\n.card-footer:last-child {\n    border-radius: 0 0 calc(0.25rem - 1px) calc(0.25rem - 1px);\n}\n.card-header-tabs {\n  margin-right: -0.625rem;\n  margin-bottom: -0.75rem;\n  margin-left: -0.625rem;\n  border-bottom: 0;\n}\n.card-header-pills {\n  margin-right: -0.625rem;\n  margin-left: -0.625rem;\n}\n.card-img-overlay {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  padding: 1.25rem;\n}\n.card-img {\n  width: 100%;\n  border-radius: calc(0.25rem - 1px);\n}\n.card-img-top {\n  width: 100%;\n  border-top-left-radius: calc(0.25rem - 1px);\n  border-top-right-radius: calc(0.25rem - 1px);\n}\n.card-img-bottom {\n  width: 100%;\n  border-bottom-right-radius: calc(0.25rem - 1px);\n  border-bottom-left-radius: calc(0.25rem - 1px);\n}\n.card-deck {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n}\n.card-deck .card {\n    margin-bottom: 15px;\n}\n@media (min-width: 576px) {\n.card-deck {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-flow: row wrap;\n              flex-flow: row wrap;\n      margin-right: -15px;\n      margin-left: -15px;\n}\n.card-deck .card {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n        -webkit-box-flex: 1;\n            -ms-flex: 1 0 0%;\n                flex: 1 0 0%;\n        -webkit-box-orient: vertical;\n        -webkit-box-direction: normal;\n            -ms-flex-direction: column;\n                flex-direction: column;\n        margin-right: 15px;\n        margin-bottom: 0;\n        margin-left: 15px;\n}\n}\n.card-group {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n}\n.card-group > .card {\n    margin-bottom: 15px;\n}\n@media (min-width: 576px) {\n.card-group {\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-flow: row wrap;\n              flex-flow: row wrap;\n}\n.card-group > .card {\n        -webkit-box-flex: 1;\n            -ms-flex: 1 0 0%;\n                flex: 1 0 0%;\n        margin-bottom: 0;\n}\n.card-group > .card + .card {\n          margin-left: 0;\n          border-left: 0;\n}\n.card-group > .card:first-child {\n          border-top-right-radius: 0;\n          border-bottom-right-radius: 0;\n}\n.card-group > .card:first-child .card-img-top,\n          .card-group > .card:first-child .card-header {\n            border-top-right-radius: 0;\n}\n.card-group > .card:first-child .card-img-bottom,\n          .card-group > .card:first-child .card-footer {\n            border-bottom-right-radius: 0;\n}\n.card-group > .card:last-child {\n          border-top-left-radius: 0;\n          border-bottom-left-radius: 0;\n}\n.card-group > .card:last-child .card-img-top,\n          .card-group > .card:last-child .card-header {\n            border-top-left-radius: 0;\n}\n.card-group > .card:last-child .card-img-bottom,\n          .card-group > .card:last-child .card-footer {\n            border-bottom-left-radius: 0;\n}\n.card-group > .card:only-child {\n          border-radius: 0.25rem;\n}\n.card-group > .card:only-child .card-img-top,\n          .card-group > .card:only-child .card-header {\n            border-top-left-radius: 0.25rem;\n            border-top-right-radius: 0.25rem;\n}\n.card-group > .card:only-child .card-img-bottom,\n          .card-group > .card:only-child .card-footer {\n            border-bottom-right-radius: 0.25rem;\n            border-bottom-left-radius: 0.25rem;\n}\n.card-group > .card:not(:first-child):not(:last-child):not(:only-child) {\n          border-radius: 0;\n}\n.card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-img-top,\n          .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-img-bottom,\n          .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-header,\n          .card-group > .card:not(:first-child):not(:last-child):not(:only-child) .card-footer {\n            border-radius: 0;\n}\n}\n.card-columns .card {\n  margin-bottom: 0.75rem;\n}\n@media (min-width: 576px) {\n.card-columns {\n    -webkit-column-count: 3;\n            column-count: 3;\n    -webkit-column-gap: 1.25rem;\n            column-gap: 1.25rem;\n}\n.card-columns .card {\n      display: inline-block;\n      width: 100%;\n}\n}\n.breadcrumb {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -ms-flex-wrap: wrap;\n      flex-wrap: wrap;\n  padding: 0.75rem 1rem;\n  margin-bottom: 1rem;\n  list-style: none;\n  background-color: #e9ecef;\n  border-radius: 0.25rem;\n}\n.breadcrumb-item + .breadcrumb-item::before {\n  display: inline-block;\n  padding-right: 0.5rem;\n  padding-left: 0.5rem;\n  color: #6c757d;\n  content: \"/\";\n}\n.breadcrumb-item + .breadcrumb-item:hover::before {\n  text-decoration: underline;\n}\n.breadcrumb-item + .breadcrumb-item:hover::before {\n  text-decoration: none;\n}\n.breadcrumb-item.active {\n  color: #6c757d;\n}\n.pagination {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  padding-left: 0;\n  list-style: none;\n  border-radius: 0.25rem;\n}\n.page-link {\n  position: relative;\n  display: block;\n  padding: 0.5rem 0.75rem;\n  margin-left: -1px;\n  line-height: 1.25;\n  color: #f7c980;\n  background-color: #fff;\n  border: 1px solid #dee2e6;\n}\n.page-link:hover {\n    color: #faddb0;\n    text-decoration: none;\n    background-color: #e9ecef;\n    border-color: #dee2e6;\n}\n.page-link:focus {\n    z-index: 2;\n    outline: 0;\n    -webkit-box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n            box-shadow: 0 0 0 0.2rem rgba(247, 201, 128, 0.25);\n}\n.page-link:not(:disabled):not(.disabled) {\n    cursor: pointer;\n}\n.page-item:first-child .page-link {\n  margin-left: 0;\n  border-top-left-radius: 0.25rem;\n  border-bottom-left-radius: 0.25rem;\n}\n.page-item:last-child .page-link {\n  border-top-right-radius: 0.25rem;\n  border-bottom-right-radius: 0.25rem;\n}\n.page-item.active .page-link {\n  z-index: 1;\n  color: #fff;\n  background-color: #f7c980;\n  border-color: #f7c980;\n}\n.page-item.disabled .page-link {\n  color: #6c757d;\n  pointer-events: none;\n  cursor: auto;\n  background-color: #fff;\n  border-color: #dee2e6;\n}\n.pagination-lg .page-link {\n  padding: 0.75rem 1.5rem;\n  font-size: 1.25rem;\n  line-height: 1.5;\n}\n.pagination-lg .page-item:first-child .page-link {\n  border-top-left-radius: 0.3rem;\n  border-bottom-left-radius: 0.3rem;\n}\n.pagination-lg .page-item:last-child .page-link {\n  border-top-right-radius: 0.3rem;\n  border-bottom-right-radius: 0.3rem;\n}\n.pagination-sm .page-link {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  line-height: 1.5;\n}\n.pagination-sm .page-item:first-child .page-link {\n  border-top-left-radius: 0.2rem;\n  border-bottom-left-radius: 0.2rem;\n}\n.pagination-sm .page-item:last-child .page-link {\n  border-top-right-radius: 0.2rem;\n  border-bottom-right-radius: 0.2rem;\n}\n.badge {\n  display: inline-block;\n  padding: 0.28rem 0.4em;\n  font-size: 0.7rem;\n  font-weight: 700;\n  line-height: 1;\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: 0.25rem;\n}\n.badge:empty {\n    display: none;\n}\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n.badge-pill {\n  padding-right: 0.6em;\n  padding-left: 0.6em;\n  border-radius: 10rem;\n}\n.badge-primary {\n  color: #212529;\n  background-color: #f7c980;\n}\n.badge-primary[href]:hover, .badge-primary[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: #f4b550;\n}\n.badge-secondary {\n  color: #212529;\n  background-color: #fff;\n}\n.badge-secondary[href]:hover, .badge-secondary[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: #e6e6e6;\n}\n.badge-success {\n  color: #212529;\n  background-color: #c8f9c5;\n}\n.badge-success[href]:hover, .badge-success[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: #9cf497;\n}\n.badge-info {\n  color: #212529;\n  background-color: #4ab2e3;\n}\n.badge-info[href]:hover, .badge-info[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: #219ed9;\n}\n.badge-warning {\n  color: #212529;\n  background-color: #f7c980;\n}\n.badge-warning[href]:hover, .badge-warning[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: #f4b550;\n}\n.badge-danger {\n  color: #fff;\n  background-color: #e34a4a;\n}\n.badge-danger[href]:hover, .badge-danger[href]:focus {\n    color: #fff;\n    text-decoration: none;\n    background-color: #d92121;\n}\n.badge-light {\n  color: #212529;\n  background-color: #eff4f5;\n}\n.badge-light[href]:hover, .badge-light[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: #d0dee1;\n}\n.badge-dark {\n  color: #fff;\n  background-color: #161616;\n}\n.badge-dark[href]:hover, .badge-dark[href]:focus {\n    color: #fff;\n    text-decoration: none;\n    background-color: black;\n}\n.badge-pale {\n  color: #212529;\n  background-color: #d9d9d9;\n}\n.badge-pale[href]:hover, .badge-pale[href]:focus {\n    color: #212529;\n    text-decoration: none;\n    background-color: silver;\n}\n.jumbotron {\n  padding: 2rem 1rem;\n  margin-bottom: 2rem;\n  background-color: #e9ecef;\n  border-radius: 0.3rem;\n}\n@media (min-width: 576px) {\n.jumbotron {\n      padding: 4rem 2rem;\n}\n}\n.jumbotron-fluid {\n  padding-right: 0;\n  padding-left: 0;\n  border-radius: 0;\n}\n.alert {\n  position: relative;\n  padding: 0.75rem 1.25rem;\n  margin-bottom: 1.875rem;\n  border: 0 solid transparent;\n  border-radius: 0;\n}\n.alert-heading {\n  color: inherit;\n}\n.alert-link {\n  font-weight: 700;\n}\n.alert-dismissible {\n  padding-right: 4rem;\n}\n.alert-dismissible .close {\n    position: absolute;\n    top: 0;\n    right: 0;\n    padding: 0.75rem 1.25rem;\n    color: inherit;\n}\n.alert-primary {\n  color: #806943;\n  background-color: #fdf4e6;\n  border-color: #fdf0db;\n}\n.alert-primary hr {\n    border-top-color: #fce6c3;\n}\n.alert-primary .alert-link {\n    color: #5f4e31;\n}\n.alert-secondary {\n  color: #858585;\n  background-color: white;\n  border-color: white;\n}\n.alert-secondary hr {\n    border-top-color: #f2f2f2;\n}\n.alert-secondary .alert-link {\n    color: #6c6c6c;\n}\n.alert-success {\n  color: #688166;\n  background-color: #f4fef3;\n  border-color: #f0fdef;\n}\n.alert-success hr {\n    border-top-color: #dbfad8;\n}\n.alert-success .alert-link {\n    color: #51654f;\n}\n.alert-info {\n  color: #265d76;\n  background-color: #dbf0f9;\n  border-color: #cce9f7;\n}\n.alert-info hr {\n    border-top-color: #b6dff4;\n}\n.alert-info .alert-link {\n    color: #1a3f4f;\n}\n.alert-warning {\n  color: #806943;\n  background-color: #fdf4e6;\n  border-color: #fdf0db;\n}\n.alert-warning hr {\n    border-top-color: #fce6c3;\n}\n.alert-warning .alert-link {\n    color: #5f4e31;\n}\n.alert-danger {\n  color: #762626;\n  background-color: #f9dbdb;\n  border-color: #f7cccc;\n}\n.alert-danger hr {\n    border-top-color: #f4b6b6;\n}\n.alert-danger .alert-link {\n    color: #4f1a1a;\n}\n.alert-light {\n  color: #7c7f7f;\n  background-color: #fcfdfd;\n  border-color: #fbfcfc;\n}\n.alert-light hr {\n    border-top-color: #ecf1f1;\n}\n.alert-light .alert-link {\n    color: #636565;\n}\n.alert-dark {\n  color: #0b0b0b;\n  background-color: #d0d0d0;\n  border-color: #bebebe;\n}\n.alert-dark hr {\n    border-top-color: #b1b1b1;\n}\n.alert-dark .alert-link {\n    color: black;\n}\n.alert-pale {\n  color: #717171;\n  background-color: #f7f7f7;\n  border-color: #f4f4f4;\n}\n.alert-pale hr {\n    border-top-color: #e7e7e7;\n}\n.alert-pale .alert-link {\n    color: #585858;\n}\n@-webkit-keyframes progress-bar-stripes {\nfrom {\n    background-position: 1rem 0;\n}\nto {\n    background-position: 0 0;\n}\n}\n@keyframes progress-bar-stripes {\nfrom {\n    background-position: 1rem 0;\n}\nto {\n    background-position: 0 0;\n}\n}\n.progress {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  height: 1rem;\n  overflow: hidden;\n  font-size: 0.75rem;\n  background-color: #e9ecef;\n  border-radius: 0.25rem;\n}\n.progress-bar {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  color: #fff;\n  text-align: center;\n  background-color: #f7c980;\n  -webkit-transition: width 0.6s ease;\n  transition: width 0.6s ease;\n}\n.progress-bar-striped {\n  background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);\n  background-size: 1rem 1rem;\n}\n.progress-bar-animated {\n  -webkit-animation: progress-bar-stripes 1s linear infinite;\n          animation: progress-bar-stripes 1s linear infinite;\n}\n.media {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n}\n.media-body {\n  -webkit-box-flex: 1;\n      -ms-flex: 1;\n          flex: 1;\n}\n.list-group {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n}\n.list-group-item-action {\n  width: 100%;\n  color: #495057;\n  text-align: inherit;\n}\n.list-group-item-action:hover, .list-group-item-action:focus {\n    color: #495057;\n    text-decoration: none;\n    background-color: #f8f9fa;\n}\n.list-group-item-action:active {\n    color: #34495e;\n    background-color: #e9ecef;\n}\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: 0.75rem 1.25rem;\n  margin-bottom: -1px;\n  background-color: #fff;\n  border: 1px solid rgba(0, 0, 0, 0.125);\n}\n.list-group-item:first-child {\n    border-top-left-radius: 0.25rem;\n    border-top-right-radius: 0.25rem;\n}\n.list-group-item:last-child {\n    margin-bottom: 0;\n    border-bottom-right-radius: 0.25rem;\n    border-bottom-left-radius: 0.25rem;\n}\n.list-group-item:hover, .list-group-item:focus {\n    z-index: 1;\n    text-decoration: none;\n}\n.list-group-item.disabled, .list-group-item:disabled {\n    color: #6c757d;\n    background-color: #fff;\n}\n.list-group-item.active {\n    z-index: 2;\n    color: #fff;\n    background-color: #f7c980;\n    border-color: #f7c980;\n}\n.list-group-flush .list-group-item {\n  border-right: 0;\n  border-left: 0;\n  border-radius: 0;\n}\n.list-group-flush:first-child .list-group-item:first-child {\n  border-top: 0;\n}\n.list-group-flush:last-child .list-group-item:last-child {\n  border-bottom: 0;\n}\n.list-group-item-primary {\n  color: #806943;\n  background-color: #fdf0db;\n}\n.list-group-item-primary.list-group-item-action:hover, .list-group-item-primary.list-group-item-action:focus {\n    color: #806943;\n    background-color: #fce6c3;\n}\n.list-group-item-primary.list-group-item-action.active {\n    color: #fff;\n    background-color: #806943;\n    border-color: #806943;\n}\n.list-group-item-secondary {\n  color: #858585;\n  background-color: white;\n}\n.list-group-item-secondary.list-group-item-action:hover, .list-group-item-secondary.list-group-item-action:focus {\n    color: #858585;\n    background-color: #f2f2f2;\n}\n.list-group-item-secondary.list-group-item-action.active {\n    color: #fff;\n    background-color: #858585;\n    border-color: #858585;\n}\n.list-group-item-success {\n  color: #688166;\n  background-color: #f0fdef;\n}\n.list-group-item-success.list-group-item-action:hover, .list-group-item-success.list-group-item-action:focus {\n    color: #688166;\n    background-color: #dbfad8;\n}\n.list-group-item-success.list-group-item-action.active {\n    color: #fff;\n    background-color: #688166;\n    border-color: #688166;\n}\n.list-group-item-info {\n  color: #265d76;\n  background-color: #cce9f7;\n}\n.list-group-item-info.list-group-item-action:hover, .list-group-item-info.list-group-item-action:focus {\n    color: #265d76;\n    background-color: #b6dff4;\n}\n.list-group-item-info.list-group-item-action.active {\n    color: #fff;\n    background-color: #265d76;\n    border-color: #265d76;\n}\n.list-group-item-warning {\n  color: #806943;\n  background-color: #fdf0db;\n}\n.list-group-item-warning.list-group-item-action:hover, .list-group-item-warning.list-group-item-action:focus {\n    color: #806943;\n    background-color: #fce6c3;\n}\n.list-group-item-warning.list-group-item-action.active {\n    color: #fff;\n    background-color: #806943;\n    border-color: #806943;\n}\n.list-group-item-danger {\n  color: #762626;\n  background-color: #f7cccc;\n}\n.list-group-item-danger.list-group-item-action:hover, .list-group-item-danger.list-group-item-action:focus {\n    color: #762626;\n    background-color: #f4b6b6;\n}\n.list-group-item-danger.list-group-item-action.active {\n    color: #fff;\n    background-color: #762626;\n    border-color: #762626;\n}\n.list-group-item-light {\n  color: #7c7f7f;\n  background-color: #fbfcfc;\n}\n.list-group-item-light.list-group-item-action:hover, .list-group-item-light.list-group-item-action:focus {\n    color: #7c7f7f;\n    background-color: #ecf1f1;\n}\n.list-group-item-light.list-group-item-action.active {\n    color: #fff;\n    background-color: #7c7f7f;\n    border-color: #7c7f7f;\n}\n.list-group-item-dark {\n  color: #0b0b0b;\n  background-color: #bebebe;\n}\n.list-group-item-dark.list-group-item-action:hover, .list-group-item-dark.list-group-item-action:focus {\n    color: #0b0b0b;\n    background-color: #b1b1b1;\n}\n.list-group-item-dark.list-group-item-action.active {\n    color: #fff;\n    background-color: #0b0b0b;\n    border-color: #0b0b0b;\n}\n.list-group-item-pale {\n  color: #717171;\n  background-color: #f4f4f4;\n}\n.list-group-item-pale.list-group-item-action:hover, .list-group-item-pale.list-group-item-action:focus {\n    color: #717171;\n    background-color: #e7e7e7;\n}\n.list-group-item-pale.list-group-item-action.active {\n    color: #fff;\n    background-color: #717171;\n    border-color: #717171;\n}\n.close {\n  float: right;\n  font-size: 1.5rem;\n  font-weight: 700;\n  line-height: 1;\n  color: #000;\n  text-shadow: 0 1px 0 #fff;\n  opacity: .5;\n}\n.close:hover, .close:focus {\n    color: #000;\n    text-decoration: none;\n    opacity: .75;\n}\n.close:not(:disabled):not(.disabled) {\n    cursor: pointer;\n}\nbutton.close {\n  padding: 0;\n  background-color: transparent;\n  border: 0;\n  -webkit-appearance: none;\n}\n.modal-open {\n  overflow: hidden;\n}\n.modal {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1050;\n  display: none;\n  overflow: hidden;\n  outline: 0;\n}\n.modal-open .modal {\n    overflow-x: hidden;\n    overflow-y: auto;\n}\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: 0.5rem;\n  pointer-events: none;\n}\n.modal.fade .modal-dialog {\n    -webkit-transition: -webkit-transform 0.3s ease-out;\n    transition: -webkit-transform 0.3s ease-out;\n    transition: transform 0.3s ease-out;\n    transition: transform 0.3s ease-out, -webkit-transform 0.3s ease-out;\n    -webkit-transform: translate(0, -25%);\n            transform: translate(0, -25%);\n}\n.modal.show .modal-dialog {\n    -webkit-transform: translate(0, 0);\n            transform: translate(0, 0);\n}\n.modal-dialog-centered {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  min-height: calc(100% - (0.5rem * 2));\n}\n.modal-content {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: vertical;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: column;\n          flex-direction: column;\n  width: 100%;\n  pointer-events: auto;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 0 solid rgba(0, 0, 0, 0.2);\n  border-radius: 0.3rem;\n  outline: 0;\n}\n.modal-backdrop {\n  position: fixed;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1040;\n  background-color: #000;\n}\n.modal-backdrop.fade {\n    opacity: 0;\n}\n.modal-backdrop.show {\n    opacity: 0.5;\n}\n.modal-header {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: start;\n      -ms-flex-align: start;\n          align-items: flex-start;\n  -webkit-box-pack: justify;\n      -ms-flex-pack: justify;\n          justify-content: space-between;\n  padding: 1rem;\n  border-bottom: 0 solid #e9ecef;\n  border-top-left-radius: 0.3rem;\n  border-top-right-radius: 0.3rem;\n}\n.modal-header .close {\n    padding: 1rem;\n    margin: -1rem -1rem -1rem auto;\n}\n.modal-title {\n  margin-bottom: 0;\n  line-height: 1.5;\n}\n.modal-body {\n  position: relative;\n  -webkit-box-flex: 1;\n      -ms-flex: 1 1 auto;\n          flex: 1 1 auto;\n  padding: 25px;\n}\n.modal-footer {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: end;\n      -ms-flex-pack: end;\n          justify-content: flex-end;\n  padding: 25px;\n  border-top: 0 solid #e9ecef;\n}\n.modal-footer > :not(:first-child) {\n    margin-left: .25rem;\n}\n.modal-footer > :not(:last-child) {\n    margin-right: .25rem;\n}\n.modal-scrollbar-measure {\n  position: absolute;\n  top: -9999px;\n  width: 50px;\n  height: 50px;\n  overflow: scroll;\n}\n@media (min-width: 576px) {\n.modal-dialog {\n    max-width: 650px;\n    margin: 1.75rem auto;\n}\n.modal-dialog-centered {\n    min-height: calc(100% - (1.75rem * 2));\n}\n.modal-sm {\n    max-width: 300px;\n}\n}\n@media (min-width: 992px) {\n.modal-lg {\n    max-width: 850px;\n}\n}\n.tooltip {\n  position: absolute;\n  z-index: 1070;\n  display: block;\n  margin: 0;\n  font-family: \"Source Sans Pro\", sans-serif;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  word-spacing: normal;\n  white-space: normal;\n  line-break: auto;\n  font-size: 1rem;\n  word-wrap: break-word;\n  opacity: 0;\n}\n.tooltip.show, .tooltip.vuestic-tooltip {\n    opacity: 0.9;\n}\n.tooltip .arrow, .tooltip.vuestic-tooltip .tooltip-arrow {\n    position: absolute;\n    display: block;\n    width: 0.8rem;\n    height: 0.4rem;\n}\n.tooltip .arrow::before, .tooltip.vuestic-tooltip .tooltip-arrow::before {\n      position: absolute;\n      content: \"\";\n      border-color: transparent;\n      border-style: solid;\n}\n.bs-tooltip-top, .bs-tooltip-auto[x-placement^=\"top\"], .tooltip.vuestic-tooltip[x-placement^=\"top\"] {\n  padding: 0.4rem 0;\n}\n.bs-tooltip-top .arrow, .bs-tooltip-auto[x-placement^=\"top\"] .arrow, .tooltip.vuestic-tooltip[x-placement^=\"top\"] .arrow, .bs-tooltip-top .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-top .tooltip-arrow, .bs-tooltip-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"top\"] .tooltip-arrow, .tooltip.vuestic-tooltip[x-placement^=\"top\"] .tooltip-arrow {\n    bottom: 0;\n}\n.bs-tooltip-top .arrow::before, .bs-tooltip-auto[x-placement^=\"top\"] .arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"top\"] .arrow::before, .bs-tooltip-top .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-top .tooltip-arrow::before, .bs-tooltip-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"top\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"top\"] .tooltip-arrow::before {\n      top: 0;\n      border-width: 0.4rem 0.4rem 0;\n      border-top-color: #333;\n}\n.bs-tooltip-right, .bs-tooltip-auto[x-placement^=\"right\"], .tooltip.vuestic-tooltip[x-placement^=\"right\"] {\n  padding: 0 0.4rem;\n}\n.bs-tooltip-right .arrow, .bs-tooltip-auto[x-placement^=\"right\"] .arrow, .tooltip.vuestic-tooltip[x-placement^=\"right\"] .arrow, .bs-tooltip-right .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-right .tooltip-arrow, .bs-tooltip-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"right\"] .tooltip-arrow, .tooltip.vuestic-tooltip[x-placement^=\"right\"] .tooltip-arrow {\n    left: 0;\n    width: 0.4rem;\n    height: 0.8rem;\n}\n.bs-tooltip-right .arrow::before, .bs-tooltip-auto[x-placement^=\"right\"] .arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"right\"] .arrow::before, .bs-tooltip-right .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-right .tooltip-arrow::before, .bs-tooltip-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"right\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"right\"] .tooltip-arrow::before {\n      right: 0;\n      border-width: 0.4rem 0.4rem 0.4rem 0;\n      border-right-color: #333;\n}\n.bs-tooltip-bottom, .bs-tooltip-auto[x-placement^=\"bottom\"], .tooltip.vuestic-tooltip[x-placement^=\"bottom\"] {\n  padding: 0.4rem 0;\n}\n.bs-tooltip-bottom .arrow, .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow, .tooltip.vuestic-tooltip[x-placement^=\"bottom\"] .arrow, .bs-tooltip-bottom .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-bottom .tooltip-arrow, .bs-tooltip-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"bottom\"] .tooltip-arrow, .tooltip.vuestic-tooltip[x-placement^=\"bottom\"] .tooltip-arrow {\n    top: 0;\n}\n.bs-tooltip-bottom .arrow::before, .bs-tooltip-auto[x-placement^=\"bottom\"] .arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"bottom\"] .arrow::before, .bs-tooltip-bottom .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-bottom .tooltip-arrow::before, .bs-tooltip-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"bottom\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"bottom\"] .tooltip-arrow::before {\n      bottom: 0;\n      border-width: 0 0.4rem 0.4rem;\n      border-bottom-color: #333;\n}\n.bs-tooltip-left, .bs-tooltip-auto[x-placement^=\"left\"], .tooltip.vuestic-tooltip[x-placement^=\"left\"] {\n  padding: 0 0.4rem;\n}\n.bs-tooltip-left .arrow, .bs-tooltip-auto[x-placement^=\"left\"] .arrow, .tooltip.vuestic-tooltip[x-placement^=\"left\"] .arrow, .bs-tooltip-left .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-left .tooltip-arrow, .bs-tooltip-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"left\"] .tooltip-arrow, .tooltip.vuestic-tooltip[x-placement^=\"left\"] .tooltip-arrow {\n    right: 0;\n    width: 0.4rem;\n    height: 0.8rem;\n}\n.bs-tooltip-left .arrow::before, .bs-tooltip-auto[x-placement^=\"left\"] .arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"left\"] .arrow::before, .bs-tooltip-left .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-left .tooltip-arrow::before, .bs-tooltip-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-tooltip-auto[x-placement^=\"left\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip[x-placement^=\"left\"] .tooltip-arrow::before {\n      left: 0;\n      border-width: 0.4rem 0 0.4rem 0.4rem;\n      border-left-color: #333;\n}\n.tooltip-inner {\n  max-width: 200px;\n  padding: 0.5rem 0.75rem;\n  color: #fff;\n  text-align: center;\n  background-color: #333;\n  border-radius: 0.5rem;\n}\n.popover {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 1060;\n  display: block;\n  max-width: 400px;\n  font-family: \"Source Sans Pro\", sans-serif;\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  word-spacing: normal;\n  white-space: normal;\n  line-break: auto;\n  font-size: 1rem;\n  word-wrap: break-word;\n  background-color: #333;\n  background-clip: padding-box;\n  border: 0 solid transparent;\n  border-radius: 0.5rem;\n}\n.popover .arrow, .popover .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .popover .tooltip-arrow {\n    position: absolute;\n    display: block;\n    width: 1rem;\n    height: 1rem;\n    margin: 0 0.3rem;\n}\n.popover .arrow::before, .popover .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .popover .tooltip-arrow::before, .popover .arrow::after, .popover .tooltip.vuestic-tooltip .tooltip-arrow::after, .tooltip.vuestic-tooltip .popover .tooltip-arrow::after {\n      position: absolute;\n      display: block;\n      content: \"\";\n      border-color: transparent;\n      border-style: solid;\n}\n.bs-popover-top, .bs-popover-auto[x-placement^=\"top\"], .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] {\n  margin-bottom: 1rem;\n}\n.bs-popover-top .arrow, .bs-popover-auto[x-placement^=\"top\"] .arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .arrow, .bs-popover-top .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-top .tooltip-arrow, .bs-popover-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"top\"] .tooltip-arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .tooltip-arrow {\n    bottom: calc((1rem + 0) * -1);\n}\n.bs-popover-top .arrow::before, .bs-popover-auto[x-placement^=\"top\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .arrow::before, .bs-popover-top .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-top .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"top\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .tooltip-arrow::before,\n  .bs-popover-top .arrow::after,\n  .bs-popover-auto[x-placement^=\"top\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .arrow::after,\n  .bs-popover-top .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-top .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"top\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .tooltip-arrow::after {\n    border-width: 1rem 0.5rem 0;\n}\n.bs-popover-top .arrow::before, .bs-popover-auto[x-placement^=\"top\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .arrow::before, .bs-popover-top .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-top .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"top\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .tooltip-arrow::before {\n    bottom: 0;\n    border-top-color: rgba(0, 0, 0, 0.05);\n}\n.bs-popover-top .arrow::after,\n  .bs-popover-auto[x-placement^=\"top\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .arrow::after,\n  .bs-popover-top .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-top .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"top\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"top\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"top\"] .tooltip-arrow::after {\n    bottom: 0;\n    border-top-color: transparent;\n}\n.bs-popover-right, .bs-popover-auto[x-placement^=\"right\"], .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] {\n  margin-left: 1rem;\n}\n.bs-popover-right .arrow, .bs-popover-auto[x-placement^=\"right\"] .arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .arrow, .bs-popover-right .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-right .tooltip-arrow, .bs-popover-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"right\"] .tooltip-arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .tooltip-arrow {\n    left: calc((1rem + 0) * -1);\n    width: 1rem;\n    height: 1rem;\n    margin: 0.3rem 0;\n}\n.bs-popover-right .arrow::before, .bs-popover-auto[x-placement^=\"right\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .arrow::before, .bs-popover-right .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-right .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"right\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .tooltip-arrow::before,\n  .bs-popover-right .arrow::after,\n  .bs-popover-auto[x-placement^=\"right\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .arrow::after,\n  .bs-popover-right .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-right .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"right\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .tooltip-arrow::after {\n    border-width: 0.5rem 1rem 0.5rem 0;\n}\n.bs-popover-right .arrow::before, .bs-popover-auto[x-placement^=\"right\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .arrow::before, .bs-popover-right .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-right .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"right\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .tooltip-arrow::before {\n    left: 0;\n    border-right-color: rgba(0, 0, 0, 0.05);\n}\n.bs-popover-right .arrow::after,\n  .bs-popover-auto[x-placement^=\"right\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .arrow::after,\n  .bs-popover-right .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-right .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"right\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"right\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"right\"] .tooltip-arrow::after {\n    left: 0;\n    border-right-color: transparent;\n}\n.bs-popover-bottom, .bs-popover-auto[x-placement^=\"bottom\"], .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] {\n  margin-top: 1rem;\n}\n.bs-popover-bottom .arrow, .bs-popover-auto[x-placement^=\"bottom\"] .arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .arrow, .bs-popover-bottom .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-bottom .tooltip-arrow, .bs-popover-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"bottom\"] .tooltip-arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .tooltip-arrow {\n    top: calc((1rem + 0) * -1);\n}\n.bs-popover-bottom .arrow::before, .bs-popover-auto[x-placement^=\"bottom\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .arrow::before, .bs-popover-bottom .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-bottom .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"bottom\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .tooltip-arrow::before,\n  .bs-popover-bottom .arrow::after,\n  .bs-popover-auto[x-placement^=\"bottom\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .arrow::after,\n  .bs-popover-bottom .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-bottom .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"bottom\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .tooltip-arrow::after {\n    border-width: 0 0.5rem 1rem 0.5rem;\n}\n.bs-popover-bottom .arrow::before, .bs-popover-auto[x-placement^=\"bottom\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .arrow::before, .bs-popover-bottom .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-bottom .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"bottom\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .tooltip-arrow::before {\n    top: 0;\n    border-bottom-color: rgba(0, 0, 0, 0.05);\n}\n.bs-popover-bottom .arrow::after,\n  .bs-popover-auto[x-placement^=\"bottom\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .arrow::after,\n  .bs-popover-bottom .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-bottom .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"bottom\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"bottom\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .tooltip-arrow::after {\n    top: 0;\n    border-bottom-color: transparent;\n}\n.bs-popover-bottom .popover-header::before, .bs-popover-auto[x-placement^=\"bottom\"] .popover-header::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"bottom\"] .popover-header::before {\n    position: absolute;\n    top: 0;\n    left: 50%;\n    display: block;\n    width: 1rem;\n    margin-left: -0.5rem;\n    content: \"\";\n    border-bottom: 0 solid #333;\n}\n.bs-popover-left, .bs-popover-auto[x-placement^=\"left\"], .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] {\n  margin-right: 1rem;\n}\n.bs-popover-left .arrow, .bs-popover-auto[x-placement^=\"left\"] .arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .arrow, .bs-popover-left .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-left .tooltip-arrow, .bs-popover-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"left\"] .tooltip-arrow, .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .tooltip-arrow {\n    right: calc((1rem + 0) * -1);\n    width: 1rem;\n    height: 1rem;\n    margin: 0.3rem 0;\n}\n.bs-popover-left .arrow::before, .bs-popover-auto[x-placement^=\"left\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .arrow::before, .bs-popover-left .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-left .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"left\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .tooltip-arrow::before,\n  .bs-popover-left .arrow::after,\n  .bs-popover-auto[x-placement^=\"left\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .arrow::after,\n  .bs-popover-left .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-left .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"left\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .tooltip-arrow::after {\n    border-width: 0.5rem 0 0.5rem 1rem;\n}\n.bs-popover-left .arrow::before, .bs-popover-auto[x-placement^=\"left\"] .arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .arrow::before, .bs-popover-left .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-left .tooltip-arrow::before, .bs-popover-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow::before, .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"left\"] .tooltip-arrow::before, .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .tooltip-arrow::before {\n    right: 0;\n    border-left-color: rgba(0, 0, 0, 0.05);\n}\n.bs-popover-left .arrow::after,\n  .bs-popover-auto[x-placement^=\"left\"] .arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .arrow::after,\n  .bs-popover-left .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-left .tooltip-arrow::after,\n  .bs-popover-auto[x-placement^=\"left\"] .tooltip.vuestic-tooltip .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip .bs-popover-auto[x-placement^=\"left\"] .tooltip-arrow::after,\n  .tooltip.vuestic-tooltip.popover[x-placement^=\"left\"] .tooltip-arrow::after {\n    right: 0;\n    border-left-color: transparent;\n}\n.popover-header {\n  padding: 0 0.75rem;\n  margin-bottom: 0;\n  font-size: 1rem;\n  color: #fff;\n  background-color: #333;\n  border-bottom: 0 solid #262626;\n  border-top-left-radius: calc(0.3rem - 0);\n  border-top-right-radius: calc(0.3rem - 0);\n}\n.popover-header:empty {\n    display: none;\n}\n.popover-body {\n  padding: 0 0.75rem;\n  color: #fff;\n}\n.carousel {\n  position: relative;\n}\n.carousel-inner {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n}\n.carousel-item {\n  position: relative;\n  display: none;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  width: 100%;\n  -webkit-transition: -webkit-transform 0.6s ease;\n  transition: -webkit-transform 0.6s ease;\n  transition: transform 0.6s ease;\n  transition: transform 0.6s ease, -webkit-transform 0.6s ease;\n  -webkit-backface-visibility: hidden;\n          backface-visibility: hidden;\n  -webkit-perspective: 1000px;\n          perspective: 1000px;\n}\n.carousel-item.active,\n.carousel-item-next,\n.carousel-item-prev {\n  display: block;\n}\n.carousel-item-next,\n.carousel-item-prev {\n  position: absolute;\n  top: 0;\n}\n.carousel-item-next.carousel-item-left,\n.carousel-item-prev.carousel-item-right {\n  -webkit-transform: translateX(0);\n          transform: translateX(0);\n}\n@supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {\n.carousel-item-next.carousel-item-left,\n    .carousel-item-prev.carousel-item-right {\n      -webkit-transform: translate3d(0, 0, 0);\n              transform: translate3d(0, 0, 0);\n}\n}\n.carousel-item-next,\n.active.carousel-item-right {\n  -webkit-transform: translateX(100%);\n          transform: translateX(100%);\n}\n@supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {\n.carousel-item-next,\n    .active.carousel-item-right {\n      -webkit-transform: translate3d(100%, 0, 0);\n              transform: translate3d(100%, 0, 0);\n}\n}\n.carousel-item-prev,\n.active.carousel-item-left {\n  -webkit-transform: translateX(-100%);\n          transform: translateX(-100%);\n}\n@supports ((-webkit-transform-style: preserve-3d) or (transform-style: preserve-3d)) {\n.carousel-item-prev,\n    .active.carousel-item-left {\n      -webkit-transform: translate3d(-100%, 0, 0);\n              transform: translate3d(-100%, 0, 0);\n}\n}\n.carousel-control-prev,\n.carousel-control-next {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  width: 15%;\n  color: #fff;\n  text-align: center;\n  opacity: 0.5;\n}\n.carousel-control-prev:hover, .carousel-control-prev:focus,\n  .carousel-control-next:hover,\n  .carousel-control-next:focus {\n    color: #fff;\n    text-decoration: none;\n    outline: 0;\n    opacity: .9;\n}\n.carousel-control-prev {\n  left: 0;\n}\n.carousel-control-next {\n  right: 0;\n}\n.carousel-control-prev-icon,\n.carousel-control-next-icon {\n  display: inline-block;\n  width: 20px;\n  height: 20px;\n  background: transparent no-repeat center center;\n  background-size: 100% 100%;\n}\n.carousel-control-prev-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M5.25 0l-4 4 4 4 1.5-1.5-2.5-2.5 2.5-2.5-1.5-1.5z'/%3E%3C/svg%3E\");\n}\n.carousel-control-next-icon {\n  background-image: url(\"data:image/svg+xml;charset=utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23fff' viewBox='0 0 8 8'%3E%3Cpath d='M2.75 0l-1.5 1.5 2.5 2.5-2.5 2.5 1.5 1.5 4-4-4-4z'/%3E%3C/svg%3E\");\n}\n.carousel-indicators {\n  position: absolute;\n  right: 0;\n  bottom: 10px;\n  left: 0;\n  z-index: 15;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-pack: center;\n      -ms-flex-pack: center;\n          justify-content: center;\n  padding-left: 0;\n  margin-right: 15%;\n  margin-left: 15%;\n  list-style: none;\n}\n.carousel-indicators li {\n    position: relative;\n    -webkit-box-flex: 0;\n        -ms-flex: 0 1 auto;\n            flex: 0 1 auto;\n    width: 30px;\n    height: 3px;\n    margin-right: 3px;\n    margin-left: 3px;\n    text-indent: -999px;\n    background-color: rgba(255, 255, 255, 0.5);\n}\n.carousel-indicators li::before {\n      position: absolute;\n      top: -10px;\n      left: 0;\n      display: inline-block;\n      width: 100%;\n      height: 10px;\n      content: \"\";\n}\n.carousel-indicators li::after {\n      position: absolute;\n      bottom: -10px;\n      left: 0;\n      display: inline-block;\n      width: 100%;\n      height: 10px;\n      content: \"\";\n}\n.carousel-indicators .active {\n    background-color: #fff;\n}\n.carousel-caption {\n  position: absolute;\n  right: 15%;\n  bottom: 20px;\n  left: 15%;\n  z-index: 10;\n  padding-top: 20px;\n  padding-bottom: 20px;\n  color: #fff;\n  text-align: center;\n}\n.align-baseline {\n  vertical-align: baseline !important;\n}\n.align-top {\n  vertical-align: top !important;\n}\n.align-middle {\n  vertical-align: middle !important;\n}\n.align-bottom {\n  vertical-align: bottom !important;\n}\n.align-text-bottom {\n  vertical-align: text-bottom !important;\n}\n.align-text-top {\n  vertical-align: text-top !important;\n}\n.bg-primary {\n  background-color: #f7c980 !important;\n}\na.bg-primary:hover, a.bg-primary:focus,\nbutton.bg-primary:hover,\nbutton.bg-primary:focus {\n  background-color: #f4b550 !important;\n}\n.bg-secondary {\n  background-color: #fff !important;\n}\na.bg-secondary:hover, a.bg-secondary:focus,\nbutton.bg-secondary:hover,\nbutton.bg-secondary:focus {\n  background-color: #e6e6e6 !important;\n}\n.bg-success {\n  background-color: #c8f9c5 !important;\n}\na.bg-success:hover, a.bg-success:focus,\nbutton.bg-success:hover,\nbutton.bg-success:focus {\n  background-color: #9cf497 !important;\n}\n.bg-info {\n  background-color: #4ab2e3 !important;\n}\na.bg-info:hover, a.bg-info:focus,\nbutton.bg-info:hover,\nbutton.bg-info:focus {\n  background-color: #219ed9 !important;\n}\n.bg-warning {\n  background-color: #f7c980 !important;\n}\na.bg-warning:hover, a.bg-warning:focus,\nbutton.bg-warning:hover,\nbutton.bg-warning:focus {\n  background-color: #f4b550 !important;\n}\n.bg-danger {\n  background-color: #e34a4a !important;\n}\na.bg-danger:hover, a.bg-danger:focus,\nbutton.bg-danger:hover,\nbutton.bg-danger:focus {\n  background-color: #d92121 !important;\n}\n.bg-light {\n  background-color: #eff4f5 !important;\n}\na.bg-light:hover, a.bg-light:focus,\nbutton.bg-light:hover,\nbutton.bg-light:focus {\n  background-color: #d0dee1 !important;\n}\n.bg-dark {\n  background-color: #161616 !important;\n}\na.bg-dark:hover, a.bg-dark:focus,\nbutton.bg-dark:hover,\nbutton.bg-dark:focus {\n  background-color: black !important;\n}\n.bg-pale {\n  background-color: #d9d9d9 !important;\n}\na.bg-pale:hover, a.bg-pale:focus,\nbutton.bg-pale:hover,\nbutton.bg-pale:focus {\n  background-color: silver !important;\n}\n.bg-white {\n  background-color: #fff !important;\n}\n.bg-transparent {\n  background-color: transparent !important;\n}\n.border {\n  border: 1px solid #dee2e6 !important;\n}\n.border-top {\n  border-top: 1px solid #dee2e6 !important;\n}\n.border-right {\n  border-right: 1px solid #dee2e6 !important;\n}\n.border-bottom {\n  border-bottom: 1px solid #dee2e6 !important;\n}\n.border-left {\n  border-left: 1px solid #dee2e6 !important;\n}\n.border-0 {\n  border: 0 !important;\n}\n.border-top-0 {\n  border-top: 0 !important;\n}\n.border-right-0 {\n  border-right: 0 !important;\n}\n.border-bottom-0 {\n  border-bottom: 0 !important;\n}\n.border-left-0 {\n  border-left: 0 !important;\n}\n.border-primary {\n  border-color: #f7c980 !important;\n}\n.border-secondary {\n  border-color: #fff !important;\n}\n.border-success {\n  border-color: #c8f9c5 !important;\n}\n.border-info {\n  border-color: #4ab2e3 !important;\n}\n.border-warning {\n  border-color: #f7c980 !important;\n}\n.border-danger {\n  border-color: #e34a4a !important;\n}\n.border-light {\n  border-color: #eff4f5 !important;\n}\n.border-dark {\n  border-color: #161616 !important;\n}\n.border-pale {\n  border-color: #d9d9d9 !important;\n}\n.border-white {\n  border-color: #fff !important;\n}\n.rounded {\n  border-radius: 0.25rem !important;\n}\n.rounded-top {\n  border-top-left-radius: 0.25rem !important;\n  border-top-right-radius: 0.25rem !important;\n}\n.rounded-right {\n  border-top-right-radius: 0.25rem !important;\n  border-bottom-right-radius: 0.25rem !important;\n}\n.rounded-bottom {\n  border-bottom-right-radius: 0.25rem !important;\n  border-bottom-left-radius: 0.25rem !important;\n}\n.rounded-left {\n  border-top-left-radius: 0.25rem !important;\n  border-bottom-left-radius: 0.25rem !important;\n}\n.rounded-circle {\n  border-radius: 50% !important;\n}\n.rounded-0 {\n  border-radius: 0 !important;\n}\n.clearfix::after {\n  display: block;\n  clear: both;\n  content: \"\";\n}\n.d-none {\n  display: none !important;\n}\n.d-inline {\n  display: inline !important;\n}\n.d-inline-block {\n  display: inline-block !important;\n}\n.d-block {\n  display: block !important;\n}\n.d-table {\n  display: table !important;\n}\n.d-table-row {\n  display: table-row !important;\n}\n.d-table-cell {\n  display: table-cell !important;\n}\n.d-flex {\n  display: -webkit-box !important;\n  display: -ms-flexbox !important;\n  display: flex !important;\n}\n.d-inline-flex {\n  display: -webkit-inline-box !important;\n  display: -ms-inline-flexbox !important;\n  display: inline-flex !important;\n}\n@media (min-width: 576px) {\n.d-sm-none {\n    display: none !important;\n}\n.d-sm-inline {\n    display: inline !important;\n}\n.d-sm-inline-block {\n    display: inline-block !important;\n}\n.d-sm-block {\n    display: block !important;\n}\n.d-sm-table {\n    display: table !important;\n}\n.d-sm-table-row {\n    display: table-row !important;\n}\n.d-sm-table-cell {\n    display: table-cell !important;\n}\n.d-sm-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-sm-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media (min-width: 768px) {\n.d-md-none {\n    display: none !important;\n}\n.d-md-inline {\n    display: inline !important;\n}\n.d-md-inline-block {\n    display: inline-block !important;\n}\n.d-md-block {\n    display: block !important;\n}\n.d-md-table {\n    display: table !important;\n}\n.d-md-table-row {\n    display: table-row !important;\n}\n.d-md-table-cell {\n    display: table-cell !important;\n}\n.d-md-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-md-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media (min-width: 992px) {\n.d-lg-none {\n    display: none !important;\n}\n.d-lg-inline {\n    display: inline !important;\n}\n.d-lg-inline-block {\n    display: inline-block !important;\n}\n.d-lg-block {\n    display: block !important;\n}\n.d-lg-table {\n    display: table !important;\n}\n.d-lg-table-row {\n    display: table-row !important;\n}\n.d-lg-table-cell {\n    display: table-cell !important;\n}\n.d-lg-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-lg-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media (min-width: 1200px) {\n.d-xl-none {\n    display: none !important;\n}\n.d-xl-inline {\n    display: inline !important;\n}\n.d-xl-inline-block {\n    display: inline-block !important;\n}\n.d-xl-block {\n    display: block !important;\n}\n.d-xl-table {\n    display: table !important;\n}\n.d-xl-table-row {\n    display: table-row !important;\n}\n.d-xl-table-cell {\n    display: table-cell !important;\n}\n.d-xl-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-xl-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n@media print {\n.d-print-none {\n    display: none !important;\n}\n.d-print-inline {\n    display: inline !important;\n}\n.d-print-inline-block {\n    display: inline-block !important;\n}\n.d-print-block {\n    display: block !important;\n}\n.d-print-table {\n    display: table !important;\n}\n.d-print-table-row {\n    display: table-row !important;\n}\n.d-print-table-cell {\n    display: table-cell !important;\n}\n.d-print-flex {\n    display: -webkit-box !important;\n    display: -ms-flexbox !important;\n    display: flex !important;\n}\n.d-print-inline-flex {\n    display: -webkit-inline-box !important;\n    display: -ms-inline-flexbox !important;\n    display: inline-flex !important;\n}\n}\n.embed-responsive {\n  position: relative;\n  display: block;\n  width: 100%;\n  padding: 0;\n  overflow: hidden;\n}\n.embed-responsive::before {\n    display: block;\n    content: \"\";\n}\n.embed-responsive .embed-responsive-item,\n  .embed-responsive iframe,\n  .embed-responsive embed,\n  .embed-responsive object,\n  .embed-responsive video {\n    position: absolute;\n    top: 0;\n    bottom: 0;\n    left: 0;\n    width: 100%;\n    height: 100%;\n    border: 0;\n}\n.embed-responsive-21by9::before {\n  padding-top: 42.85714%;\n}\n.embed-responsive-16by9::before {\n  padding-top: 56.25%;\n}\n.embed-responsive-4by3::before {\n  padding-top: 75%;\n}\n.embed-responsive-1by1::before {\n  padding-top: 100%;\n}\n.flex-row {\n  -webkit-box-orient: horizontal !important;\n  -webkit-box-direction: normal !important;\n      -ms-flex-direction: row !important;\n          flex-direction: row !important;\n}\n.flex-column {\n  -webkit-box-orient: vertical !important;\n  -webkit-box-direction: normal !important;\n      -ms-flex-direction: column !important;\n          flex-direction: column !important;\n}\n.flex-row-reverse {\n  -webkit-box-orient: horizontal !important;\n  -webkit-box-direction: reverse !important;\n      -ms-flex-direction: row-reverse !important;\n          flex-direction: row-reverse !important;\n}\n.flex-column-reverse {\n  -webkit-box-orient: vertical !important;\n  -webkit-box-direction: reverse !important;\n      -ms-flex-direction: column-reverse !important;\n          flex-direction: column-reverse !important;\n}\n.flex-wrap {\n  -ms-flex-wrap: wrap !important;\n      flex-wrap: wrap !important;\n}\n.flex-nowrap {\n  -ms-flex-wrap: nowrap !important;\n      flex-wrap: nowrap !important;\n}\n.flex-wrap-reverse {\n  -ms-flex-wrap: wrap-reverse !important;\n      flex-wrap: wrap-reverse !important;\n}\n.justify-content-start {\n  -webkit-box-pack: start !important;\n      -ms-flex-pack: start !important;\n          justify-content: flex-start !important;\n}\n.justify-content-end {\n  -webkit-box-pack: end !important;\n      -ms-flex-pack: end !important;\n          justify-content: flex-end !important;\n}\n.justify-content-center {\n  -webkit-box-pack: center !important;\n      -ms-flex-pack: center !important;\n          justify-content: center !important;\n}\n.justify-content-between {\n  -webkit-box-pack: justify !important;\n      -ms-flex-pack: justify !important;\n          justify-content: space-between !important;\n}\n.justify-content-around {\n  -ms-flex-pack: distribute !important;\n      justify-content: space-around !important;\n}\n.align-items-start {\n  -webkit-box-align: start !important;\n      -ms-flex-align: start !important;\n          align-items: flex-start !important;\n}\n.align-items-end {\n  -webkit-box-align: end !important;\n      -ms-flex-align: end !important;\n          align-items: flex-end !important;\n}\n.align-items-center {\n  -webkit-box-align: center !important;\n      -ms-flex-align: center !important;\n          align-items: center !important;\n}\n.align-items-baseline {\n  -webkit-box-align: baseline !important;\n      -ms-flex-align: baseline !important;\n          align-items: baseline !important;\n}\n.align-items-stretch {\n  -webkit-box-align: stretch !important;\n      -ms-flex-align: stretch !important;\n          align-items: stretch !important;\n}\n.align-content-start {\n  -ms-flex-line-pack: start !important;\n      align-content: flex-start !important;\n}\n.align-content-end {\n  -ms-flex-line-pack: end !important;\n      align-content: flex-end !important;\n}\n.align-content-center {\n  -ms-flex-line-pack: center !important;\n      align-content: center !important;\n}\n.align-content-between {\n  -ms-flex-line-pack: justify !important;\n      align-content: space-between !important;\n}\n.align-content-around {\n  -ms-flex-line-pack: distribute !important;\n      align-content: space-around !important;\n}\n.align-content-stretch {\n  -ms-flex-line-pack: stretch !important;\n      align-content: stretch !important;\n}\n.align-self-auto {\n  -ms-flex-item-align: auto !important;\n      align-self: auto !important;\n}\n.align-self-start {\n  -ms-flex-item-align: start !important;\n      align-self: flex-start !important;\n}\n.align-self-end {\n  -ms-flex-item-align: end !important;\n      align-self: flex-end !important;\n}\n.align-self-center {\n  -ms-flex-item-align: center !important;\n      align-self: center !important;\n}\n.align-self-baseline {\n  -ms-flex-item-align: baseline !important;\n      align-self: baseline !important;\n}\n.align-self-stretch {\n  -ms-flex-item-align: stretch !important;\n      align-self: stretch !important;\n}\n@media (min-width: 576px) {\n.flex-sm-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-sm-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-sm-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-sm-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-sm-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-sm-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-sm-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-sm-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-sm-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-sm-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-sm-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-sm-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-sm-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-sm-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-sm-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-sm-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-sm-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-sm-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-sm-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-sm-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-sm-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-sm-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-sm-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-sm-auto {\n    -ms-flex-item-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-sm-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-sm-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-sm-center {\n    -ms-flex-item-align: center !important;\n        align-self: center !important;\n}\n.align-self-sm-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-sm-stretch {\n    -ms-flex-item-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n@media (min-width: 768px) {\n.flex-md-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-md-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-md-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-md-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-md-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-md-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-md-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-md-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-md-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-md-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-md-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-md-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-md-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-md-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-md-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-md-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-md-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-md-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-md-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-md-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-md-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-md-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-md-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-md-auto {\n    -ms-flex-item-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-md-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-md-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-md-center {\n    -ms-flex-item-align: center !important;\n        align-self: center !important;\n}\n.align-self-md-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-md-stretch {\n    -ms-flex-item-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n@media (min-width: 992px) {\n.flex-lg-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-lg-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-lg-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-lg-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-lg-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-lg-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-lg-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-lg-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-lg-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-lg-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-lg-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-lg-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-lg-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-lg-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-lg-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-lg-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-lg-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-lg-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-lg-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-lg-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-lg-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-lg-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-lg-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-lg-auto {\n    -ms-flex-item-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-lg-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-lg-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-lg-center {\n    -ms-flex-item-align: center !important;\n        align-self: center !important;\n}\n.align-self-lg-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-lg-stretch {\n    -ms-flex-item-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n@media (min-width: 1200px) {\n.flex-xl-row {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: row !important;\n            flex-direction: row !important;\n}\n.flex-xl-column {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: normal !important;\n        -ms-flex-direction: column !important;\n            flex-direction: column !important;\n}\n.flex-xl-row-reverse {\n    -webkit-box-orient: horizontal !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: row-reverse !important;\n            flex-direction: row-reverse !important;\n}\n.flex-xl-column-reverse {\n    -webkit-box-orient: vertical !important;\n    -webkit-box-direction: reverse !important;\n        -ms-flex-direction: column-reverse !important;\n            flex-direction: column-reverse !important;\n}\n.flex-xl-wrap {\n    -ms-flex-wrap: wrap !important;\n        flex-wrap: wrap !important;\n}\n.flex-xl-nowrap {\n    -ms-flex-wrap: nowrap !important;\n        flex-wrap: nowrap !important;\n}\n.flex-xl-wrap-reverse {\n    -ms-flex-wrap: wrap-reverse !important;\n        flex-wrap: wrap-reverse !important;\n}\n.justify-content-xl-start {\n    -webkit-box-pack: start !important;\n        -ms-flex-pack: start !important;\n            justify-content: flex-start !important;\n}\n.justify-content-xl-end {\n    -webkit-box-pack: end !important;\n        -ms-flex-pack: end !important;\n            justify-content: flex-end !important;\n}\n.justify-content-xl-center {\n    -webkit-box-pack: center !important;\n        -ms-flex-pack: center !important;\n            justify-content: center !important;\n}\n.justify-content-xl-between {\n    -webkit-box-pack: justify !important;\n        -ms-flex-pack: justify !important;\n            justify-content: space-between !important;\n}\n.justify-content-xl-around {\n    -ms-flex-pack: distribute !important;\n        justify-content: space-around !important;\n}\n.align-items-xl-start {\n    -webkit-box-align: start !important;\n        -ms-flex-align: start !important;\n            align-items: flex-start !important;\n}\n.align-items-xl-end {\n    -webkit-box-align: end !important;\n        -ms-flex-align: end !important;\n            align-items: flex-end !important;\n}\n.align-items-xl-center {\n    -webkit-box-align: center !important;\n        -ms-flex-align: center !important;\n            align-items: center !important;\n}\n.align-items-xl-baseline {\n    -webkit-box-align: baseline !important;\n        -ms-flex-align: baseline !important;\n            align-items: baseline !important;\n}\n.align-items-xl-stretch {\n    -webkit-box-align: stretch !important;\n        -ms-flex-align: stretch !important;\n            align-items: stretch !important;\n}\n.align-content-xl-start {\n    -ms-flex-line-pack: start !important;\n        align-content: flex-start !important;\n}\n.align-content-xl-end {\n    -ms-flex-line-pack: end !important;\n        align-content: flex-end !important;\n}\n.align-content-xl-center {\n    -ms-flex-line-pack: center !important;\n        align-content: center !important;\n}\n.align-content-xl-between {\n    -ms-flex-line-pack: justify !important;\n        align-content: space-between !important;\n}\n.align-content-xl-around {\n    -ms-flex-line-pack: distribute !important;\n        align-content: space-around !important;\n}\n.align-content-xl-stretch {\n    -ms-flex-line-pack: stretch !important;\n        align-content: stretch !important;\n}\n.align-self-xl-auto {\n    -ms-flex-item-align: auto !important;\n        align-self: auto !important;\n}\n.align-self-xl-start {\n    -ms-flex-item-align: start !important;\n        align-self: flex-start !important;\n}\n.align-self-xl-end {\n    -ms-flex-item-align: end !important;\n        align-self: flex-end !important;\n}\n.align-self-xl-center {\n    -ms-flex-item-align: center !important;\n        align-self: center !important;\n}\n.align-self-xl-baseline {\n    -ms-flex-item-align: baseline !important;\n        align-self: baseline !important;\n}\n.align-self-xl-stretch {\n    -ms-flex-item-align: stretch !important;\n        align-self: stretch !important;\n}\n}\n.float-left {\n  float: left !important;\n}\n.float-right {\n  float: right !important;\n}\n.float-none {\n  float: none !important;\n}\n@media (min-width: 576px) {\n.float-sm-left {\n    float: left !important;\n}\n.float-sm-right {\n    float: right !important;\n}\n.float-sm-none {\n    float: none !important;\n}\n}\n@media (min-width: 768px) {\n.float-md-left {\n    float: left !important;\n}\n.float-md-right {\n    float: right !important;\n}\n.float-md-none {\n    float: none !important;\n}\n}\n@media (min-width: 992px) {\n.float-lg-left {\n    float: left !important;\n}\n.float-lg-right {\n    float: right !important;\n}\n.float-lg-none {\n    float: none !important;\n}\n}\n@media (min-width: 1200px) {\n.float-xl-left {\n    float: left !important;\n}\n.float-xl-right {\n    float: right !important;\n}\n.float-xl-none {\n    float: none !important;\n}\n}\n.position-static {\n  position: static !important;\n}\n.position-relative {\n  position: relative !important;\n}\n.position-absolute {\n  position: absolute !important;\n}\n.position-fixed {\n  position: fixed !important;\n}\n.position-sticky {\n  position: -webkit-sticky !important;\n  position: sticky !important;\n}\n.fixed-top {\n  position: fixed;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n.fixed-bottom {\n  position: fixed;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1030;\n}\n@supports ((position: -webkit-sticky) or (position: sticky)) {\n.sticky-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n}\n}\n.sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  -webkit-clip-path: inset(50%);\n          clip-path: inset(50%);\n  border: 0;\n}\n.sr-only-focusable:active, .sr-only-focusable:focus {\n  position: static;\n  width: auto;\n  height: auto;\n  overflow: visible;\n  clip: auto;\n  white-space: normal;\n  -webkit-clip-path: none;\n          clip-path: none;\n}\n.w-25 {\n  width: 25% !important;\n}\n.w-50 {\n  width: 50% !important;\n}\n.w-75 {\n  width: 75% !important;\n}\n.w-100 {\n  width: 100% !important;\n}\n.h-25 {\n  height: 25% !important;\n}\n.h-50 {\n  height: 50% !important;\n}\n.h-75 {\n  height: 75% !important;\n}\n.h-100 {\n  height: 100% !important;\n}\n.mw-100 {\n  max-width: 100% !important;\n}\n.mh-100 {\n  max-height: 100% !important;\n}\n.m-0 {\n  margin: 0 !important;\n}\n.mt-0,\n.my-0 {\n  margin-top: 0 !important;\n}\n.mr-0,\n.mx-0 {\n  margin-right: 0 !important;\n}\n.mb-0,\n.my-0 {\n  margin-bottom: 0 !important;\n}\n.ml-0,\n.mx-0 {\n  margin-left: 0 !important;\n}\n.m-1 {\n  margin: 0.25rem !important;\n}\n.mt-1,\n.my-1 {\n  margin-top: 0.25rem !important;\n}\n.mr-1,\n.mx-1 {\n  margin-right: 0.25rem !important;\n}\n.mb-1,\n.my-1 {\n  margin-bottom: 0.25rem !important;\n}\n.ml-1,\n.mx-1 {\n  margin-left: 0.25rem !important;\n}\n.m-2 {\n  margin: 0.5rem !important;\n}\n.mt-2,\n.my-2 {\n  margin-top: 0.5rem !important;\n}\n.mr-2,\n.mx-2 {\n  margin-right: 0.5rem !important;\n}\n.mb-2,\n.my-2 {\n  margin-bottom: 0.5rem !important;\n}\n.ml-2,\n.mx-2 {\n  margin-left: 0.5rem !important;\n}\n.m-3 {\n  margin: 1rem !important;\n}\n.mt-3,\n.my-3 {\n  margin-top: 1rem !important;\n}\n.mr-3,\n.mx-3 {\n  margin-right: 1rem !important;\n}\n.mb-3,\n.my-3 {\n  margin-bottom: 1rem !important;\n}\n.ml-3,\n.mx-3 {\n  margin-left: 1rem !important;\n}\n.m-4 {\n  margin: 1.5rem !important;\n}\n.mt-4,\n.my-4 {\n  margin-top: 1.5rem !important;\n}\n.mr-4,\n.mx-4 {\n  margin-right: 1.5rem !important;\n}\n.mb-4,\n.my-4 {\n  margin-bottom: 1.5rem !important;\n}\n.ml-4,\n.mx-4 {\n  margin-left: 1.5rem !important;\n}\n.m-5 {\n  margin: 3rem !important;\n}\n.mt-5,\n.my-5 {\n  margin-top: 3rem !important;\n}\n.mr-5,\n.mx-5 {\n  margin-right: 3rem !important;\n}\n.mb-5,\n.my-5 {\n  margin-bottom: 3rem !important;\n}\n.ml-5,\n.mx-5 {\n  margin-left: 3rem !important;\n}\n.p-0 {\n  padding: 0 !important;\n}\n.pt-0,\n.py-0 {\n  padding-top: 0 !important;\n}\n.pr-0,\n.px-0 {\n  padding-right: 0 !important;\n}\n.pb-0,\n.py-0 {\n  padding-bottom: 0 !important;\n}\n.pl-0,\n.px-0 {\n  padding-left: 0 !important;\n}\n.p-1 {\n  padding: 0.25rem !important;\n}\n.pt-1,\n.py-1 {\n  padding-top: 0.25rem !important;\n}\n.pr-1,\n.px-1 {\n  padding-right: 0.25rem !important;\n}\n.pb-1,\n.py-1 {\n  padding-bottom: 0.25rem !important;\n}\n.pl-1,\n.px-1 {\n  padding-left: 0.25rem !important;\n}\n.p-2 {\n  padding: 0.5rem !important;\n}\n.pt-2,\n.py-2 {\n  padding-top: 0.5rem !important;\n}\n.pr-2,\n.px-2 {\n  padding-right: 0.5rem !important;\n}\n.pb-2,\n.py-2 {\n  padding-bottom: 0.5rem !important;\n}\n.pl-2,\n.px-2 {\n  padding-left: 0.5rem !important;\n}\n.p-3 {\n  padding: 1rem !important;\n}\n.pt-3,\n.py-3 {\n  padding-top: 1rem !important;\n}\n.pr-3,\n.px-3 {\n  padding-right: 1rem !important;\n}\n.pb-3,\n.py-3 {\n  padding-bottom: 1rem !important;\n}\n.pl-3,\n.px-3 {\n  padding-left: 1rem !important;\n}\n.p-4 {\n  padding: 1.5rem !important;\n}\n.pt-4,\n.py-4 {\n  padding-top: 1.5rem !important;\n}\n.pr-4,\n.px-4 {\n  padding-right: 1.5rem !important;\n}\n.pb-4,\n.py-4 {\n  padding-bottom: 1.5rem !important;\n}\n.pl-4, .first-td-padding td:first-child,\n.px-4 {\n  padding-left: 1.5rem !important;\n}\n.p-5 {\n  padding: 3rem !important;\n}\n.pt-5,\n.py-5 {\n  padding-top: 3rem !important;\n}\n.pr-5,\n.px-5 {\n  padding-right: 3rem !important;\n}\n.pb-5,\n.py-5 {\n  padding-bottom: 3rem !important;\n}\n.pl-5,\n.px-5 {\n  padding-left: 3rem !important;\n}\n.m-auto {\n  margin: auto !important;\n}\n.mt-auto,\n.my-auto {\n  margin-top: auto !important;\n}\n.mr-auto,\n.mx-auto {\n  margin-right: auto !important;\n}\n.mb-auto,\n.my-auto {\n  margin-bottom: auto !important;\n}\n.ml-auto,\n.mx-auto {\n  margin-left: auto !important;\n}\n@media (min-width: 576px) {\n.m-sm-0 {\n    margin: 0 !important;\n}\n.mt-sm-0,\n  .my-sm-0 {\n    margin-top: 0 !important;\n}\n.mr-sm-0,\n  .mx-sm-0 {\n    margin-right: 0 !important;\n}\n.mb-sm-0,\n  .my-sm-0 {\n    margin-bottom: 0 !important;\n}\n.ml-sm-0,\n  .mx-sm-0 {\n    margin-left: 0 !important;\n}\n.m-sm-1 {\n    margin: 0.25rem !important;\n}\n.mt-sm-1,\n  .my-sm-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-sm-1,\n  .mx-sm-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-sm-1,\n  .my-sm-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-sm-1,\n  .mx-sm-1 {\n    margin-left: 0.25rem !important;\n}\n.m-sm-2 {\n    margin: 0.5rem !important;\n}\n.mt-sm-2,\n  .my-sm-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-sm-2,\n  .mx-sm-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-sm-2,\n  .my-sm-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-sm-2,\n  .mx-sm-2 {\n    margin-left: 0.5rem !important;\n}\n.m-sm-3 {\n    margin: 1rem !important;\n}\n.mt-sm-3,\n  .my-sm-3 {\n    margin-top: 1rem !important;\n}\n.mr-sm-3,\n  .mx-sm-3 {\n    margin-right: 1rem !important;\n}\n.mb-sm-3,\n  .my-sm-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-sm-3,\n  .mx-sm-3 {\n    margin-left: 1rem !important;\n}\n.m-sm-4 {\n    margin: 1.5rem !important;\n}\n.mt-sm-4,\n  .my-sm-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-sm-4,\n  .mx-sm-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-sm-4,\n  .my-sm-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-sm-4,\n  .mx-sm-4 {\n    margin-left: 1.5rem !important;\n}\n.m-sm-5 {\n    margin: 3rem !important;\n}\n.mt-sm-5,\n  .my-sm-5 {\n    margin-top: 3rem !important;\n}\n.mr-sm-5,\n  .mx-sm-5 {\n    margin-right: 3rem !important;\n}\n.mb-sm-5,\n  .my-sm-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-sm-5,\n  .mx-sm-5 {\n    margin-left: 3rem !important;\n}\n.p-sm-0 {\n    padding: 0 !important;\n}\n.pt-sm-0,\n  .py-sm-0 {\n    padding-top: 0 !important;\n}\n.pr-sm-0,\n  .px-sm-0 {\n    padding-right: 0 !important;\n}\n.pb-sm-0,\n  .py-sm-0 {\n    padding-bottom: 0 !important;\n}\n.pl-sm-0,\n  .px-sm-0 {\n    padding-left: 0 !important;\n}\n.p-sm-1 {\n    padding: 0.25rem !important;\n}\n.pt-sm-1,\n  .py-sm-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-sm-1,\n  .px-sm-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-sm-1,\n  .py-sm-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-sm-1,\n  .px-sm-1 {\n    padding-left: 0.25rem !important;\n}\n.p-sm-2 {\n    padding: 0.5rem !important;\n}\n.pt-sm-2,\n  .py-sm-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-sm-2,\n  .px-sm-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-sm-2,\n  .py-sm-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-sm-2,\n  .px-sm-2 {\n    padding-left: 0.5rem !important;\n}\n.p-sm-3 {\n    padding: 1rem !important;\n}\n.pt-sm-3,\n  .py-sm-3 {\n    padding-top: 1rem !important;\n}\n.pr-sm-3,\n  .px-sm-3 {\n    padding-right: 1rem !important;\n}\n.pb-sm-3,\n  .py-sm-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-sm-3,\n  .px-sm-3 {\n    padding-left: 1rem !important;\n}\n.p-sm-4 {\n    padding: 1.5rem !important;\n}\n.pt-sm-4,\n  .py-sm-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-sm-4,\n  .px-sm-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-sm-4,\n  .py-sm-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-sm-4,\n  .px-sm-4 {\n    padding-left: 1.5rem !important;\n}\n.p-sm-5 {\n    padding: 3rem !important;\n}\n.pt-sm-5,\n  .py-sm-5 {\n    padding-top: 3rem !important;\n}\n.pr-sm-5,\n  .px-sm-5 {\n    padding-right: 3rem !important;\n}\n.pb-sm-5,\n  .py-sm-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-sm-5,\n  .px-sm-5 {\n    padding-left: 3rem !important;\n}\n.m-sm-auto {\n    margin: auto !important;\n}\n.mt-sm-auto,\n  .my-sm-auto {\n    margin-top: auto !important;\n}\n.mr-sm-auto,\n  .mx-sm-auto {\n    margin-right: auto !important;\n}\n.mb-sm-auto,\n  .my-sm-auto {\n    margin-bottom: auto !important;\n}\n.ml-sm-auto,\n  .mx-sm-auto {\n    margin-left: auto !important;\n}\n}\n@media (min-width: 768px) {\n.m-md-0 {\n    margin: 0 !important;\n}\n.mt-md-0,\n  .my-md-0 {\n    margin-top: 0 !important;\n}\n.mr-md-0,\n  .mx-md-0 {\n    margin-right: 0 !important;\n}\n.mb-md-0,\n  .my-md-0 {\n    margin-bottom: 0 !important;\n}\n.ml-md-0,\n  .mx-md-0 {\n    margin-left: 0 !important;\n}\n.m-md-1 {\n    margin: 0.25rem !important;\n}\n.mt-md-1,\n  .my-md-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-md-1,\n  .mx-md-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-md-1,\n  .my-md-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-md-1,\n  .mx-md-1 {\n    margin-left: 0.25rem !important;\n}\n.m-md-2 {\n    margin: 0.5rem !important;\n}\n.mt-md-2,\n  .my-md-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-md-2,\n  .mx-md-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-md-2,\n  .my-md-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-md-2,\n  .mx-md-2 {\n    margin-left: 0.5rem !important;\n}\n.m-md-3 {\n    margin: 1rem !important;\n}\n.mt-md-3,\n  .my-md-3 {\n    margin-top: 1rem !important;\n}\n.mr-md-3,\n  .mx-md-3 {\n    margin-right: 1rem !important;\n}\n.mb-md-3,\n  .my-md-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-md-3,\n  .mx-md-3 {\n    margin-left: 1rem !important;\n}\n.m-md-4 {\n    margin: 1.5rem !important;\n}\n.mt-md-4,\n  .my-md-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-md-4,\n  .mx-md-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-md-4,\n  .my-md-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-md-4,\n  .mx-md-4 {\n    margin-left: 1.5rem !important;\n}\n.m-md-5 {\n    margin: 3rem !important;\n}\n.mt-md-5,\n  .my-md-5 {\n    margin-top: 3rem !important;\n}\n.mr-md-5,\n  .mx-md-5 {\n    margin-right: 3rem !important;\n}\n.mb-md-5,\n  .my-md-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-md-5,\n  .mx-md-5 {\n    margin-left: 3rem !important;\n}\n.p-md-0 {\n    padding: 0 !important;\n}\n.pt-md-0,\n  .py-md-0 {\n    padding-top: 0 !important;\n}\n.pr-md-0,\n  .px-md-0 {\n    padding-right: 0 !important;\n}\n.pb-md-0,\n  .py-md-0 {\n    padding-bottom: 0 !important;\n}\n.pl-md-0,\n  .px-md-0 {\n    padding-left: 0 !important;\n}\n.p-md-1 {\n    padding: 0.25rem !important;\n}\n.pt-md-1,\n  .py-md-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-md-1,\n  .px-md-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-md-1,\n  .py-md-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-md-1,\n  .px-md-1 {\n    padding-left: 0.25rem !important;\n}\n.p-md-2 {\n    padding: 0.5rem !important;\n}\n.pt-md-2,\n  .py-md-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-md-2,\n  .px-md-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-md-2,\n  .py-md-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-md-2,\n  .px-md-2 {\n    padding-left: 0.5rem !important;\n}\n.p-md-3 {\n    padding: 1rem !important;\n}\n.pt-md-3,\n  .py-md-3 {\n    padding-top: 1rem !important;\n}\n.pr-md-3,\n  .px-md-3 {\n    padding-right: 1rem !important;\n}\n.pb-md-3,\n  .py-md-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-md-3,\n  .px-md-3 {\n    padding-left: 1rem !important;\n}\n.p-md-4 {\n    padding: 1.5rem !important;\n}\n.pt-md-4,\n  .py-md-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-md-4,\n  .px-md-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-md-4,\n  .py-md-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-md-4,\n  .px-md-4 {\n    padding-left: 1.5rem !important;\n}\n.p-md-5 {\n    padding: 3rem !important;\n}\n.pt-md-5,\n  .py-md-5 {\n    padding-top: 3rem !important;\n}\n.pr-md-5,\n  .px-md-5 {\n    padding-right: 3rem !important;\n}\n.pb-md-5,\n  .py-md-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-md-5,\n  .px-md-5 {\n    padding-left: 3rem !important;\n}\n.m-md-auto {\n    margin: auto !important;\n}\n.mt-md-auto,\n  .my-md-auto {\n    margin-top: auto !important;\n}\n.mr-md-auto,\n  .mx-md-auto {\n    margin-right: auto !important;\n}\n.mb-md-auto,\n  .my-md-auto {\n    margin-bottom: auto !important;\n}\n.ml-md-auto,\n  .mx-md-auto {\n    margin-left: auto !important;\n}\n}\n@media (min-width: 992px) {\n.m-lg-0 {\n    margin: 0 !important;\n}\n.mt-lg-0,\n  .my-lg-0 {\n    margin-top: 0 !important;\n}\n.mr-lg-0,\n  .mx-lg-0 {\n    margin-right: 0 !important;\n}\n.mb-lg-0,\n  .my-lg-0 {\n    margin-bottom: 0 !important;\n}\n.ml-lg-0,\n  .mx-lg-0 {\n    margin-left: 0 !important;\n}\n.m-lg-1 {\n    margin: 0.25rem !important;\n}\n.mt-lg-1,\n  .my-lg-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-lg-1,\n  .mx-lg-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-lg-1,\n  .my-lg-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-lg-1,\n  .mx-lg-1 {\n    margin-left: 0.25rem !important;\n}\n.m-lg-2 {\n    margin: 0.5rem !important;\n}\n.mt-lg-2,\n  .my-lg-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-lg-2,\n  .mx-lg-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-lg-2,\n  .my-lg-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-lg-2,\n  .mx-lg-2 {\n    margin-left: 0.5rem !important;\n}\n.m-lg-3 {\n    margin: 1rem !important;\n}\n.mt-lg-3,\n  .my-lg-3 {\n    margin-top: 1rem !important;\n}\n.mr-lg-3,\n  .mx-lg-3 {\n    margin-right: 1rem !important;\n}\n.mb-lg-3,\n  .my-lg-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-lg-3,\n  .mx-lg-3 {\n    margin-left: 1rem !important;\n}\n.m-lg-4 {\n    margin: 1.5rem !important;\n}\n.mt-lg-4,\n  .my-lg-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-lg-4,\n  .mx-lg-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-lg-4,\n  .my-lg-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-lg-4,\n  .mx-lg-4 {\n    margin-left: 1.5rem !important;\n}\n.m-lg-5 {\n    margin: 3rem !important;\n}\n.mt-lg-5,\n  .my-lg-5 {\n    margin-top: 3rem !important;\n}\n.mr-lg-5,\n  .mx-lg-5 {\n    margin-right: 3rem !important;\n}\n.mb-lg-5,\n  .my-lg-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-lg-5,\n  .mx-lg-5 {\n    margin-left: 3rem !important;\n}\n.p-lg-0 {\n    padding: 0 !important;\n}\n.pt-lg-0,\n  .py-lg-0 {\n    padding-top: 0 !important;\n}\n.pr-lg-0,\n  .px-lg-0 {\n    padding-right: 0 !important;\n}\n.pb-lg-0,\n  .py-lg-0 {\n    padding-bottom: 0 !important;\n}\n.pl-lg-0,\n  .px-lg-0 {\n    padding-left: 0 !important;\n}\n.p-lg-1 {\n    padding: 0.25rem !important;\n}\n.pt-lg-1,\n  .py-lg-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-lg-1,\n  .px-lg-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-lg-1,\n  .py-lg-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-lg-1,\n  .px-lg-1 {\n    padding-left: 0.25rem !important;\n}\n.p-lg-2 {\n    padding: 0.5rem !important;\n}\n.pt-lg-2,\n  .py-lg-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-lg-2,\n  .px-lg-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-lg-2,\n  .py-lg-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-lg-2,\n  .px-lg-2 {\n    padding-left: 0.5rem !important;\n}\n.p-lg-3 {\n    padding: 1rem !important;\n}\n.pt-lg-3,\n  .py-lg-3 {\n    padding-top: 1rem !important;\n}\n.pr-lg-3,\n  .px-lg-3 {\n    padding-right: 1rem !important;\n}\n.pb-lg-3,\n  .py-lg-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-lg-3,\n  .px-lg-3 {\n    padding-left: 1rem !important;\n}\n.p-lg-4 {\n    padding: 1.5rem !important;\n}\n.pt-lg-4,\n  .py-lg-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-lg-4,\n  .px-lg-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-lg-4,\n  .py-lg-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-lg-4,\n  .px-lg-4 {\n    padding-left: 1.5rem !important;\n}\n.p-lg-5 {\n    padding: 3rem !important;\n}\n.pt-lg-5,\n  .py-lg-5 {\n    padding-top: 3rem !important;\n}\n.pr-lg-5,\n  .px-lg-5 {\n    padding-right: 3rem !important;\n}\n.pb-lg-5,\n  .py-lg-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-lg-5,\n  .px-lg-5 {\n    padding-left: 3rem !important;\n}\n.m-lg-auto {\n    margin: auto !important;\n}\n.mt-lg-auto,\n  .my-lg-auto {\n    margin-top: auto !important;\n}\n.mr-lg-auto,\n  .mx-lg-auto {\n    margin-right: auto !important;\n}\n.mb-lg-auto,\n  .my-lg-auto {\n    margin-bottom: auto !important;\n}\n.ml-lg-auto,\n  .mx-lg-auto {\n    margin-left: auto !important;\n}\n}\n@media (min-width: 1200px) {\n.m-xl-0 {\n    margin: 0 !important;\n}\n.mt-xl-0,\n  .my-xl-0 {\n    margin-top: 0 !important;\n}\n.mr-xl-0,\n  .mx-xl-0 {\n    margin-right: 0 !important;\n}\n.mb-xl-0,\n  .my-xl-0 {\n    margin-bottom: 0 !important;\n}\n.ml-xl-0,\n  .mx-xl-0 {\n    margin-left: 0 !important;\n}\n.m-xl-1 {\n    margin: 0.25rem !important;\n}\n.mt-xl-1,\n  .my-xl-1 {\n    margin-top: 0.25rem !important;\n}\n.mr-xl-1,\n  .mx-xl-1 {\n    margin-right: 0.25rem !important;\n}\n.mb-xl-1,\n  .my-xl-1 {\n    margin-bottom: 0.25rem !important;\n}\n.ml-xl-1,\n  .mx-xl-1 {\n    margin-left: 0.25rem !important;\n}\n.m-xl-2 {\n    margin: 0.5rem !important;\n}\n.mt-xl-2,\n  .my-xl-2 {\n    margin-top: 0.5rem !important;\n}\n.mr-xl-2,\n  .mx-xl-2 {\n    margin-right: 0.5rem !important;\n}\n.mb-xl-2,\n  .my-xl-2 {\n    margin-bottom: 0.5rem !important;\n}\n.ml-xl-2,\n  .mx-xl-2 {\n    margin-left: 0.5rem !important;\n}\n.m-xl-3 {\n    margin: 1rem !important;\n}\n.mt-xl-3,\n  .my-xl-3 {\n    margin-top: 1rem !important;\n}\n.mr-xl-3,\n  .mx-xl-3 {\n    margin-right: 1rem !important;\n}\n.mb-xl-3,\n  .my-xl-3 {\n    margin-bottom: 1rem !important;\n}\n.ml-xl-3,\n  .mx-xl-3 {\n    margin-left: 1rem !important;\n}\n.m-xl-4 {\n    margin: 1.5rem !important;\n}\n.mt-xl-4,\n  .my-xl-4 {\n    margin-top: 1.5rem !important;\n}\n.mr-xl-4,\n  .mx-xl-4 {\n    margin-right: 1.5rem !important;\n}\n.mb-xl-4,\n  .my-xl-4 {\n    margin-bottom: 1.5rem !important;\n}\n.ml-xl-4,\n  .mx-xl-4 {\n    margin-left: 1.5rem !important;\n}\n.m-xl-5 {\n    margin: 3rem !important;\n}\n.mt-xl-5,\n  .my-xl-5 {\n    margin-top: 3rem !important;\n}\n.mr-xl-5,\n  .mx-xl-5 {\n    margin-right: 3rem !important;\n}\n.mb-xl-5,\n  .my-xl-5 {\n    margin-bottom: 3rem !important;\n}\n.ml-xl-5,\n  .mx-xl-5 {\n    margin-left: 3rem !important;\n}\n.p-xl-0 {\n    padding: 0 !important;\n}\n.pt-xl-0,\n  .py-xl-0 {\n    padding-top: 0 !important;\n}\n.pr-xl-0,\n  .px-xl-0 {\n    padding-right: 0 !important;\n}\n.pb-xl-0,\n  .py-xl-0 {\n    padding-bottom: 0 !important;\n}\n.pl-xl-0,\n  .px-xl-0 {\n    padding-left: 0 !important;\n}\n.p-xl-1 {\n    padding: 0.25rem !important;\n}\n.pt-xl-1,\n  .py-xl-1 {\n    padding-top: 0.25rem !important;\n}\n.pr-xl-1,\n  .px-xl-1 {\n    padding-right: 0.25rem !important;\n}\n.pb-xl-1,\n  .py-xl-1 {\n    padding-bottom: 0.25rem !important;\n}\n.pl-xl-1,\n  .px-xl-1 {\n    padding-left: 0.25rem !important;\n}\n.p-xl-2 {\n    padding: 0.5rem !important;\n}\n.pt-xl-2,\n  .py-xl-2 {\n    padding-top: 0.5rem !important;\n}\n.pr-xl-2,\n  .px-xl-2 {\n    padding-right: 0.5rem !important;\n}\n.pb-xl-2,\n  .py-xl-2 {\n    padding-bottom: 0.5rem !important;\n}\n.pl-xl-2,\n  .px-xl-2 {\n    padding-left: 0.5rem !important;\n}\n.p-xl-3 {\n    padding: 1rem !important;\n}\n.pt-xl-3,\n  .py-xl-3 {\n    padding-top: 1rem !important;\n}\n.pr-xl-3,\n  .px-xl-3 {\n    padding-right: 1rem !important;\n}\n.pb-xl-3,\n  .py-xl-3 {\n    padding-bottom: 1rem !important;\n}\n.pl-xl-3,\n  .px-xl-3 {\n    padding-left: 1rem !important;\n}\n.p-xl-4 {\n    padding: 1.5rem !important;\n}\n.pt-xl-4,\n  .py-xl-4 {\n    padding-top: 1.5rem !important;\n}\n.pr-xl-4,\n  .px-xl-4 {\n    padding-right: 1.5rem !important;\n}\n.pb-xl-4,\n  .py-xl-4 {\n    padding-bottom: 1.5rem !important;\n}\n.pl-xl-4,\n  .px-xl-4 {\n    padding-left: 1.5rem !important;\n}\n.p-xl-5 {\n    padding: 3rem !important;\n}\n.pt-xl-5,\n  .py-xl-5 {\n    padding-top: 3rem !important;\n}\n.pr-xl-5,\n  .px-xl-5 {\n    padding-right: 3rem !important;\n}\n.pb-xl-5,\n  .py-xl-5 {\n    padding-bottom: 3rem !important;\n}\n.pl-xl-5,\n  .px-xl-5 {\n    padding-left: 3rem !important;\n}\n.m-xl-auto {\n    margin: auto !important;\n}\n.mt-xl-auto,\n  .my-xl-auto {\n    margin-top: auto !important;\n}\n.mr-xl-auto,\n  .mx-xl-auto {\n    margin-right: auto !important;\n}\n.mb-xl-auto,\n  .my-xl-auto {\n    margin-bottom: auto !important;\n}\n.ml-xl-auto,\n  .mx-xl-auto {\n    margin-left: auto !important;\n}\n}\n.text-justify {\n  text-align: justify !important;\n}\n.text-nowrap {\n  white-space: nowrap !important;\n}\n.text-truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.text-left {\n  text-align: left !important;\n}\n.text-right {\n  text-align: right !important;\n}\n.text-center {\n  text-align: center !important;\n}\n@media (min-width: 576px) {\n.text-sm-left {\n    text-align: left !important;\n}\n.text-sm-right {\n    text-align: right !important;\n}\n.text-sm-center {\n    text-align: center !important;\n}\n}\n@media (min-width: 768px) {\n.text-md-left {\n    text-align: left !important;\n}\n.text-md-right {\n    text-align: right !important;\n}\n.text-md-center {\n    text-align: center !important;\n}\n}\n@media (min-width: 992px) {\n.text-lg-left {\n    text-align: left !important;\n}\n.text-lg-right {\n    text-align: right !important;\n}\n.text-lg-center {\n    text-align: center !important;\n}\n}\n@media (min-width: 1200px) {\n.text-xl-left {\n    text-align: left !important;\n}\n.text-xl-right {\n    text-align: right !important;\n}\n.text-xl-center {\n    text-align: center !important;\n}\n}\n.text-lowercase {\n  text-transform: lowercase !important;\n}\n.text-uppercase {\n  text-transform: uppercase !important;\n}\n.text-capitalize {\n  text-transform: capitalize !important;\n}\n.font-weight-light {\n  font-weight: 300 !important;\n}\n.font-weight-normal {\n  font-weight: 400 !important;\n}\n.font-weight-bold {\n  font-weight: 700 !important;\n}\n.font-italic {\n  font-style: italic !important;\n}\n.text-white {\n  color: #fff !important;\n}\n.text-primary {\n  color: #f7c980 !important;\n}\na.text-primary:hover, a.text-primary:focus {\n  color: #f4b550 !important;\n}\n.text-secondary {\n  color: #fff !important;\n}\na.text-secondary:hover, a.text-secondary:focus {\n  color: #e6e6e6 !important;\n}\n.text-success {\n  color: #c8f9c5 !important;\n}\na.text-success:hover, a.text-success:focus {\n  color: #9cf497 !important;\n}\n.text-info {\n  color: #4ab2e3 !important;\n}\na.text-info:hover, a.text-info:focus {\n  color: #219ed9 !important;\n}\n.text-warning {\n  color: #f7c980 !important;\n}\na.text-warning:hover, a.text-warning:focus {\n  color: #f4b550 !important;\n}\n.text-danger {\n  color: #e34a4a !important;\n}\na.text-danger:hover, a.text-danger:focus {\n  color: #d92121 !important;\n}\n.text-light {\n  color: #eff4f5 !important;\n}\na.text-light:hover, a.text-light:focus {\n  color: #d0dee1 !important;\n}\n.text-dark {\n  color: #161616 !important;\n}\na.text-dark:hover, a.text-dark:focus {\n  color: black !important;\n}\n.text-pale {\n  color: #d9d9d9 !important;\n}\na.text-pale:hover, a.text-pale:focus {\n  color: silver !important;\n}\n.text-muted {\n  color: #6c757d !important;\n}\n.text-hide {\n  font: 0/0 a;\n  color: transparent;\n  text-shadow: none;\n  background-color: transparent;\n  border: 0;\n}\n.visible {\n  visibility: visible !important;\n}\n.invisible {\n  visibility: hidden !important;\n}\n@media print {\n*,\n  *::before,\n  *::after {\n    text-shadow: none !important;\n    -webkit-box-shadow: none !important;\n            box-shadow: none !important;\n}\na:not(.btn) {\n    text-decoration: underline;\n}\nabbr[title]::after {\n    content: \" (\" attr(title) \")\";\n}\npre {\n    white-space: pre-wrap !important;\n}\npre,\n  blockquote {\n    border: 1px solid #999;\n    page-break-inside: avoid;\n}\nthead {\n    display: table-header-group;\n}\ntr,\n  img {\n    page-break-inside: avoid;\n}\np,\n  h2,\n  h3 {\n    orphans: 3;\n    widows: 3;\n}\nh2,\n  h3 {\n    page-break-after: avoid;\n}\n@page {\n    size: a3;\n}\nbody {\n    min-width: 992px !important;\n}\n.container {\n    min-width: 992px !important;\n}\n.navbar {\n    display: none;\n}\n.badge {\n    border: 1px solid #000;\n}\n.table {\n    border-collapse: collapse !important;\n}\n.table td,\n    .table th {\n      background-color: #fff !important;\n}\n.table-bordered th,\n  .table-bordered td {\n    border: 1px solid #ddd !important;\n}\n}\nhtml {\n  min-height: 100%;\n}\nbody {\n  height: 100%;\n  min-height: 100vh;\n  position: relative;\n  font-family: Arial, \\5FAE\\8EDF\\6B63\\9ED1\\9AD4, \"Microsoft JhengHei\", \"PingFangTC-Regular\";\n}\n.ellipsis {\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n}\n.widget-viewport-height {\n  height: calc(100vh - 72px - 24px - 24px);\n}\n.none {\n  display: none;\n}\n.pointer {\n  cursor: pointer;\n}\na:not([href]):not([tabindex]) {\n  color: #fff;\n  cursor: pointer;\n}\na:not([href]):not([tabindex]):hover {\n  color: #fff;\n  cursor: pointer;\n}\na:not([href]):not([tabindex]):focus {\n  color: #fff;\n  cursor: pointer;\n}\n.content {\n  padding: 150px 50px 100px 300px;\n}\n.top-tool {\n  margin-bottom: 10px;\n  text-align: right;\n}\ntable th {\n  width: 140px;\n  text-align: center;\n}\ntable td {\n  width: 300px;\n  text-align: left;\n}\ntable .d-inline-block {\n  margin-right: 10px;\n}\n.sets-list .small-set {\n  width: 200px;\n  height: 200px;\n  margin: 0 0 1.5rem;\n}\n.sets-list .small-set .btn {\n    width: 13.75rem;\n    padding-left: 0;\n    padding-right: 0;\n    text-align: center;\n}\n.sets-list .small-set .set-content {\n    background-color: #eee;\n    border: 1px solid #acb5be;\n    border-radius: 4px;\n    height: 100%;\n    position: relative;\n}\n.sets-list .small-set .set-content > div {\n      padding: 1rem;\n}\n.sets-list .small-set .set-content > div div[class^=\"col\"] {\n        padding: 0;\n        margin: 1rem 0;\n}\n.sets-list .small-set .set-content > div div[class^=\"col\"] .icon {\n          font-size: .85rem;\n          text-align: center;\n}\n.sets-list .small-set .set-content .set-title {\n      border-bottom: 1px solid #acb5be;\n}\n.sets-list .small-set .set-content .overlay {\n      padding: 0;\n      margin: 0;\n      width: 100%;\n      height: 100%;\n      position: absolute;\n      /*visibility: hidden;*/\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-align: center;\n          -ms-flex-align: center;\n              align-items: center;\n      -webkit-box-pack: center;\n          -ms-flex-pack: center;\n              justify-content: center;\n      z-index: 2;\n}\nh1, h2, h3, h4, h5, h6, strong, b {\n  font-weight: 600;\n}\n.vue-highlighted-text {\n  background-color: #dbf9e7;\n}\n.vue-selected-text, ::-moz-selection {\n  background-color: #f7c980;\n  color: #fff;\n}\n.vue-selected-text, ::selection {\n  background-color: #f7c980;\n  color: #fff;\n}\nul.vue-list-inner li:first-child, ol.vue-list-inner li:first-child {\n  margin-top: 1.5rem;\n}\nul.vue-list-inner li:last-child, ol.vue-list-inner li:last-child {\n  padding-bottom: 0;\n}\nul.vue-unordered {\n  padding: 0;\n  list-style-type: none;\n}\nul.vue-unordered ul {\n    padding: 0;\n    list-style-type: none;\n}\nul.vue-unordered li {\n    padding-left: 1.563rem;\n    padding-bottom: 1.5rem;\n}\nul.vue-unordered li::before {\n      content: \"\";\n      display: inline-block;\n      width: 0.75rem;\n      height: 0.75rem;\n      position: relative;\n      right: 1.563rem;\n      top: 0.0625rem;\n      margin-right: -0.75em;\n      border-radius: 0.75rem;\n      background-color: #4ae387;\n}\nul.vue-unordered li li::before {\n      background-color: #fff;\n      border: 2.5px solid #4ae387;\n}\nol.vue-ordered {\n  padding: 0;\n  counter-reset: olCounter;\n}\nol.vue-ordered li {\n    list-style: none;\n    padding-left: 1.563rem;\n    padding-bottom: 1.5rem;\n}\nol.vue-ordered > li:before {\n    counter-increment: olCounter;\n    content: counter(olCounter) \". \";\n    display: inline-block;\n    width: 0.75rem;\n    height: 0.75rem;\n    position: relative;\n    right: 1.563rem;\n    top: 0.0625rem;\n    margin-right: -0.75em;\n}\nol.vue-ordered ul {\n    padding: 0;\n    list-style-type: none;\n}\nol.vue-ordered ul li {\n      padding-left: 1.563rem;\n}\nol.vue-ordered ul li::before {\n        content: \"\";\n        display: inline-block;\n        width: 0.75rem;\n        height: 0.75rem;\n        position: relative;\n        right: 1.563rem;\n        top: 0.0625rem;\n        margin-right: -0.75em;\n        border-radius: 0.75rem;\n        background-color: #4ae387;\n}\n.vue-misc {\n  margin-top: 5.625rem;\n  margin-bottom: 2rem;\n}\n.well {\n  padding: 1.9rem 2.2rem 1.9rem 1.6rem;\n  background-color: #eee;\n}\n.button-container {\n  text-align: center;\n}\nfieldset {\n  padding: 0;\n  border: none;\n}\n.form-group {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  min-height: 2.25rem;\n  margin-top: 0.2rem;\n  margin-bottom: 2.25rem;\n}\n.form-group .input-group {\n    -ms-flex-item-align: end;\n        align-self: flex-end;\n}\n.form-group .input-icon {\n    position: absolute;\n    top: 0.4375rem;\n    color: #b3b3b3;\n}\n.form-group .text-secondary {\n    color: #b3b3b3 !important;\n}\n.form-group a.text-secondary:hover, .form-group a.text-secondary:focus {\n    color: #999999 !important;\n}\n.form-group .input-group {\n    position: relative;\n    display: block;\n}\n.form-group.select-form-group .dropdown-toggle::after {\n    display: none;\n}\n.form-group.select-form-group .dropdown-menu {\n    width: 100%;\n}\n.form-group.select-form-group .dropdown-item {\n    cursor: pointer;\n    -webkit-box-pack: justify;\n        -ms-flex-pack: justify;\n            justify-content: space-between;\n}\n.form-group.select-form-group .dropdown-item .selected-icon {\n      display: none;\n      margin-left: 0.35rem;\n}\n.form-group.select-form-group .dropdown-item.selected {\n      color: #f7c980;\n}\n.form-group.select-form-group .dropdown-item.selected .selected-icon {\n        display: inline-block;\n}\n.form-group.select-form-group .input-icon {\n    color: gray;\n    font-size: 0.8rem;\n    top: 1rem;\n}\n.form-group.select-form-group .bar::before {\n    display: none;\n}\n.form-group.form-group-w-btn .btn {\n    -ms-flex-item-align: end;\n        align-self: flex-end;\n}\n.form-group.with-icon-right input {\n    padding-right: 1.375rem;\n}\n.form-group.with-icon-right .icon-right {\n    right: 0;\n}\n.form-group.with-icon-left input,\n  .form-group.with-icon-left textarea {\n    padding-left: 1.375rem;\n}\n.form-group.with-icon-left input ~ .control-label,\n    .form-group.with-icon-left textarea ~ .control-label {\n      padding-left: 1.375rem;\n}\n.form-group.with-icon-left select,\n  .form-group.with-icon-left input:focus,\n  .form-group.with-icon-left input:valid,\n  .form-group.with-icon-left input.form-file,\n  .form-group.with-icon-left input.has-value,\n  .form-group.with-icon-left textarea:focus,\n  .form-group.with-icon-left textarea:valid,\n  .form-group.with-icon-left textarea.form-file,\n  .form-group.with-icon-left textarea.has-value {\n    color: #34495e;\n}\n.form-group.with-icon-left select ~ .control-label,\n    .form-group.with-icon-left input:focus ~ .control-label,\n    .form-group.with-icon-left input:valid ~ .control-label,\n    .form-group.with-icon-left input.form-file ~ .control-label,\n    .form-group.with-icon-left input.has-value ~ .control-label,\n    .form-group.with-icon-left textarea:focus ~ .control-label,\n    .form-group.with-icon-left textarea:valid ~ .control-label,\n    .form-group.with-icon-left textarea.form-file ~ .control-label,\n    .form-group.with-icon-left textarea.has-value ~ .control-label {\n      padding-left: 0;\n}\n.form-group.with-icon-left .icon-left {\n    left: 0;\n}\n.form-group .error-icon, .form-group .valid-icon {\n    display: none;\n}\n.form-inline > .form-group,\n.form-inline > .btn {\n  display: inline-block;\n  margin-bottom: 0;\n}\n.form-help {\n  margin-top: 0.125rem;\n  margin-left: 0.125rem;\n  color: #b3b3b3;\n  font-size: 0.6rem;\n}\n.form-group .form-help {\n    position: absolute;\n    width: 100%;\n}\n.checkbox .form-help {\n    position: relative;\n    margin-bottom: 1rem;\n}\n.form-group input, .form-group textarea.chat {\n  height: 1.9rem;\n}\n.form-group textarea {\n  resize: none;\n}\n.form-group select {\n  width: 100%;\n  font-size: 1rem;\n  height: 1.6rem;\n  padding: 0.125rem 0.125rem 0.0625rem;\n  background: none;\n  border: none;\n  line-height: 1.6;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\n.form-group .control-label {\n  position: absolute;\n  top: 0.25rem;\n  left: 0;\n  max-width: 100%;\n  overflow: hidden;\n  white-space: nowrap;\n  text-overflow: ellipsis;\n  pointer-events: none;\n  padding-left: 0.125rem;\n  z-index: 1;\n  color: #b3b3b3;\n  font-size: 1rem;\n  font-weight: normal;\n  -webkit-transition: all 0.28s ease;\n  transition: all 0.28s ease;\n}\n.form-group .bar {\n  position: relative;\n  border-bottom: 0.0625rem solid #999;\n  display: block;\n}\n.form-group .bar::before {\n    content: '';\n    height: 0.125rem;\n    width: 0;\n    left: 50%;\n    bottom: -0.0625rem;\n    position: absolute;\n    background: #555;\n    -webkit-transition: left 0.28s ease, width 0.28s ease;\n    transition: left 0.28s ease, width 0.28s ease;\n    z-index: 2;\n}\n.form-group input,\n.form-group textarea {\n  display: block;\n  background: none;\n  padding: 0.125rem 0.125rem 0.0625rem;\n  font-size: 1rem;\n  border-width: 0;\n  border-color: transparent;\n  line-height: 1.9;\n  width: 100%;\n  color: transparent;\n  -webkit-transition: all 0.28s ease;\n  transition: all 0.28s ease;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\n.form-group input[type=\"file\"] {\n  line-height: 1;\n}\n.form-group input[type=\"file\"] ~ .bar {\n    display: none;\n}\n.form-group.show input,\n.form-group select,\n.form-group input:focus,\n.form-group input:valid,\n.form-group input.form-file,\n.form-group input.has-value,\n.form-group textarea:focus,\n.form-group textarea:valid,\n.form-group textarea.form-file,\n.form-group textarea.has-value {\n  color: #34495e;\n}\n.form-group.show input ~ .control-label,\n  .form-group select ~ .control-label,\n  .form-group input:focus ~ .control-label,\n  .form-group input:valid ~ .control-label,\n  .form-group input.form-file ~ .control-label,\n  .form-group input.has-value ~ .control-label,\n  .form-group textarea:focus ~ .control-label,\n  .form-group textarea:valid ~ .control-label,\n  .form-group textarea.form-file ~ .control-label,\n  .form-group textarea.has-value ~ .control-label {\n    font-size: 0.6rem;\n    color: #f7c980;\n    font-weight: 600;\n    text-transform: uppercase;\n    top: -0.6rem;\n    left: 0;\n}\n.form-group select:focus,\n.form-group input:focus,\n.form-group textarea:focus {\n  outline: none;\n}\n.form-group select:focus ~ .control-label,\n  .form-group input:focus ~ .control-label,\n  .form-group textarea:focus ~ .control-label {\n    color: #f7c980;\n}\n.form-group select:focus ~ .bar::before,\n  .form-group input:focus ~ .bar::before,\n  .form-group textarea:focus ~ .bar::before {\n    width: 100%;\n    left: 0;\n}\n.valid .legend.legend,\n.valid.form-group .control-label.control-label {\n  color: #f7c980;\n}\n.valid .valid-icon {\n  display: inline-block;\n  color: #f7c980;\n}\n.has-error .legend.legend,\n.has-error.form-group .control-label.control-label {\n  color: #e34a4a;\n}\n.has-error .error-icon {\n  display: inline-block;\n  color: #e34a4a;\n}\n.has-error.form-group .icon-right {\n  color: #e34a4a;\n}\n.has-error.form-group .form-help,\n.has-error.form-group .helper, .has-error.checkbox .form-help,\n.has-error.checkbox .helper {\n  color: #e34a4a;\n}\n.has-error .bar::before {\n  background: #e34a4a;\n  left: 0;\n  width: 100%;\n}\n.navbar .navbar-nav > .nav-item > .nav-link {\n  padding-right: 38px;\n  padding-left: 38px;\n  line-height: 0;\n}\n.navbar .navbar-nav > .nav-item {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.navbar-text {\n  color: #fff;\n}\nh1, .h1 {\n  margin-bottom: 2.25rem;\n}\nh2, .h2 {\n  margin-bottom: 2rem;\n}\nh3, .h3 {\n  margin-bottom: 1.5rem;\n}\nh4, .h4 {\n  margin-bottom: 1rem;\n}\n.blockquote {\n  padding: 0 1.625rem;\n  margin: 2.5rem 0 2.5rem 1rem;\n  border-left: 0.375rem solid #4ae387;\n  line-height: 2rem;\n  color: #acb5be;\n  font-style: oblique;\n}\n.blockquote-footer::before {\n  content: \"--- \";\n}\n.btn {\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n  font-family: inherit;\n  letter-spacing: 3px;\n  text-transform: uppercase;\n  cursor: pointer;\n}\n.btn.dropdown-toggle.theme-toggle {\n    padding: 1.1rem 3.9rem;\n    font-size: 1rem;\n    line-height: 1.25;\n    border-radius: 1.875rem;\n}\n.btn:focus, .btn:active, .btn.focus {\n    -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n            box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n}\n.btn.btn-sm, .btn-group-sm > .btn {\n  padding: 0.7rem 2.5rem;\n  font-size: 1rem;\n  line-height: 1.25;\n  border-radius: 1.875rem;\n}\n.btn.btn-micro {\n  padding: 0.625rem 1.8rem;\n  font-size: 85%;\n  line-height: 1.25;\n  border-radius: 1.875rem;\n}\n.btn.btn-primary, .medium-editor-toolbar .medium-editor-action {\n  background-color: #f7c980;\n  color: #fff;\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n  border: none;\n}\n.btn.btn-primary:hover, .medium-editor-toolbar .medium-editor-action:hover {\n    color: #fff;\n    background-color: #faddb0;\n}\n.btn.btn-primary.active, .medium-editor-toolbar .active.medium-editor-action, .btn.btn-primary:active, .medium-editor-toolbar .medium-editor-action:active, .btn.btn-primary:not([disabled]):not(.disabled):active, .medium-editor-toolbar .medium-editor-action:not([disabled]):not(.disabled):active, .btn.btn-primary:not([disabled]):not(.disabled).active, .medium-editor-toolbar .medium-editor-action:not([disabled]):not(.disabled).active {\n    background-color: #f2aa38;\n    -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n            box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n    color: #fff;\n}\n.btn.btn-primary.active:focus, .medium-editor-toolbar .active.medium-editor-action:focus, .btn.btn-primary:active:focus, .medium-editor-toolbar .medium-editor-action:active:focus, .btn.btn-primary:not([disabled]):not(.disabled):active:focus, .medium-editor-toolbar .medium-editor-action:not([disabled]):not(.disabled):active:focus, .btn.btn-primary:not([disabled]):not(.disabled).active:focus, .medium-editor-toolbar .medium-editor-action:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n              box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n}\n.btn.btn-primary[disabled], .medium-editor-toolbar .medium-editor-action[disabled], .btn.btn-primary[disabled]:hover, .medium-editor-toolbar .medium-editor-action[disabled]:hover {\n    background-color: #f2aa38;\n    color: #d1850d;\n    opacity: 0.5;\n}\n.btn.btn-primary.hover, .medium-editor-toolbar .hover.medium-editor-action {\n    background-color: #faddb0 !important;\n    color: #fff;\n}\n.btn.btn-primary.focus, .medium-editor-toolbar .focus.medium-editor-action {\n    background-color: #f2aa38;\n    color: #fff;\n}\n.btn.btn-secondary {\n  background-color: #f7c980;\n  color: #fff;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n  border: 2px solid #f7c980;\n  color: #f7c980;\n  border: 2px solid #f7c980;\n  background-color: #fff;\n}\n.btn.btn-secondary:hover {\n    color: #fff;\n    background-color: #faddb0;\n}\n.btn.btn-secondary.active, .btn.btn-secondary:active, .btn.btn-secondary:not([disabled]):not(.disabled):active, .btn.btn-secondary:not([disabled]):not(.disabled).active {\n    background-color: #f2aa38;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    color: #fff;\n}\n.btn.btn-secondary.active:focus, .btn.btn-secondary:active:focus, .btn.btn-secondary:not([disabled]):not(.disabled):active:focus, .btn.btn-secondary:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: none;\n              box-shadow: none;\n}\n.btn.btn-secondary[disabled], .btn.btn-secondary[disabled]:hover {\n    background-color: #f2aa38;\n    color: #d1850d;\n    opacity: 0.5;\n}\n.btn.btn-secondary[disabled], .btn.btn-secondary[disabled]:hover {\n    background-color: #fff;\n    color: #f7c980;\n    border: 2px solid #f7c980;\n}\n.btn.btn-secondary:hover {\n    border: 2px solid #faddb0;\n}\n.btn.btn-secondary.hover {\n    border: 2px solid #faddb0 !important;\n    background-color: #faddb0 !important;\n    color: #fff;\n}\n.btn.btn-secondary:active, .btn.btn-secondary:focus, .btn.btn-secondary.focus {\n    border: 2px solid #f2aa38 !important;\n    background-color: #f2aa38 !important;\n    color: #fff;\n}\n.btn.btn-danger {\n  background-color: #e34a4a;\n  color: #fff;\n  -webkit-box-shadow: 0px 4px 70px -16px #e34a4a;\n          box-shadow: 0px 4px 70px -16px #e34a4a;\n  border: none;\n}\n.btn.btn-danger:hover {\n    color: #fff;\n    background-color: #ea7676;\n}\n.btn.btn-danger.active, .btn.btn-danger:active, .btn.btn-danger:not([disabled]):not(.disabled):active, .btn.btn-danger:not([disabled]):not(.disabled).active {\n    background-color: #c21e1e;\n    -webkit-box-shadow: 0px 4px 70px -16px #e34a4a;\n            box-shadow: 0px 4px 70px -16px #e34a4a;\n    color: #fff;\n}\n.btn.btn-danger.active:focus, .btn.btn-danger:active:focus, .btn.btn-danger:not([disabled]):not(.disabled):active:focus, .btn.btn-danger:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0px 4px 70px -16px #e34a4a;\n              box-shadow: 0px 4px 70px -16px #e34a4a;\n}\n.btn.btn-danger[disabled], .btn.btn-danger[disabled]:hover {\n    background-color: #c21e1e;\n    color: #801414;\n    opacity: 0.5;\n}\n.btn.btn-warning {\n  background-color: #f7c980;\n  color: #fff;\n  -webkit-box-shadow: 0px 4px 70px -16px #f7c980;\n          box-shadow: 0px 4px 70px -16px #f7c980;\n  border: none;\n}\n.btn.btn-warning:hover {\n    color: #fff;\n    background-color: #faddb0;\n}\n.btn.btn-warning.active, .btn.btn-warning:active, .btn.btn-warning:not([disabled]):not(.disabled):active, .btn.btn-warning:not([disabled]):not(.disabled).active {\n    background-color: #f2aa38;\n    -webkit-box-shadow: 0px 4px 70px -16px #f7c980;\n            box-shadow: 0px 4px 70px -16px #f7c980;\n    color: #fff;\n}\n.btn.btn-warning.active:focus, .btn.btn-warning:active:focus, .btn.btn-warning:not([disabled]):not(.disabled):active:focus, .btn.btn-warning:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0px 4px 70px -16px #f7c980;\n              box-shadow: 0px 4px 70px -16px #f7c980;\n}\n.btn.btn-warning[disabled], .btn.btn-warning[disabled]:hover {\n    background-color: #f2aa38;\n    color: #d1850d;\n    opacity: 0.5;\n}\n.btn.btn-info {\n  background-color: #4ab2e3;\n  color: #fff;\n  -webkit-box-shadow: 0px 4px 70px -16px #4ab2e3;\n          box-shadow: 0px 4px 70px -16px #4ab2e3;\n  border: none;\n}\n.btn.btn-info:hover {\n    color: #fff;\n    background-color: #76c5ea;\n}\n.btn.btn-info.active, .btn.btn-info:active, .btn.btn-info:not([disabled]):not(.disabled):active, .btn.btn-info:not([disabled]):not(.disabled).active {\n    background-color: #1e8ec2;\n    -webkit-box-shadow: 0px 4px 70px -16px #4ab2e3;\n            box-shadow: 0px 4px 70px -16px #4ab2e3;\n    color: #fff;\n}\n.btn.btn-info.active:focus, .btn.btn-info:active:focus, .btn.btn-info:not([disabled]):not(.disabled):active:focus, .btn.btn-info:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0px 4px 70px -16px #4ab2e3;\n              box-shadow: 0px 4px 70px -16px #4ab2e3;\n}\n.btn.btn-info[disabled], .btn.btn-info[disabled]:hover {\n    background-color: #1e8ec2;\n    color: #145d80;\n    opacity: 0.5;\n}\n.btn.btn-success {\n  background-color: #f7c980;\n  color: #fff;\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n  border: none;\n}\n.btn.btn-success:hover {\n    color: #fff;\n    background-color: #faddb0;\n}\n.btn.btn-success.active, .btn.btn-success:active, .btn.btn-success:not([disabled]):not(.disabled):active, .btn.btn-success:not([disabled]):not(.disabled).active {\n    background-color: #f2aa38;\n    -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n            box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n    color: #fff;\n}\n.btn.btn-success.active:focus, .btn.btn-success:active:focus, .btn.btn-success:not([disabled]):not(.disabled):active:focus, .btn.btn-success:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n              box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n}\n.btn.btn-success[disabled], .btn.btn-success[disabled]:hover {\n    background-color: #f2aa38;\n    color: #d1850d;\n    opacity: 0.5;\n}\n.btn.btn-dark {\n  background-color: #161616;\n  color: #fff;\n  -webkit-box-shadow: 0px 4px 70px -16px #161616;\n          box-shadow: 0px 4px 70px -16px #161616;\n  border: none;\n}\n.btn.btn-dark:hover {\n    color: #fff;\n    background-color: #303030;\n}\n.btn.btn-dark.active, .btn.btn-dark:active, .btn.btn-dark:not([disabled]):not(.disabled):active, .btn.btn-dark:not([disabled]):not(.disabled).active {\n    background-color: black;\n    -webkit-box-shadow: 0px 4px 70px -16px #161616;\n            box-shadow: 0px 4px 70px -16px #161616;\n    color: #fff;\n}\n.btn.btn-dark.active:focus, .btn.btn-dark:active:focus, .btn.btn-dark:not([disabled]):not(.disabled):active:focus, .btn.btn-dark:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0px 4px 70px -16px #161616;\n              box-shadow: 0px 4px 70px -16px #161616;\n}\n.btn.btn-dark[disabled], .btn.btn-dark[disabled]:hover {\n    background-color: black;\n    color: black;\n    opacity: 0.5;\n}\n.btn.btn-pale {\n  background-color: #d9d9d9;\n  color: #fff;\n  -webkit-box-shadow: 0px 4px 70px -16px #d9d9d9;\n          box-shadow: 0px 4px 70px -16px #d9d9d9;\n  border: none;\n}\n.btn.btn-pale:hover {\n    color: #fff;\n    background-color: #f3f3f3;\n}\n.btn.btn-pale.active, .btn.btn-pale:active, .btn.btn-pale:not([disabled]):not(.disabled):active, .btn.btn-pale:not([disabled]):not(.disabled).active {\n    background-color: #b3b3b3;\n    -webkit-box-shadow: 0px 4px 70px -16px #d9d9d9;\n            box-shadow: 0px 4px 70px -16px #d9d9d9;\n    color: #fff;\n}\n.btn.btn-pale.active:focus, .btn.btn-pale:active:focus, .btn.btn-pale:not([disabled]):not(.disabled):active:focus, .btn.btn-pale:not([disabled]):not(.disabled).active:focus {\n      -webkit-box-shadow: 0px 4px 70px -16px #d9d9d9;\n              box-shadow: 0px 4px 70px -16px #d9d9d9;\n}\n.btn.btn-pale[disabled], .btn.btn-pale[disabled]:hover {\n    background-color: #b3b3b3;\n    color: #8d8d8d;\n    opacity: 0.5;\n}\n.btn.btn-pale:hover {\n    background-color: #e6e6e6;\n}\n.btn.btn-pale:hover:focus, .btn.btn-pale:hover:active, .btn.btn-pale:hover.active {\n      background-color: #b3b3b3;\n}\n.btn.btn-with-icon {\n  position: relative;\n  padding: 1.1rem 2.8125rem;\n}\n.btn.btn-with-icon .btn-with-icon-content {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n.btn.btn-with-icon i {\n    position: absolute;\n    left: 2.8125rem;\n    top: 0.75rem;\n    font-size: 2rem;\n}\n.btn.btn-with-icon.rounded-icon {\n    width: 3.5rem;\n    height: 3.5rem;\n    border-radius: 50%;\n    padding: 0;\n}\n.btn.btn-with-icon.rounded-icon i {\n      left: 1.23rem;\n}\n.btn.btn-with-icon.rounded-icon.btn-micro {\n      height: 2.25rem;\n      width: 2.25rem;\n      -webkit-box-flex: 0;\n          -ms-flex: none;\n              flex: none;\n}\n.btn.btn-with-icon.rounded-icon.btn-micro i {\n        font-size: 1.5rem;\n        left: 0.46rem;\n        top: 0.4rem;\n}\n.btn-group {\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n  border-radius: 1.875rem;\n}\n.btn-group .btn {\n    padding-left: 1.53rem;\n    padding-right: 1.53rem;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n}\n.btn.dropdown-toggle {\n  position: relative;\n}\n.btn.dropdown-toggle .arrow-down {\n    position: absolute;\n    font-size: 1rem;\n    right: 1rem;\n    top: calc(50% - 1rem/1.4);\n}\n.btn.dropdown-toggle::after {\n    display: none;\n}\n.btn-group {\n  color: #fff;\n}\n.dropdown-menu {\n  border-radius: 0;\n  padding: 10px 0;\n  background: transparent;\n  border: none;\n}\n.dropdown-menu .dropdown-menu-content {\n    background-color: #333;\n    -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n            box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n}\n.dropdown-item {\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n  height: 40px;\n  font-size: 0.875rem;\n}\n@media (min-width: 768px) {\n.row > .col-8-custom {\n    width: 12.5%;\n}\n}\n@media (min-width: 576px) and (max-width: 767.98px) {\n.row > .col-8-custom {\n    width: 25%;\n}\n}\n@media (max-width: 575.98px) {\n.row > .col-8-custom {\n    width: 100%;\n}\n}\n.error-icon {\n  display: inline-block;\n  color: #e34a4a;\n}\n.success-icon {\n  display: inline-block;\n  color: #4ae387;\n}\n.table-striped tbody tr:nth-of-type(odd) {\n  background-color: #fff;\n}\n.table-striped tbody tr:nth-of-type(odd):hover {\n    background-color: #f7c980;\n}\n.table-striped tbody tr:nth-of-type(even) {\n  background-color: #fff6e8;\n}\n.table-striped tbody tr:nth-of-type(even):hover {\n    background-color: #f7c980;\n}\n.table thead tr {\n  border-bottom: 2px solid #555555;\n  color: #6d451b;\n  font-size: 14px;\n  font-weight: bold;\n  text-transform: uppercase;\n}\n.table td, .table th, .table thead th, .table thead td {\n  vertical-align: middle !important;\n  padding: .5rem;\n}\n.table .badge {\n  vertical-align: text-top;\n}\n.table .table-info {\n  background-color: #dcf1ff;\n}\n.table .table-warning {\n  background-color: #fff1c8;\n}\n.table .table-success, .table .table-success > td, .table .table-success > th {\n  background-color: #c8fac6;\n}\n.table .table-danger {\n  background-color: #ffcece;\n}\n.sort-icon {\n  float: none !important;\n  margin-left: .2rem;\n  top: 1px;\n  font-size: 1rem;\n}\nth.sortable:hover {\n  color: #4ae387 !important;\n  opacity: .6;\n}\n.badge {\n  min-width: 5rem;\n  display: inline-block;\n  font-weight: bold;\n  text-transform: uppercase;\n  font-size: .625rem;\n  color: #fff;\n  letter-spacing: .0625rem;\n}\n.badge-violet {\n  color: #fff;\n  background-color: #db76df;\n}\n.badge-violet[href]:hover, .badge-violet[href]:focus {\n    color: #fff;\n    text-decoration: none;\n    background-color: #d04dd5;\n}\n.badge-dark-blue {\n  color: #fff;\n  background-color: #0045b6;\n}\n.badge-dark-blue[href]:hover, .badge-dark-blue[href]:focus {\n    color: #fff;\n    text-decoration: none;\n    background-color: #003283;\n}\n.badge-success {\n  color: #fff;\n  background-color: #f7c980;\n}\n.badge-success[href]:hover, .badge-success[href]:focus {\n    color: #fff;\n    text-decoration: none;\n    background-color: #f4b550;\n}\n.alert {\n  position: relative;\n  display: -webkit-box;\n  display: -ms-flexbox;\n  display: flex;\n  -webkit-box-orient: horizontal;\n  -webkit-box-direction: normal;\n      -ms-flex-direction: row;\n          flex-direction: row;\n  -webkit-box-align: center;\n      -ms-flex-align: center;\n          align-items: center;\n}\n.alert .badge {\n    margin-right: 0.63rem;\n}\n.alert.with-close {\n    padding-right: 3.125rem;\n}\n.alert .alert-close {\n    position: absolute;\n    right: 20px;\n    font-size: 1rem;\n    top: calc(50% - 1rem/2);\n    cursor: pointer;\n}\n.alert-success {\n  -webkit-box-shadow: 0px 4px 9.6px 0.4px rgba(79, 206, 145, 0.5);\n          box-shadow: 0px 4px 9.6px 0.4px rgba(79, 206, 145, 0.5);\n}\n.alert-success .alert-close {\n    color: #f7c980;\n}\n.alert-warning {\n  -webkit-box-shadow: 0px 4px 9.6px 0.4px rgba(206, 178, 79, 0.5);\n          box-shadow: 0px 4px 9.6px 0.4px rgba(206, 178, 79, 0.5);\n}\n.alert-warning .alert-close {\n    color: #f7c980;\n}\n.alert-danger {\n  -webkit-box-shadow: 0px 4px 9.6px 0.4px rgba(206, 79, 79, 0.5);\n          box-shadow: 0px 4px 9.6px 0.4px rgba(206, 79, 79, 0.5);\n}\n.alert-danger .alert-close {\n    color: #e34a4a;\n}\n.alert-info {\n  -webkit-box-shadow: 0px 4px 9.6px 0.4px rgba(79, 142, 206, 0.5);\n          box-shadow: 0px 4px 9.6px 0.4px rgba(79, 142, 206, 0.5);\n}\n.alert-info .alert-close {\n    color: #4ab2e3;\n}\n.alert-primary {\n  color: #806943;\n  background-color: #fdf4e6;\n  border-color: #fdf0db;\n}\n.alert-primary hr {\n    border-top-color: #fce6c3;\n}\n.alert-primary .alert-link {\n    color: #5f4e31;\n}\n.alert-secondary {\n  color: #858585;\n  background-color: white;\n  border-color: white;\n}\n.alert-secondary hr {\n    border-top-color: #f2f2f2;\n}\n.alert-secondary .alert-link {\n    color: #6c6c6c;\n}\n.alert-success {\n  color: #34495e;\n  background-color: #c8f9c5;\n  border-color: transparent;\n}\n.alert-success hr {\n    border-top-color: transparent;\n}\n.alert-success .alert-link {\n    color: #22303d;\n}\n.alert-info {\n  color: #34495e;\n  background-color: #dcf1ff;\n  border-color: transparent;\n}\n.alert-info hr {\n    border-top-color: transparent;\n}\n.alert-info .alert-link {\n    color: #22303d;\n}\n.alert-warning {\n  color: #34495e;\n  background-color: #fff1c8;\n  border-color: transparent;\n}\n.alert-warning hr {\n    border-top-color: transparent;\n}\n.alert-warning .alert-link {\n    color: #22303d;\n}\n.alert-danger {\n  color: #34495e;\n  background-color: #ffcece;\n  border-color: transparent;\n}\n.alert-danger hr {\n    border-top-color: transparent;\n}\n.alert-danger .alert-link {\n    color: #22303d;\n}\n.alert-light {\n  color: #7c7f7f;\n  background-color: #fcfdfd;\n  border-color: #fbfcfc;\n}\n.alert-light hr {\n    border-top-color: #ecf1f1;\n}\n.alert-light .alert-link {\n    color: #636565;\n}\n.alert-dark {\n  color: #0b0b0b;\n  background-color: #d0d0d0;\n  border-color: #bebebe;\n}\n.alert-dark hr {\n    border-top-color: #b1b1b1;\n}\n.alert-dark .alert-link {\n    color: black;\n}\n.alert-pale {\n  color: #717171;\n  background-color: #f7f7f7;\n  border-color: #f4f4f4;\n}\n.alert-pale hr {\n    border-top-color: #e7e7e7;\n}\n.alert-pale .alert-link {\n    color: #585858;\n}\n.abc-checkbox label .abc-label-text, .abc-radio label .abc-label-text {\n  display: inline-block;\n  position: relative;\n  top: 2px;\n}\n.abc-checkbox label::before, .abc-radio label::before {\n  width: 22px;\n  height: 22px;\n  border: 2px solid #ddd;\n  -webkit-transition: border 0.15s ease-in-out, color 0.15s ease-in-out, background-color 0.15s ease-in-out;\n  transition: border 0.15s ease-in-out, color 0.15s ease-in-out, background-color 0.15s ease-in-out;\n}\n.abc-checkbox {\n  padding-left: 20px;\n}\n.abc-checkbox label {\n    padding-left: 0;\n}\n.abc-checkbox label::before {\n      border-radius: 0;\n      -webkit-transition: border 0.15s ease-in-out, color 0.15s ease-in-out, background-color 0.15s ease-in-out;\n      transition: border 0.15s ease-in-out, color 0.15s ease-in-out, background-color 0.15s ease-in-out;\n}\n.abc-checkbox label::after {\n      width: 20px;\n      height: 20px;\n      top: 2px;\n      left: 2px;\n}\n.abc-checkbox input[type=\"checkbox\"]:focus + label::before,\n  .abc-checkbox input[type=\"radio\"]:focus + label::before {\n    outline: none;\n}\n.abc-checkbox input[type=\"checkbox\"]:disabled + label,\n  .abc-checkbox input[type=\"radio\"]:disabled + label {\n    opacity: 0.5;\n}\n.abc-radio label {\n  padding-left: 0;\n}\n.abc-radio label::after {\n    width: 10px;\n    height: 10px;\n    top: 7.8px;\n    left: 6px;\n}\n.abc-radio input[type=\"radio\"]:focus + label::before {\n  outline: none;\n}\n.medium-editor-toolbar,\n.medium-editor-toolbar-form,\n.medium-editor-toolbar-actions,\n.medium-editor-toolbar-anchor-preview {\n  background-color: #f7c980;\n  border-radius: 1.875rem;\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n}\n.medium-editor-toolbar {\n  max-width: 80%;\n  -webkit-box-shadow: none;\n          box-shadow: none;\n}\n.medium-editor-toolbar .medium-editor-toolbar-actions {\n    overflow: hidden;\n}\n.medium-editor-toolbar .medium-editor-action {\n    height: 3.45rem;\n    padding: 1.1rem 1.53rem;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n    border-radius: 0;\n}\n.medium-editor-toolbar .medium-editor-action.medium-editor-button-active {\n      background-color: #f2aa38;\n}\n.medium-editor-toolbar-form {\n  color: #fff;\n  overflow: hidden;\n}\n.medium-editor-toolbar-form .medium-editor-toolbar-input {\n    height: 3.45rem;\n    background: #f7c980;\n    -webkit-box-sizing: border-box;\n            box-sizing: border-box;\n    color: #fff;\n    padding-left: 16px;\n    width: 220px;\n}\n.medium-editor-toolbar-form .medium-editor-toolbar-input::-webkit-input-placeholder {\n      color: rgba(255, 255, 255, 0.8);\n}\n.medium-editor-toolbar-form .medium-editor-toolbar-input:-moz-placeholder {\n      /* Firefox 18- */\n      color: rgba(255, 255, 255, 0.8);\n}\n.medium-editor-toolbar-form .medium-editor-toolbar-input::-moz-placeholder {\n      /* Firefox 19+ */\n      color: rgba(255, 255, 255, 0.8);\n}\n.medium-editor-toolbar-form .medium-editor-toolbar-input:-ms-input-placeholder {\n      color: rgba(255, 255, 255, 0.8);\n}\n.medium-editor-toolbar-form a {\n    color: #fff;\n    -webkit-transform: translateY(2px);\n            transform: translateY(2px);\n}\n.medium-editor-toolbar-form .medium-editor-toolbar-close {\n    margin-right: 16px;\n}\n.medium-toolbar-arrow-under:after {\n  border-color: #f7c980 transparent transparent transparent;\n  top: 3.45rem;\n}\n.medium-toolbar-arrow-over:before {\n  border-color: transparent transparent #f7c980 transparent;\n}\n.medium-editor-toolbar-anchor-preview {\n  padding: 1.1rem 3.9rem;\n  font-size: 1rem;\n  line-height: 1.25;\n  border-radius: 1.875rem;\n}\n.medium-editor-toolbar-anchor-preview .medium-editor-toolbar-anchor-preview {\n    margin: 0;\n}\n.medium-editor-anchor-preview {\n  max-width: 50%;\n}\n.medium-editor-anchor-preview a {\n    color: #fff;\n    text-decoration: none;\n}\n.tooltip.vuestic-tooltip .tooltip-inner {\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n  line-height: 1.13;\n  font-weight: 300;\n  border-radius: 0;\n}\n.tooltip.vuestic-tooltip[x-placement^=\"right\"] {\n  margin-left: .15rem;\n}\n.tooltip.vuestic-tooltip[x-placement^=\"left\"] {\n  margin-right: .15rem;\n}\n.tooltip.vuestic-tooltip.popover {\n  line-height: 1.13;\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n}\n.tooltip.vuestic-tooltip.popover .popover-header, .tooltip.vuestic-tooltip.popover .popover-body {\n    text-align: left;\n    padding-right: 0;\n}\n.tooltip.vuestic-tooltip.popover .popover-inner {\n    max-width: 100%;\n    -webkit-box-shadow: none;\n            box-shadow: none;\n}\n.tooltip.vuestic-tooltip.popover .popover-inner > * {\n      display: -webkit-box;\n      display: -ms-flexbox;\n      display: flex;\n      -webkit-box-orient: horizontal;\n      -webkit-box-direction: normal;\n          -ms-flex-direction: row;\n              flex-direction: row;\n}\n.tooltip.vuestic-tooltip.popover .popover-header {\n    font-weight: bold;\n}\n.tooltip.vuestic-tooltip.popover .popover-icon {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    color: #f7c980;\n    font-size: 1.35rem;\n}\n.tooltip.vuestic-tooltip.popover .popover-content:first-child .popover-header, .tooltip.vuestic-tooltip.popover .popover-content:first-child .popover-body {\n    padding: 0 0;\n    padding-right: 0;\n}\n.toasted-container.full-width {\n  max-width: 100%;\n  width: calc(100% - 24px - 44px);\n  -webkit-transform: translateX(0);\n          transform: translateX(0);\n  left: 0;\n}\n.toasted-container.full-width .toasted.vuestic-toast {\n    max-width: 100%;\n    width: 100%;\n    left: 24px;\n    -webkit-box-pack: normal;\n        -ms-flex-pack: normal;\n            justify-content: normal;\n}\n@media (max-width: 991.98px) {\n.toasted-container.full-width {\n      width: calc(100% - 1rem - 1rem);\n      left: 0;\n}\n.toasted-container.full-width .toasted.vuestic-toast {\n        left: 1rem;\n}\n}\n.toasted.vuestic-toast {\n  min-height: 3.25rem;\n  padding: 0.5rem 1.15rem;\n  font-size: 1rem;\n  font-weight: normal;\n  line-height: 1.13;\n  background: rgba(51, 51, 51, 0.9);\n  -webkit-box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n          box-shadow: 0 4px 9.6px 0.4px rgba(74, 227, 135, 0.5);\n  color: #fff;\n  border-radius: 0.5rem;\n}\n.toasted.vuestic-toast i, .toasted.vuestic-toast i.fa {\n    font-size: 1.35rem;\n    color: #f7c980;\n    margin-left: 0;\n    margin-right: 0.625rem;\n}\n.toasted.vuestic-toast a.action:hover {\n    text-decoration: none;\n}\n.layout-fixed .navbar {\n  position: fixed;\n  top: 0;\n  width: 100%;\n  z-index: 1;\n}\n.navbar.app-navbar {\n  height: 72px;\n  padding-left: 24px;\n  padding-right: 44px;\n  background-color: #333;\n}\n.navbar.app-navbar .navbar-container {\n    width: 100%;\n    height: 100%;\n    margin: 0;\n}\n.navbar.app-navbar .avatar-container {\n    display: inline-block;\n    width: 50px;\n    height: 50px;\n    background-color: white;\n    border-radius: 50%;\n    border: 2px solid #ddd;\n    overflow: hidden;\n}\n.navbar.app-navbar .avatar-container img {\n      height: 100%;\n      width: 100%;\n}\n.navbar.app-navbar .menu-icon-container {\n    padding: 0;\n    font-size: 1rem;\n}\n.navbar.app-navbar .navbar-brand-container {\n    position: absolute;\n    z-index: 3;\n    height: 100%;\n    left: 75px;\n    top: 0;\n}\n.navbar.app-navbar .navbar-brand-container .navbar-brand {\n      color: #f7c980;\n}\n.navbar.app-navbar .nav-item {\n    padding: 0;\n    height: 100%;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-toggle {\n    padding: 0;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-toggle:after {\n      display: none;\n}\n@media (min-width: 992px) {\n.navbar.app-navbar .dropdown.navbar-dropdown.show .dropdown-menu {\n      left: auto;\n      right: 0;\n}\n}\n.navbar.app-navbar .dropdown.navbar-dropdown.show:after {\n    position: absolute;\n    bottom: -1.125rem;\n    right: calc(50% - 10px);\n    width: 0;\n    height: 0;\n    display: block;\n    content: '';\n    border-left: 10px solid transparent;\n    border-right: 10px solid transparent;\n    border-bottom: 10px solid #333;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-menu {\n    margin-top: 1.125rem;\n    padding-top: 0;\n    width: 100%;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item {\n    height: 48px;\n    cursor: pointer;\n    font-size: 1rem;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item:hover, .navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item:active, .navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item:focus, .navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item.active {\n      outline: none;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item.plain-link-item {\n      color: #f7c980;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item.plain-link-item:hover, .navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item.plain-link-item:active, .navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item.plain-link-item:focus {\n        background: #333;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown .dropdown-item.plain-link-item .plain-link {\n        text-decoration: none;\n}\n.navbar.app-navbar .notify {\n    position: relative;\n}\n.navbar.app-navbar .notify::after {\n      content: '';\n      position: absolute;\n      right: -6px;\n      top: -6px;\n      background-color: #f7c980;\n      height: 12px;\n      width: 12px;\n      border-radius: 50%;\n}\n.navbar.app-navbar .i-nav-notification.notify::after {\n    right: -4px;\n    top: 0;\n}\n@media (max-width: 991.98px) {\n.navbar.app-navbar {\n      height: 5.625rem;\n      padding: 3rem 0.875rem 1.375rem 0.875rem;\n}\n.navbar.app-navbar .navbar-brand-container {\n        width: 4rem;\n        top: 0.875rem;\n        left: calc(50% - 4rem);\n        height: auto;\n}\n.navbar.app-navbar .navbar-brand-container .navbar-brand {\n          height: 85%;\n          padding: 0;\n          font-size: 85%;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown.show {\n        display: -webkit-box;\n        display: -ms-flexbox;\n        display: flex;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown.show:after {\n          bottom: -2rem;\n          z-index: 2;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown.show .dropdown-menu {\n          margin-top: 2rem;\n          left: auto;\n}\n.navbar.app-navbar .dropdown.navbar-dropdown.show .dropdown-menu.last {\n            right: 0;\n}\n}\n.sidebar {\n  height: calc(100vh - 72px - 24px - 24px);\n  position: absolute;\n  width: 225px;\n  top: calc(72px + 24px);\n  left: 24px;\n  -webkit-transition: all 0.2s ease;\n  transition: all 0.2s ease;\n  opacity: 1;\n}\n@media (max-width: 991.98px) {\n.sidebar {\n      top: 5.8125rem;\n      left: 0.1875rem;\n      width: calc(100% - 0.375rem);\n      z-index: 1000;\n}\n}\n.sidebar .scrollbar-wrapper {\n    -webkit-box-shadow: 0px 8px 14.72px 1.28px rgba(101, 169, 119, 0.3);\n            box-shadow: 0px 8px 14.72px 1.28px rgba(101, 169, 119, 0.3);\n}\n.sidebar .scrollbar-content {\n    background: #333;\n}\n.sidebar-hidden_without-animation .sidebar {\n    -webkit-transition: none;\n    transition: none;\n}\n.sidebar-hidden .sidebar {\n    top: -150px;\n    opacity: 0;\n    z-index: -1000;\n}\n@media (max-width: 991.98px) {\n.sidebar-hidden .sidebar {\n        top: 5.8125rem;\n        opacity: 0;\n        z-index: 1000;\n        height: 0;\n}\n}\n.sidebar .sidebar-link {\n    position: relative;\n    height: 64px;\n    padding-left: 25px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    cursor: pointer;\n    text-decoration: none;\n}\n.sidebar .sidebar-link.router-link-active, .sidebar .sidebar-link:hover {\n      color: #fff;\n      background-color: #161616;\n}\n.sidebar .sidebar-link.router-link-active .sidebar-menu-item-icon,\n      .sidebar .sidebar-link.router-link-active .expand-icon, .sidebar .sidebar-link:hover .sidebar-menu-item-icon,\n      .sidebar .sidebar-link:hover .expand-icon {\n        color: #fff;\n}\n.sidebar .sidebar-link .expand-icon {\n      position: absolute;\n      right: 16px;\n      top: calc(50% - 16px/2);\n      font-weight: bold;\n      -webkit-transition: -webkit-transform 0.3s ease;\n      transition: -webkit-transform 0.3s ease;\n      transition: transform 0.3s ease;\n      transition: transform 0.3s ease, -webkit-transform 0.3s ease;\n}\n.sidebar .sidebar-link.expanded .expand-icon {\n      -webkit-transform: rotate(180deg);\n              transform: rotate(180deg);\n}\n.sidebar .sidebar-link .sidebar-menu-item-icon {\n      font-size: 19px;\n      color: #4ae387;\n      margin-right: 14px;\n}\n.sidebar .sidebar-link .sidebar-menu-item-icon.fa-dashboard {\n        /* Temp fix */\n        position: relative;\n        top: -2px;\n}\n.sidebar .sidebar-submenu-link {\n    height: 48px;\n}\n.sidebar .sidebar-menu,\n  .sidebar .sidebar-submenu {\n    list-style: none;\n    padding-left: 0;\n}\n.sidebar .sidebar-menu li,\n    .sidebar .sidebar-submenu li {\n      display: block;\n      padding-left: 0;\n}\n.sidebar .sidebar-submenu .sidebar-link {\n    padding-left: 74px;\n    font-size: 85%;\n}\n.sidebar .sidebar-menu {\n    max-height: 100%;\n    margin-bottom: 0;\n}\n.sidebar .expand-icon {\n    color: #4ae387;\n}\n.sidebar a {\n    color: #fff;\n    text-decoration: none;\n}\n#department .day th, #department .job th {\n  width: 50px;\n  text-align: center;\n}\n#department .live th {\n  width: 230px;\n  text-align: center;\n}\n", ""]);

// exports


/***/ }),
/* 16 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// import {mapGetters, mapActions} from 'vuex'
// import LanguageSelector from './LanguageSelector'
/* harmony default export */ __webpack_exports__["default"] = ({
  name: 'navbar',
  components: {
    // LanguageSelector
  },
  data: function data() {
    return {
      langs: [{
        code: 'gb',
        name: 'english'
      }, {
        code: 'es',
        name: 'spanish'
      }]
    };
  },

  computed: {
    // ...mapGetters([
    //   'sidebarOpened',
    //   'toggleWithoutAnimation'
    // ])
  },
  methods: {
    // ...mapActions([
    //   'closeMenu',
    //   'toggleSidebar',
    //   'isToggleWithoutAnimation'
    // ])
  }
});

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("nav", { staticClass: "navbar app-navbar navbar-toggleable-md" }, [
    _c(
      "div",
      {
        staticClass:
          "navbar-brand-container d-flex align-items-center justify-content-start"
      },
      [
        _c(
          "router-link",
          { staticClass: "navbar-brand", attrs: { to: "/dashboard" } },
          [_c("i", { staticClass: "fab fa-google" })]
        )
      ],
      1
    ),
    _vm._v(" "),
    _c(
      "div",
      { staticClass: "row navbar-container" },
      [
        _c(
          "div",
          {
            staticClass:
              "menu-icon-container d-flex align-items-center justify-content-center justify-content-lg-start col"
          },
          [
            _vm.sidebarOpened
              ? _c("a", {
                  staticClass: "menu-icon i-menu-expanded",
                  attrs: { href: "#" },
                  on: {
                    click: function($event) {
                      $event.preventDefault()
                      _vm.toggleSidebar(false)
                    }
                  }
                })
              : _c("a", {
                  staticClass: "menu-icon i-menu-collapsed",
                  attrs: { href: "#" },
                  on: {
                    click: function($event) {
                      $event.preventDefault()
                      _vm.toggleSidebar(true)
                    }
                  }
                })
          ]
        ),
        _vm._v(" "),
        _c("div", {
          staticClass:
            "navbar-text offset-md-1 col-md-7 d-none d-lg-flex align-items-center justify-content-center"
        }),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [{ name: "dropdown", rawName: "v-dropdown" }],
            staticClass:
              "col nav-item dropdown navbar-dropdown d-flex align-items-center justify-content-center"
          },
          [
            _c("a", {
              staticClass:
                "nav-link dropdown-toggle d-flex align-items-center justify-content",
              attrs: { href: "#" },
              on: {
                click: function($event) {
                  $event.preventDefault()
                  return _vm.closeMenu($event)
                }
              }
            }),
            _vm._v(" "),
            _vm._m(0)
          ]
        ),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [{ name: "dropdown", rawName: "v-dropdown" }],
            staticClass:
              "col nav-item dropdown navbar-dropdown d-flex align-items-center justify-content-center"
          },
          [
            _c("a", {
              staticClass:
                "nav-link dropdown-toggle d-flex align-items-center justify-content",
              attrs: { href: "#" },
              on: {
                click: function($event) {
                  $event.preventDefault()
                  return _vm.closeMenu($event)
                }
              }
            }),
            _vm._v(" "),
            _c("div", { staticClass: "dropdown-menu" }, [
              _c("div", { staticClass: "dropdown-menu-content" }, [
                _c("a", { staticClass: "dropdown-item", attrs: { href: "#" } }),
                _vm._v(" "),
                _c("a", { staticClass: "dropdown-item", attrs: { href: "#" } }),
                _vm._v(" "),
                _c("a", { staticClass: "dropdown-item", attrs: { href: "#" } }),
                _vm._v(" "),
                _c("div", { staticClass: "dropdown-item plain-link-item" }, [
                  _c("a", { staticClass: "plain-link", attrs: { href: "#" } }, [
                    _vm._v(_vm._s(_vm._f("translate")("notifications.all")))
                  ])
                ])
              ])
            ])
          ]
        ),
        _vm._v(" "),
        _c("language-selector", { attrs: { options: _vm.langs } }),
        _vm._v(" "),
        _c(
          "div",
          {
            directives: [{ name: "dropdown", rawName: "v-dropdown" }],
            staticClass:
              "col nav-item dropdown navbar-dropdown d-flex align-items-center justify-content-center"
          },
          [
            _c(
              "a",
              {
                staticClass:
                  "nav-link dropdown-toggle d-flex align-items-center justify-content",
                attrs: { href: "#" },
                on: {
                  click: function($event) {
                    $event.preventDefault()
                    return _vm.closeMenu($event)
                  }
                }
              },
              [_vm._m(1)]
            ),
            _vm._v(" "),
            _c("div", { staticClass: "dropdown-menu last" }, [
              _c("div", { staticClass: "dropdown-menu-content" }, [
                _c("div", { staticClass: "dropdown-item plain-link-item" }, [
                  _c("a", { staticClass: "plain-link", attrs: { href: "#" } }, [
                    _vm._v(_vm._s(_vm._f("translate")("user.profile")))
                  ])
                ]),
                _vm._v(" "),
                _c("div", { staticClass: "dropdown-item plain-link-item" }, [
                  _c("a", { staticClass: "plain-link", attrs: { href: "#" } }, [
                    _vm._v(_vm._s(_vm._f("translate")("user.logout")))
                  ])
                ])
              ])
            ])
          ]
        )
      ],
      1
    )
  ])
}
var staticRenderFns = [
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("div", { staticClass: "dropdown-menu" }, [
      _c("div", { staticClass: "dropdown-menu-content" }, [
        _c("a", { staticClass: "dropdown-item", attrs: { href: "#" } }),
        _vm._v(" "),
        _c("a", { staticClass: "dropdown-item", attrs: { href: "#" } }),
        _vm._v(" "),
        _c("div", { staticClass: "dropdown-item plain-link-item" })
      ])
    ])
  },
  function() {
    var _vm = this
    var _h = _vm.$createElement
    var _c = _vm._self._c || _h
    return _c("span", { staticClass: "avatar-container" }, [
      _c("img", {
        attrs: {
          src:
            "https://osclass.calinbehtuk.ro/oc-content/themes/vrisko/images/no_user.png"
        }
      })
    ])
  }
]
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-1cbfb92d", module.exports)
  }
}

/***/ }),
/* 18 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* WEBPACK VAR INJECTION */(function(global) {/**!
 * @fileOverview Kickass library to create and place poppers near their reference elements.
 * @version 1.14.3
 * @license
 * Copyright (c) 2016 Federico Zivolo and contributors
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

var longerTimeoutBrowsers = ['Edge', 'Trident', 'Firefox'];
var timeoutDuration = 0;
for (var i = 0; i < longerTimeoutBrowsers.length; i += 1) {
  if (isBrowser && navigator.userAgent.indexOf(longerTimeoutBrowsers[i]) >= 0) {
    timeoutDuration = 1;
    break;
  }
}

function microtaskDebounce(fn) {
  var called = false;
  return function () {
    if (called) {
      return;
    }
    called = true;
    window.Promise.resolve().then(function () {
      called = false;
      fn();
    });
  };
}

function taskDebounce(fn) {
  var scheduled = false;
  return function () {
    if (!scheduled) {
      scheduled = true;
      setTimeout(function () {
        scheduled = false;
        fn();
      }, timeoutDuration);
    }
  };
}

var supportsMicroTasks = isBrowser && window.Promise;

/**
* Create a debounced version of a method, that's asynchronously deferred
* but called in the minimum time possible.
*
* @method
* @memberof Popper.Utils
* @argument {Function} fn
* @returns {Function}
*/
var debounce = supportsMicroTasks ? microtaskDebounce : taskDebounce;

/**
 * Check if the given variable is a function
 * @method
 * @memberof Popper.Utils
 * @argument {Any} functionToCheck - variable to check
 * @returns {Boolean} answer to: is a function?
 */
function isFunction(functionToCheck) {
  var getType = {};
  return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
}

/**
 * Get CSS computed property of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Eement} element
 * @argument {String} property
 */
function getStyleComputedProperty(element, property) {
  if (element.nodeType !== 1) {
    return [];
  }
  // NOTE: 1 DOM access here
  var css = getComputedStyle(element, null);
  return property ? css[property] : css;
}

/**
 * Returns the parentNode or the host of the element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} parent
 */
function getParentNode(element) {
  if (element.nodeName === 'HTML') {
    return element;
  }
  return element.parentNode || element.host;
}

/**
 * Returns the scrolling parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} scroll parent
 */
function getScrollParent(element) {
  // Return body, `getScroll` will take care to get the correct `scrollTop` from it
  if (!element) {
    return document.body;
  }

  switch (element.nodeName) {
    case 'HTML':
    case 'BODY':
      return element.ownerDocument.body;
    case '#document':
      return element.body;
  }

  // Firefox want us to check `-x` and `-y` variations as well

  var _getStyleComputedProp = getStyleComputedProperty(element),
      overflow = _getStyleComputedProp.overflow,
      overflowX = _getStyleComputedProp.overflowX,
      overflowY = _getStyleComputedProp.overflowY;

  if (/(auto|scroll|overlay)/.test(overflow + overflowY + overflowX)) {
    return element;
  }

  return getScrollParent(getParentNode(element));
}

var isIE11 = isBrowser && !!(window.MSInputMethodContext && document.documentMode);
var isIE10 = isBrowser && /MSIE 10/.test(navigator.userAgent);

/**
 * Determines if the browser is Internet Explorer
 * @method
 * @memberof Popper.Utils
 * @param {Number} version to check
 * @returns {Boolean} isIE
 */
function isIE(version) {
  if (version === 11) {
    return isIE11;
  }
  if (version === 10) {
    return isIE10;
  }
  return isIE11 || isIE10;
}

/**
 * Returns the offset parent of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} offset parent
 */
function getOffsetParent(element) {
  if (!element) {
    return document.documentElement;
  }

  var noOffsetParent = isIE(10) ? document.body : null;

  // NOTE: 1 DOM access here
  var offsetParent = element.offsetParent;
  // Skip hidden elements which don't have an offsetParent
  while (offsetParent === noOffsetParent && element.nextElementSibling) {
    offsetParent = (element = element.nextElementSibling).offsetParent;
  }

  var nodeName = offsetParent && offsetParent.nodeName;

  if (!nodeName || nodeName === 'BODY' || nodeName === 'HTML') {
    return element ? element.ownerDocument.documentElement : document.documentElement;
  }

  // .offsetParent will return the closest TD or TABLE in case
  // no offsetParent is present, I hate this job...
  if (['TD', 'TABLE'].indexOf(offsetParent.nodeName) !== -1 && getStyleComputedProperty(offsetParent, 'position') === 'static') {
    return getOffsetParent(offsetParent);
  }

  return offsetParent;
}

function isOffsetContainer(element) {
  var nodeName = element.nodeName;

  if (nodeName === 'BODY') {
    return false;
  }
  return nodeName === 'HTML' || getOffsetParent(element.firstElementChild) === element;
}

/**
 * Finds the root node (document, shadowDOM root) of the given element
 * @method
 * @memberof Popper.Utils
 * @argument {Element} node
 * @returns {Element} root node
 */
function getRoot(node) {
  if (node.parentNode !== null) {
    return getRoot(node.parentNode);
  }

  return node;
}

/**
 * Finds the offset parent common to the two provided nodes
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element1
 * @argument {Element} element2
 * @returns {Element} common offset parent
 */
function findCommonOffsetParent(element1, element2) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element1 || !element1.nodeType || !element2 || !element2.nodeType) {
    return document.documentElement;
  }

  // Here we make sure to give as "start" the element that comes first in the DOM
  var order = element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
  var start = order ? element1 : element2;
  var end = order ? element2 : element1;

  // Get common ancestor container
  var range = document.createRange();
  range.setStart(start, 0);
  range.setEnd(end, 0);
  var commonAncestorContainer = range.commonAncestorContainer;

  // Both nodes are inside #document

  if (element1 !== commonAncestorContainer && element2 !== commonAncestorContainer || start.contains(end)) {
    if (isOffsetContainer(commonAncestorContainer)) {
      return commonAncestorContainer;
    }

    return getOffsetParent(commonAncestorContainer);
  }

  // one of the nodes is inside shadowDOM, find which one
  var element1root = getRoot(element1);
  if (element1root.host) {
    return findCommonOffsetParent(element1root.host, element2);
  } else {
    return findCommonOffsetParent(element1, getRoot(element2).host);
  }
}

/**
 * Gets the scroll value of the given element in the given side (top and left)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {String} side `top` or `left`
 * @returns {number} amount of scrolled pixels
 */
function getScroll(element) {
  var side = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'top';

  var upperSide = side === 'top' ? 'scrollTop' : 'scrollLeft';
  var nodeName = element.nodeName;

  if (nodeName === 'BODY' || nodeName === 'HTML') {
    var html = element.ownerDocument.documentElement;
    var scrollingElement = element.ownerDocument.scrollingElement || html;
    return scrollingElement[upperSide];
  }

  return element[upperSide];
}

/*
 * Sum or subtract the element scroll values (left and top) from a given rect object
 * @method
 * @memberof Popper.Utils
 * @param {Object} rect - Rect object you want to change
 * @param {HTMLElement} element - The element from the function reads the scroll values
 * @param {Boolean} subtract - set to true if you want to subtract the scroll values
 * @return {Object} rect - The modifier rect object
 */
function includeScroll(rect, element) {
  var subtract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var scrollTop = getScroll(element, 'top');
  var scrollLeft = getScroll(element, 'left');
  var modifier = subtract ? -1 : 1;
  rect.top += scrollTop * modifier;
  rect.bottom += scrollTop * modifier;
  rect.left += scrollLeft * modifier;
  rect.right += scrollLeft * modifier;
  return rect;
}

/*
 * Helper to detect borders of a given element
 * @method
 * @memberof Popper.Utils
 * @param {CSSStyleDeclaration} styles
 * Result of `getStyleComputedProperty` on the given element
 * @param {String} axis - `x` or `y`
 * @return {number} borders - The borders size of the given axis
 */

function getBordersSize(styles, axis) {
  var sideA = axis === 'x' ? 'Left' : 'Top';
  var sideB = sideA === 'Left' ? 'Right' : 'Bottom';

  return parseFloat(styles['border' + sideA + 'Width'], 10) + parseFloat(styles['border' + sideB + 'Width'], 10);
}

function getSize(axis, body, html, computedStyle) {
  return Math.max(body['offset' + axis], body['scroll' + axis], html['client' + axis], html['offset' + axis], html['scroll' + axis], isIE(10) ? html['offset' + axis] + computedStyle['margin' + (axis === 'Height' ? 'Top' : 'Left')] + computedStyle['margin' + (axis === 'Height' ? 'Bottom' : 'Right')] : 0);
}

function getWindowSizes() {
  var body = document.body;
  var html = document.documentElement;
  var computedStyle = isIE(10) && getComputedStyle(html);

  return {
    height: getSize('Height', body, html, computedStyle),
    width: getSize('Width', body, html, computedStyle)
  };
}

var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * Given element offsets, generate an output similar to getBoundingClientRect
 * @method
 * @memberof Popper.Utils
 * @argument {Object} offsets
 * @returns {Object} ClientRect like output
 */
function getClientRect(offsets) {
  return _extends({}, offsets, {
    right: offsets.left + offsets.width,
    bottom: offsets.top + offsets.height
  });
}

/**
 * Get bounding client rect of given element
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} element
 * @return {Object} client rect
 */
function getBoundingClientRect(element) {
  var rect = {};

  // IE10 10 FIX: Please, don't ask, the element isn't
  // considered in DOM in some circumstances...
  // This isn't reproducible in IE10 compatibility mode of IE11
  try {
    if (isIE(10)) {
      rect = element.getBoundingClientRect();
      var scrollTop = getScroll(element, 'top');
      var scrollLeft = getScroll(element, 'left');
      rect.top += scrollTop;
      rect.left += scrollLeft;
      rect.bottom += scrollTop;
      rect.right += scrollLeft;
    } else {
      rect = element.getBoundingClientRect();
    }
  } catch (e) {}

  var result = {
    left: rect.left,
    top: rect.top,
    width: rect.right - rect.left,
    height: rect.bottom - rect.top
  };

  // subtract scrollbar size from sizes
  var sizes = element.nodeName === 'HTML' ? getWindowSizes() : {};
  var width = sizes.width || element.clientWidth || result.right - result.left;
  var height = sizes.height || element.clientHeight || result.bottom - result.top;

  var horizScrollbar = element.offsetWidth - width;
  var vertScrollbar = element.offsetHeight - height;

  // if an hypothetical scrollbar is detected, we must be sure it's not a `border`
  // we make this check conditional for performance reasons
  if (horizScrollbar || vertScrollbar) {
    var styles = getStyleComputedProperty(element);
    horizScrollbar -= getBordersSize(styles, 'x');
    vertScrollbar -= getBordersSize(styles, 'y');

    result.width -= horizScrollbar;
    result.height -= vertScrollbar;
  }

  return getClientRect(result);
}

function getOffsetRectRelativeToArbitraryNode(children, parent) {
  var fixedPosition = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

  var isIE10 = isIE(10);
  var isHTML = parent.nodeName === 'HTML';
  var childrenRect = getBoundingClientRect(children);
  var parentRect = getBoundingClientRect(parent);
  var scrollParent = getScrollParent(children);

  var styles = getStyleComputedProperty(parent);
  var borderTopWidth = parseFloat(styles.borderTopWidth, 10);
  var borderLeftWidth = parseFloat(styles.borderLeftWidth, 10);

  // In cases where the parent is fixed, we must ignore negative scroll in offset calc
  if (fixedPosition && parent.nodeName === 'HTML') {
    parentRect.top = Math.max(parentRect.top, 0);
    parentRect.left = Math.max(parentRect.left, 0);
  }
  var offsets = getClientRect({
    top: childrenRect.top - parentRect.top - borderTopWidth,
    left: childrenRect.left - parentRect.left - borderLeftWidth,
    width: childrenRect.width,
    height: childrenRect.height
  });
  offsets.marginTop = 0;
  offsets.marginLeft = 0;

  // Subtract margins of documentElement in case it's being used as parent
  // we do this only on HTML because it's the only element that behaves
  // differently when margins are applied to it. The margins are included in
  // the box of the documentElement, in the other cases not.
  if (!isIE10 && isHTML) {
    var marginTop = parseFloat(styles.marginTop, 10);
    var marginLeft = parseFloat(styles.marginLeft, 10);

    offsets.top -= borderTopWidth - marginTop;
    offsets.bottom -= borderTopWidth - marginTop;
    offsets.left -= borderLeftWidth - marginLeft;
    offsets.right -= borderLeftWidth - marginLeft;

    // Attach marginTop and marginLeft because in some circumstances we may need them
    offsets.marginTop = marginTop;
    offsets.marginLeft = marginLeft;
  }

  if (isIE10 && !fixedPosition ? parent.contains(scrollParent) : parent === scrollParent && scrollParent.nodeName !== 'BODY') {
    offsets = includeScroll(offsets, parent);
  }

  return offsets;
}

function getViewportOffsetRectRelativeToArtbitraryNode(element) {
  var excludeScroll = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var html = element.ownerDocument.documentElement;
  var relativeOffset = getOffsetRectRelativeToArbitraryNode(element, html);
  var width = Math.max(html.clientWidth, window.innerWidth || 0);
  var height = Math.max(html.clientHeight, window.innerHeight || 0);

  var scrollTop = !excludeScroll ? getScroll(html) : 0;
  var scrollLeft = !excludeScroll ? getScroll(html, 'left') : 0;

  var offset = {
    top: scrollTop - relativeOffset.top + relativeOffset.marginTop,
    left: scrollLeft - relativeOffset.left + relativeOffset.marginLeft,
    width: width,
    height: height
  };

  return getClientRect(offset);
}

/**
 * Check if the given element is fixed or is inside a fixed parent
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @argument {Element} customContainer
 * @returns {Boolean} answer to "isFixed?"
 */
function isFixed(element) {
  var nodeName = element.nodeName;
  if (nodeName === 'BODY' || nodeName === 'HTML') {
    return false;
  }
  if (getStyleComputedProperty(element, 'position') === 'fixed') {
    return true;
  }
  return isFixed(getParentNode(element));
}

/**
 * Finds the first parent of an element that has a transformed property defined
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Element} first transformed parent or documentElement
 */

function getFixedPositionOffsetParent(element) {
  // This check is needed to avoid errors in case one of the elements isn't defined for any reason
  if (!element || !element.parentElement || isIE()) {
    return document.documentElement;
  }
  var el = element.parentElement;
  while (el && getStyleComputedProperty(el, 'transform') === 'none') {
    el = el.parentElement;
  }
  return el || document.documentElement;
}

/**
 * Computed the boundaries limits and return them
 * @method
 * @memberof Popper.Utils
 * @param {HTMLElement} popper
 * @param {HTMLElement} reference
 * @param {number} padding
 * @param {HTMLElement} boundariesElement - Element used to define the boundaries
 * @param {Boolean} fixedPosition - Is in fixed position mode
 * @returns {Object} Coordinates of the boundaries
 */
function getBoundaries(popper, reference, padding, boundariesElement) {
  var fixedPosition = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

  // NOTE: 1 DOM access here

  var boundaries = { top: 0, left: 0 };
  var offsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);

  // Handle viewport case
  if (boundariesElement === 'viewport') {
    boundaries = getViewportOffsetRectRelativeToArtbitraryNode(offsetParent, fixedPosition);
  } else {
    // Handle other cases based on DOM element used as boundaries
    var boundariesNode = void 0;
    if (boundariesElement === 'scrollParent') {
      boundariesNode = getScrollParent(getParentNode(reference));
      if (boundariesNode.nodeName === 'BODY') {
        boundariesNode = popper.ownerDocument.documentElement;
      }
    } else if (boundariesElement === 'window') {
      boundariesNode = popper.ownerDocument.documentElement;
    } else {
      boundariesNode = boundariesElement;
    }

    var offsets = getOffsetRectRelativeToArbitraryNode(boundariesNode, offsetParent, fixedPosition);

    // In case of HTML, we need a different computation
    if (boundariesNode.nodeName === 'HTML' && !isFixed(offsetParent)) {
      var _getWindowSizes = getWindowSizes(),
          height = _getWindowSizes.height,
          width = _getWindowSizes.width;

      boundaries.top += offsets.top - offsets.marginTop;
      boundaries.bottom = height + offsets.top;
      boundaries.left += offsets.left - offsets.marginLeft;
      boundaries.right = width + offsets.left;
    } else {
      // for all the other DOM elements, this one is good
      boundaries = offsets;
    }
  }

  // Add paddings
  boundaries.left += padding;
  boundaries.top += padding;
  boundaries.right -= padding;
  boundaries.bottom -= padding;

  return boundaries;
}

function getArea(_ref) {
  var width = _ref.width,
      height = _ref.height;

  return width * height;
}

/**
 * Utility used to transform the `auto` placement to the placement with more
 * available space.
 * @method
 * @memberof Popper.Utils
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeAutoPlacement(placement, refRect, popper, reference, boundariesElement) {
  var padding = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 0;

  if (placement.indexOf('auto') === -1) {
    return placement;
  }

  var boundaries = getBoundaries(popper, reference, padding, boundariesElement);

  var rects = {
    top: {
      width: boundaries.width,
      height: refRect.top - boundaries.top
    },
    right: {
      width: boundaries.right - refRect.right,
      height: boundaries.height
    },
    bottom: {
      width: boundaries.width,
      height: boundaries.bottom - refRect.bottom
    },
    left: {
      width: refRect.left - boundaries.left,
      height: boundaries.height
    }
  };

  var sortedAreas = Object.keys(rects).map(function (key) {
    return _extends({
      key: key
    }, rects[key], {
      area: getArea(rects[key])
    });
  }).sort(function (a, b) {
    return b.area - a.area;
  });

  var filteredAreas = sortedAreas.filter(function (_ref2) {
    var width = _ref2.width,
        height = _ref2.height;
    return width >= popper.clientWidth && height >= popper.clientHeight;
  });

  var computedPlacement = filteredAreas.length > 0 ? filteredAreas[0].key : sortedAreas[0].key;

  var variation = placement.split('-')[1];

  return computedPlacement + (variation ? '-' + variation : '');
}

/**
 * Get offsets to the reference element
 * @method
 * @memberof Popper.Utils
 * @param {Object} state
 * @param {Element} popper - the popper element
 * @param {Element} reference - the reference element (the popper will be relative to this)
 * @param {Element} fixedPosition - is in fixed position mode
 * @returns {Object} An object containing the offsets which will be applied to the popper
 */
function getReferenceOffsets(state, popper, reference) {
  var fixedPosition = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;

  var commonOffsetParent = fixedPosition ? getFixedPositionOffsetParent(popper) : findCommonOffsetParent(popper, reference);
  return getOffsetRectRelativeToArbitraryNode(reference, commonOffsetParent, fixedPosition);
}

/**
 * Get the outer sizes of the given element (offset size + margins)
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element
 * @returns {Object} object containing width and height properties
 */
function getOuterSizes(element) {
  var styles = getComputedStyle(element);
  var x = parseFloat(styles.marginTop) + parseFloat(styles.marginBottom);
  var y = parseFloat(styles.marginLeft) + parseFloat(styles.marginRight);
  var result = {
    width: element.offsetWidth + y,
    height: element.offsetHeight + x
  };
  return result;
}

/**
 * Get the opposite placement of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement
 * @returns {String} flipped placement
 */
function getOppositePlacement(placement) {
  var hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, function (matched) {
    return hash[matched];
  });
}

/**
 * Get offsets to the popper
 * @method
 * @memberof Popper.Utils
 * @param {Object} position - CSS position the Popper will get applied
 * @param {HTMLElement} popper - the popper element
 * @param {Object} referenceOffsets - the reference offsets (the popper will be relative to this)
 * @param {String} placement - one of the valid placement options
 * @returns {Object} popperOffsets - An object containing the offsets which will be applied to the popper
 */
function getPopperOffsets(popper, referenceOffsets, placement) {
  placement = placement.split('-')[0];

  // Get popper node sizes
  var popperRect = getOuterSizes(popper);

  // Add position, width and height to our offsets object
  var popperOffsets = {
    width: popperRect.width,
    height: popperRect.height
  };

  // depending by the popper placement we have to compute its offsets slightly differently
  var isHoriz = ['right', 'left'].indexOf(placement) !== -1;
  var mainSide = isHoriz ? 'top' : 'left';
  var secondarySide = isHoriz ? 'left' : 'top';
  var measurement = isHoriz ? 'height' : 'width';
  var secondaryMeasurement = !isHoriz ? 'height' : 'width';

  popperOffsets[mainSide] = referenceOffsets[mainSide] + referenceOffsets[measurement] / 2 - popperRect[measurement] / 2;
  if (placement === secondarySide) {
    popperOffsets[secondarySide] = referenceOffsets[secondarySide] - popperRect[secondaryMeasurement];
  } else {
    popperOffsets[secondarySide] = referenceOffsets[getOppositePlacement(secondarySide)];
  }

  return popperOffsets;
}

/**
 * Mimics the `find` method of Array
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function find(arr, check) {
  // use native find if supported
  if (Array.prototype.find) {
    return arr.find(check);
  }

  // use `filter` to obtain the same behavior of `find`
  return arr.filter(check)[0];
}

/**
 * Return the index of the matching object
 * @method
 * @memberof Popper.Utils
 * @argument {Array} arr
 * @argument prop
 * @argument value
 * @returns index or -1
 */
function findIndex(arr, prop, value) {
  // use native findIndex if supported
  if (Array.prototype.findIndex) {
    return arr.findIndex(function (cur) {
      return cur[prop] === value;
    });
  }

  // use `find` + `indexOf` if `findIndex` isn't supported
  var match = find(arr, function (obj) {
    return obj[prop] === value;
  });
  return arr.indexOf(match);
}

/**
 * Loop trough the list of modifiers and run them in order,
 * each of them will then edit the data object.
 * @method
 * @memberof Popper.Utils
 * @param {dataObject} data
 * @param {Array} modifiers
 * @param {String} ends - Optional modifier name used as stopper
 * @returns {dataObject}
 */
function runModifiers(modifiers, data, ends) {
  var modifiersToRun = ends === undefined ? modifiers : modifiers.slice(0, findIndex(modifiers, 'name', ends));

  modifiersToRun.forEach(function (modifier) {
    if (modifier['function']) {
      // eslint-disable-line dot-notation
      console.warn('`modifier.function` is deprecated, use `modifier.fn`!');
    }
    var fn = modifier['function'] || modifier.fn; // eslint-disable-line dot-notation
    if (modifier.enabled && isFunction(fn)) {
      // Add properties to offsets to make them a complete clientRect object
      // we do this before each modifier to make sure the previous one doesn't
      // mess with these values
      data.offsets.popper = getClientRect(data.offsets.popper);
      data.offsets.reference = getClientRect(data.offsets.reference);

      data = fn(data, modifier);
    }
  });

  return data;
}

/**
 * Updates the position of the popper, computing the new offsets and applying
 * the new style.<br />
 * Prefer `scheduleUpdate` over `update` because of performance reasons.
 * @method
 * @memberof Popper
 */
function update() {
  // if popper is destroyed, don't perform any further update
  if (this.state.isDestroyed) {
    return;
  }

  var data = {
    instance: this,
    styles: {},
    arrowStyles: {},
    attributes: {},
    flipped: false,
    offsets: {}
  };

  // compute reference element offsets
  data.offsets.reference = getReferenceOffsets(this.state, this.popper, this.reference, this.options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  data.placement = computeAutoPlacement(this.options.placement, data.offsets.reference, this.popper, this.reference, this.options.modifiers.flip.boundariesElement, this.options.modifiers.flip.padding);

  // store the computed placement inside `originalPlacement`
  data.originalPlacement = data.placement;

  data.positionFixed = this.options.positionFixed;

  // compute the popper offsets
  data.offsets.popper = getPopperOffsets(this.popper, data.offsets.reference, data.placement);

  data.offsets.popper.position = this.options.positionFixed ? 'fixed' : 'absolute';

  // run the modifiers
  data = runModifiers(this.modifiers, data);

  // the first `update` will call `onCreate` callback
  // the other ones will call `onUpdate` callback
  if (!this.state.isCreated) {
    this.state.isCreated = true;
    this.options.onCreate(data);
  } else {
    this.options.onUpdate(data);
  }
}

/**
 * Helper used to know if the given modifier is enabled.
 * @method
 * @memberof Popper.Utils
 * @returns {Boolean}
 */
function isModifierEnabled(modifiers, modifierName) {
  return modifiers.some(function (_ref) {
    var name = _ref.name,
        enabled = _ref.enabled;
    return enabled && name === modifierName;
  });
}

/**
 * Get the prefixed supported property name
 * @method
 * @memberof Popper.Utils
 * @argument {String} property (camelCase)
 * @returns {String} prefixed property (camelCase or PascalCase, depending on the vendor prefix)
 */
function getSupportedPropertyName(property) {
  var prefixes = [false, 'ms', 'Webkit', 'Moz', 'O'];
  var upperProp = property.charAt(0).toUpperCase() + property.slice(1);

  for (var i = 0; i < prefixes.length; i++) {
    var prefix = prefixes[i];
    var toCheck = prefix ? '' + prefix + upperProp : property;
    if (typeof document.body.style[toCheck] !== 'undefined') {
      return toCheck;
    }
  }
  return null;
}

/**
 * Destroy the popper
 * @method
 * @memberof Popper
 */
function destroy() {
  this.state.isDestroyed = true;

  // touch DOM only if `applyStyle` modifier is enabled
  if (isModifierEnabled(this.modifiers, 'applyStyle')) {
    this.popper.removeAttribute('x-placement');
    this.popper.style.position = '';
    this.popper.style.top = '';
    this.popper.style.left = '';
    this.popper.style.right = '';
    this.popper.style.bottom = '';
    this.popper.style.willChange = '';
    this.popper.style[getSupportedPropertyName('transform')] = '';
  }

  this.disableEventListeners();

  // remove the popper if user explicity asked for the deletion on destroy
  // do not use `remove` because IE11 doesn't support it
  if (this.options.removeOnDestroy) {
    this.popper.parentNode.removeChild(this.popper);
  }
  return this;
}

/**
 * Get the window associated with the element
 * @argument {Element} element
 * @returns {Window}
 */
function getWindow(element) {
  var ownerDocument = element.ownerDocument;
  return ownerDocument ? ownerDocument.defaultView : window;
}

function attachToScrollParents(scrollParent, event, callback, scrollParents) {
  var isBody = scrollParent.nodeName === 'BODY';
  var target = isBody ? scrollParent.ownerDocument.defaultView : scrollParent;
  target.addEventListener(event, callback, { passive: true });

  if (!isBody) {
    attachToScrollParents(getScrollParent(target.parentNode), event, callback, scrollParents);
  }
  scrollParents.push(target);
}

/**
 * Setup needed event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function setupEventListeners(reference, options, state, updateBound) {
  // Resize event listener on window
  state.updateBound = updateBound;
  getWindow(reference).addEventListener('resize', state.updateBound, { passive: true });

  // Scroll event listener on scroll parents
  var scrollElement = getScrollParent(reference);
  attachToScrollParents(scrollElement, 'scroll', state.updateBound, state.scrollParents);
  state.scrollElement = scrollElement;
  state.eventsEnabled = true;

  return state;
}

/**
 * It will add resize/scroll events and start recalculating
 * position of the popper element when they are triggered.
 * @method
 * @memberof Popper
 */
function enableEventListeners() {
  if (!this.state.eventsEnabled) {
    this.state = setupEventListeners(this.reference, this.options, this.state, this.scheduleUpdate);
  }
}

/**
 * Remove event listeners used to update the popper position
 * @method
 * @memberof Popper.Utils
 * @private
 */
function removeEventListeners(reference, state) {
  // Remove resize event listener on window
  getWindow(reference).removeEventListener('resize', state.updateBound);

  // Remove scroll event listener on scroll parents
  state.scrollParents.forEach(function (target) {
    target.removeEventListener('scroll', state.updateBound);
  });

  // Reset state
  state.updateBound = null;
  state.scrollParents = [];
  state.scrollElement = null;
  state.eventsEnabled = false;
  return state;
}

/**
 * It will remove resize/scroll events and won't recalculate popper position
 * when they are triggered. It also won't trigger onUpdate callback anymore,
 * unless you call `update` method manually.
 * @method
 * @memberof Popper
 */
function disableEventListeners() {
  if (this.state.eventsEnabled) {
    cancelAnimationFrame(this.scheduleUpdate);
    this.state = removeEventListeners(this.reference, this.state);
  }
}

/**
 * Tells if a given input is a number
 * @method
 * @memberof Popper.Utils
 * @param {*} input to check
 * @return {Boolean}
 */
function isNumeric(n) {
  return n !== '' && !isNaN(parseFloat(n)) && isFinite(n);
}

/**
 * Set the style to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the style to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setStyles(element, styles) {
  Object.keys(styles).forEach(function (prop) {
    var unit = '';
    // add unit if the value is numeric and is one of the following
    if (['width', 'height', 'top', 'right', 'bottom', 'left'].indexOf(prop) !== -1 && isNumeric(styles[prop])) {
      unit = 'px';
    }
    element.style[prop] = styles[prop] + unit;
  });
}

/**
 * Set the attributes to the given popper
 * @method
 * @memberof Popper.Utils
 * @argument {Element} element - Element to apply the attributes to
 * @argument {Object} styles
 * Object with a list of properties and values which will be applied to the element
 */
function setAttributes(element, attributes) {
  Object.keys(attributes).forEach(function (prop) {
    var value = attributes[prop];
    if (value !== false) {
      element.setAttribute(prop, attributes[prop]);
    } else {
      element.removeAttribute(prop);
    }
  });
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} data.styles - List of style properties - values to apply to popper element
 * @argument {Object} data.attributes - List of attribute properties - values to apply to popper element
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The same data object
 */
function applyStyle(data) {
  // any property present in `data.styles` will be applied to the popper,
  // in this way we can make the 3rd party modifiers add custom styles to it
  // Be aware, modifiers could override the properties defined in the previous
  // lines of this modifier!
  setStyles(data.instance.popper, data.styles);

  // any property present in `data.attributes` will be applied to the popper,
  // they will be set as HTML attributes of the element
  setAttributes(data.instance.popper, data.attributes);

  // if arrowElement is defined and arrowStyles has some properties
  if (data.arrowElement && Object.keys(data.arrowStyles).length) {
    setStyles(data.arrowElement, data.arrowStyles);
  }

  return data;
}

/**
 * Set the x-placement attribute before everything else because it could be used
 * to add margins to the popper margins needs to be calculated to get the
 * correct popper offsets.
 * @method
 * @memberof Popper.modifiers
 * @param {HTMLElement} reference - The reference element used to position the popper
 * @param {HTMLElement} popper - The HTML element used as popper
 * @param {Object} options - Popper.js options
 */
function applyStyleOnLoad(reference, popper, options, modifierOptions, state) {
  // compute reference element offsets
  var referenceOffsets = getReferenceOffsets(state, popper, reference, options.positionFixed);

  // compute auto placement, store placement inside the data object,
  // modifiers will be able to edit `placement` if needed
  // and refer to originalPlacement to know the original value
  var placement = computeAutoPlacement(options.placement, referenceOffsets, popper, reference, options.modifiers.flip.boundariesElement, options.modifiers.flip.padding);

  popper.setAttribute('x-placement', placement);

  // Apply `position` to popper before anything else because
  // without the position applied we can't guarantee correct computations
  setStyles(popper, { position: options.positionFixed ? 'fixed' : 'absolute' });

  return options;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function computeStyle(data, options) {
  var x = options.x,
      y = options.y;
  var popper = data.offsets.popper;

  // Remove this legacy support in Popper.js v2

  var legacyGpuAccelerationOption = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'applyStyle';
  }).gpuAcceleration;
  if (legacyGpuAccelerationOption !== undefined) {
    console.warn('WARNING: `gpuAcceleration` option moved to `computeStyle` modifier and will not be supported in future versions of Popper.js!');
  }
  var gpuAcceleration = legacyGpuAccelerationOption !== undefined ? legacyGpuAccelerationOption : options.gpuAcceleration;

  var offsetParent = getOffsetParent(data.instance.popper);
  var offsetParentRect = getBoundingClientRect(offsetParent);

  // Styles
  var styles = {
    position: popper.position
  };

  // Avoid blurry text by using full pixel integers.
  // For pixel-perfect positioning, top/bottom prefers rounded
  // values, while left/right prefers floored values.
  var offsets = {
    left: Math.floor(popper.left),
    top: Math.round(popper.top),
    bottom: Math.round(popper.bottom),
    right: Math.floor(popper.right)
  };

  var sideA = x === 'bottom' ? 'top' : 'bottom';
  var sideB = y === 'right' ? 'left' : 'right';

  // if gpuAcceleration is set to `true` and transform is supported,
  //  we use `translate3d` to apply the position to the popper we
  // automatically use the supported prefixed version if needed
  var prefixedProperty = getSupportedPropertyName('transform');

  // now, let's make a step back and look at this code closely (wtf?)
  // If the content of the popper grows once it's been positioned, it
  // may happen that the popper gets misplaced because of the new content
  // overflowing its reference element
  // To avoid this problem, we provide two options (x and y), which allow
  // the consumer to define the offset origin.
  // If we position a popper on top of a reference element, we can set
  // `x` to `top` to make the popper grow towards its top instead of
  // its bottom.
  var left = void 0,
      top = void 0;
  if (sideA === 'bottom') {
    top = -offsetParentRect.height + offsets.bottom;
  } else {
    top = offsets.top;
  }
  if (sideB === 'right') {
    left = -offsetParentRect.width + offsets.right;
  } else {
    left = offsets.left;
  }
  if (gpuAcceleration && prefixedProperty) {
    styles[prefixedProperty] = 'translate3d(' + left + 'px, ' + top + 'px, 0)';
    styles[sideA] = 0;
    styles[sideB] = 0;
    styles.willChange = 'transform';
  } else {
    // othwerise, we use the standard `top`, `left`, `bottom` and `right` properties
    var invertTop = sideA === 'bottom' ? -1 : 1;
    var invertLeft = sideB === 'right' ? -1 : 1;
    styles[sideA] = top * invertTop;
    styles[sideB] = left * invertLeft;
    styles.willChange = sideA + ', ' + sideB;
  }

  // Attributes
  var attributes = {
    'x-placement': data.placement
  };

  // Update `data` attributes, styles and arrowStyles
  data.attributes = _extends({}, attributes, data.attributes);
  data.styles = _extends({}, styles, data.styles);
  data.arrowStyles = _extends({}, data.offsets.arrow, data.arrowStyles);

  return data;
}

/**
 * Helper used to know if the given modifier depends from another one.<br />
 * It checks if the needed modifier is listed and enabled.
 * @method
 * @memberof Popper.Utils
 * @param {Array} modifiers - list of modifiers
 * @param {String} requestingName - name of requesting modifier
 * @param {String} requestedName - name of requested modifier
 * @returns {Boolean}
 */
function isModifierRequired(modifiers, requestingName, requestedName) {
  var requesting = find(modifiers, function (_ref) {
    var name = _ref.name;
    return name === requestingName;
  });

  var isRequired = !!requesting && modifiers.some(function (modifier) {
    return modifier.name === requestedName && modifier.enabled && modifier.order < requesting.order;
  });

  if (!isRequired) {
    var _requesting = '`' + requestingName + '`';
    var requested = '`' + requestedName + '`';
    console.warn(requested + ' modifier is required by ' + _requesting + ' modifier in order to work, be sure to include it before ' + _requesting + '!');
  }
  return isRequired;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function arrow(data, options) {
  var _data$offsets$arrow;

  // arrow depends on keepTogether in order to work
  if (!isModifierRequired(data.instance.modifiers, 'arrow', 'keepTogether')) {
    return data;
  }

  var arrowElement = options.element;

  // if arrowElement is a string, suppose it's a CSS selector
  if (typeof arrowElement === 'string') {
    arrowElement = data.instance.popper.querySelector(arrowElement);

    // if arrowElement is not found, don't run the modifier
    if (!arrowElement) {
      return data;
    }
  } else {
    // if the arrowElement isn't a query selector we must check that the
    // provided DOM node is child of its popper node
    if (!data.instance.popper.contains(arrowElement)) {
      console.warn('WARNING: `arrow.element` must be child of its popper element!');
      return data;
    }
  }

  var placement = data.placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isVertical = ['left', 'right'].indexOf(placement) !== -1;

  var len = isVertical ? 'height' : 'width';
  var sideCapitalized = isVertical ? 'Top' : 'Left';
  var side = sideCapitalized.toLowerCase();
  var altSide = isVertical ? 'left' : 'top';
  var opSide = isVertical ? 'bottom' : 'right';
  var arrowElementSize = getOuterSizes(arrowElement)[len];

  //
  // extends keepTogether behavior making sure the popper and its
  // reference have enough pixels in conjuction
  //

  // top/left side
  if (reference[opSide] - arrowElementSize < popper[side]) {
    data.offsets.popper[side] -= popper[side] - (reference[opSide] - arrowElementSize);
  }
  // bottom/right side
  if (reference[side] + arrowElementSize > popper[opSide]) {
    data.offsets.popper[side] += reference[side] + arrowElementSize - popper[opSide];
  }
  data.offsets.popper = getClientRect(data.offsets.popper);

  // compute center of the popper
  var center = reference[side] + reference[len] / 2 - arrowElementSize / 2;

  // Compute the sideValue using the updated popper offsets
  // take popper margin in account because we don't have this info available
  var css = getStyleComputedProperty(data.instance.popper);
  var popperMarginSide = parseFloat(css['margin' + sideCapitalized], 10);
  var popperBorderSide = parseFloat(css['border' + sideCapitalized + 'Width'], 10);
  var sideValue = center - data.offsets.popper[side] - popperMarginSide - popperBorderSide;

  // prevent arrowElement from being placed not contiguously to its popper
  sideValue = Math.max(Math.min(popper[len] - arrowElementSize, sideValue), 0);

  data.arrowElement = arrowElement;
  data.offsets.arrow = (_data$offsets$arrow = {}, defineProperty(_data$offsets$arrow, side, Math.round(sideValue)), defineProperty(_data$offsets$arrow, altSide, ''), _data$offsets$arrow);

  return data;
}

/**
 * Get the opposite placement variation of the given one
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement variation
 * @returns {String} flipped placement variation
 */
function getOppositeVariation(variation) {
  if (variation === 'end') {
    return 'start';
  } else if (variation === 'start') {
    return 'end';
  }
  return variation;
}

/**
 * List of accepted placements to use as values of the `placement` option.<br />
 * Valid placements are:
 * - `auto`
 * - `top`
 * - `right`
 * - `bottom`
 * - `left`
 *
 * Each placement can have a variation from this list:
 * - `-start`
 * - `-end`
 *
 * Variations are interpreted easily if you think of them as the left to right
 * written languages. Horizontally (`top` and `bottom`), `start` is left and `end`
 * is right.<br />
 * Vertically (`left` and `right`), `start` is top and `end` is bottom.
 *
 * Some valid examples are:
 * - `top-end` (on top of reference, right aligned)
 * - `right-start` (on right of reference, top aligned)
 * - `bottom` (on bottom, centered)
 * - `auto-right` (on the side with more space available, alignment depends by placement)
 *
 * @static
 * @type {Array}
 * @enum {String}
 * @readonly
 * @method placements
 * @memberof Popper
 */
var placements = ['auto-start', 'auto', 'auto-end', 'top-start', 'top', 'top-end', 'right-start', 'right', 'right-end', 'bottom-end', 'bottom', 'bottom-start', 'left-end', 'left', 'left-start'];

// Get rid of `auto` `auto-start` and `auto-end`
var validPlacements = placements.slice(3);

/**
 * Given an initial placement, returns all the subsequent placements
 * clockwise (or counter-clockwise).
 *
 * @method
 * @memberof Popper.Utils
 * @argument {String} placement - A valid placement (it accepts variations)
 * @argument {Boolean} counter - Set to true to walk the placements counterclockwise
 * @returns {Array} placements including their variations
 */
function clockwise(placement) {
  var counter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var index = validPlacements.indexOf(placement);
  var arr = validPlacements.slice(index + 1).concat(validPlacements.slice(0, index));
  return counter ? arr.reverse() : arr;
}

var BEHAVIORS = {
  FLIP: 'flip',
  CLOCKWISE: 'clockwise',
  COUNTERCLOCKWISE: 'counterclockwise'
};

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function flip(data, options) {
  // if `inner` modifier is enabled, we can't use the `flip` modifier
  if (isModifierEnabled(data.instance.modifiers, 'inner')) {
    return data;
  }

  if (data.flipped && data.placement === data.originalPlacement) {
    // seems like flip is trying to loop, probably there's not enough space on any of the flippable sides
    return data;
  }

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, options.boundariesElement, data.positionFixed);

  var placement = data.placement.split('-')[0];
  var placementOpposite = getOppositePlacement(placement);
  var variation = data.placement.split('-')[1] || '';

  var flipOrder = [];

  switch (options.behavior) {
    case BEHAVIORS.FLIP:
      flipOrder = [placement, placementOpposite];
      break;
    case BEHAVIORS.CLOCKWISE:
      flipOrder = clockwise(placement);
      break;
    case BEHAVIORS.COUNTERCLOCKWISE:
      flipOrder = clockwise(placement, true);
      break;
    default:
      flipOrder = options.behavior;
  }

  flipOrder.forEach(function (step, index) {
    if (placement !== step || flipOrder.length === index + 1) {
      return data;
    }

    placement = data.placement.split('-')[0];
    placementOpposite = getOppositePlacement(placement);

    var popperOffsets = data.offsets.popper;
    var refOffsets = data.offsets.reference;

    // using floor because the reference offsets may contain decimals we are not going to consider here
    var floor = Math.floor;
    var overlapsRef = placement === 'left' && floor(popperOffsets.right) > floor(refOffsets.left) || placement === 'right' && floor(popperOffsets.left) < floor(refOffsets.right) || placement === 'top' && floor(popperOffsets.bottom) > floor(refOffsets.top) || placement === 'bottom' && floor(popperOffsets.top) < floor(refOffsets.bottom);

    var overflowsLeft = floor(popperOffsets.left) < floor(boundaries.left);
    var overflowsRight = floor(popperOffsets.right) > floor(boundaries.right);
    var overflowsTop = floor(popperOffsets.top) < floor(boundaries.top);
    var overflowsBottom = floor(popperOffsets.bottom) > floor(boundaries.bottom);

    var overflowsBoundaries = placement === 'left' && overflowsLeft || placement === 'right' && overflowsRight || placement === 'top' && overflowsTop || placement === 'bottom' && overflowsBottom;

    // flip the variation if required
    var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
    var flippedVariation = !!options.flipVariations && (isVertical && variation === 'start' && overflowsLeft || isVertical && variation === 'end' && overflowsRight || !isVertical && variation === 'start' && overflowsTop || !isVertical && variation === 'end' && overflowsBottom);

    if (overlapsRef || overflowsBoundaries || flippedVariation) {
      // this boolean to detect any flip loop
      data.flipped = true;

      if (overlapsRef || overflowsBoundaries) {
        placement = flipOrder[index + 1];
      }

      if (flippedVariation) {
        variation = getOppositeVariation(variation);
      }

      data.placement = placement + (variation ? '-' + variation : '');

      // this object contains `position`, we want to preserve it along with
      // any additional property we may add in the future
      data.offsets.popper = _extends({}, data.offsets.popper, getPopperOffsets(data.instance.popper, data.offsets.reference, data.placement));

      data = runModifiers(data.instance.modifiers, data, 'flip');
    }
  });
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function keepTogether(data) {
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var placement = data.placement.split('-')[0];
  var floor = Math.floor;
  var isVertical = ['top', 'bottom'].indexOf(placement) !== -1;
  var side = isVertical ? 'right' : 'bottom';
  var opSide = isVertical ? 'left' : 'top';
  var measurement = isVertical ? 'width' : 'height';

  if (popper[side] < floor(reference[opSide])) {
    data.offsets.popper[opSide] = floor(reference[opSide]) - popper[measurement];
  }
  if (popper[opSide] > floor(reference[side])) {
    data.offsets.popper[opSide] = floor(reference[side]);
  }

  return data;
}

/**
 * Converts a string containing value + unit into a px value number
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} str - Value + unit string
 * @argument {String} measurement - `height` or `width`
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @returns {Number|String}
 * Value in pixels, or original string if no values were extracted
 */
function toValue(str, measurement, popperOffsets, referenceOffsets) {
  // separate value from unit
  var split = str.match(/((?:\-|\+)?\d*\.?\d*)(.*)/);
  var value = +split[1];
  var unit = split[2];

  // If it's not a number it's an operator, I guess
  if (!value) {
    return str;
  }

  if (unit.indexOf('%') === 0) {
    var element = void 0;
    switch (unit) {
      case '%p':
        element = popperOffsets;
        break;
      case '%':
      case '%r':
      default:
        element = referenceOffsets;
    }

    var rect = getClientRect(element);
    return rect[measurement] / 100 * value;
  } else if (unit === 'vh' || unit === 'vw') {
    // if is a vh or vw, we calculate the size based on the viewport
    var size = void 0;
    if (unit === 'vh') {
      size = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    } else {
      size = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    }
    return size / 100 * value;
  } else {
    // if is an explicit pixel unit, we get rid of the unit and keep the value
    // if is an implicit unit, it's px, and we return just the value
    return value;
  }
}

/**
 * Parse an `offset` string to extrapolate `x` and `y` numeric offsets.
 * @function
 * @memberof {modifiers~offset}
 * @private
 * @argument {String} offset
 * @argument {Object} popperOffsets
 * @argument {Object} referenceOffsets
 * @argument {String} basePlacement
 * @returns {Array} a two cells array with x and y offsets in numbers
 */
function parseOffset(offset, popperOffsets, referenceOffsets, basePlacement) {
  var offsets = [0, 0];

  // Use height if placement is left or right and index is 0 otherwise use width
  // in this way the first offset will use an axis and the second one
  // will use the other one
  var useHeight = ['right', 'left'].indexOf(basePlacement) !== -1;

  // Split the offset string to obtain a list of values and operands
  // The regex addresses values with the plus or minus sign in front (+10, -20, etc)
  var fragments = offset.split(/(\+|\-)/).map(function (frag) {
    return frag.trim();
  });

  // Detect if the offset string contains a pair of values or a single one
  // they could be separated by comma or space
  var divider = fragments.indexOf(find(fragments, function (frag) {
    return frag.search(/,|\s/) !== -1;
  }));

  if (fragments[divider] && fragments[divider].indexOf(',') === -1) {
    console.warn('Offsets separated by white space(s) are deprecated, use a comma (,) instead.');
  }

  // If divider is found, we divide the list of values and operands to divide
  // them by ofset X and Y.
  var splitRegex = /\s*,\s*|\s+/;
  var ops = divider !== -1 ? [fragments.slice(0, divider).concat([fragments[divider].split(splitRegex)[0]]), [fragments[divider].split(splitRegex)[1]].concat(fragments.slice(divider + 1))] : [fragments];

  // Convert the values with units to absolute pixels to allow our computations
  ops = ops.map(function (op, index) {
    // Most of the units rely on the orientation of the popper
    var measurement = (index === 1 ? !useHeight : useHeight) ? 'height' : 'width';
    var mergeWithPrevious = false;
    return op
    // This aggregates any `+` or `-` sign that aren't considered operators
    // e.g.: 10 + +5 => [10, +, +5]
    .reduce(function (a, b) {
      if (a[a.length - 1] === '' && ['+', '-'].indexOf(b) !== -1) {
        a[a.length - 1] = b;
        mergeWithPrevious = true;
        return a;
      } else if (mergeWithPrevious) {
        a[a.length - 1] += b;
        mergeWithPrevious = false;
        return a;
      } else {
        return a.concat(b);
      }
    }, [])
    // Here we convert the string values into number values (in px)
    .map(function (str) {
      return toValue(str, measurement, popperOffsets, referenceOffsets);
    });
  });

  // Loop trough the offsets arrays and execute the operations
  ops.forEach(function (op, index) {
    op.forEach(function (frag, index2) {
      if (isNumeric(frag)) {
        offsets[index] += frag * (op[index2 - 1] === '-' ? -1 : 1);
      }
    });
  });
  return offsets;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @argument {Number|String} options.offset=0
 * The offset value as described in the modifier description
 * @returns {Object} The data object, properly modified
 */
function offset(data, _ref) {
  var offset = _ref.offset;
  var placement = data.placement,
      _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var basePlacement = placement.split('-')[0];

  var offsets = void 0;
  if (isNumeric(+offset)) {
    offsets = [+offset, 0];
  } else {
    offsets = parseOffset(offset, popper, reference, basePlacement);
  }

  if (basePlacement === 'left') {
    popper.top += offsets[0];
    popper.left -= offsets[1];
  } else if (basePlacement === 'right') {
    popper.top += offsets[0];
    popper.left += offsets[1];
  } else if (basePlacement === 'top') {
    popper.left += offsets[0];
    popper.top -= offsets[1];
  } else if (basePlacement === 'bottom') {
    popper.left += offsets[0];
    popper.top += offsets[1];
  }

  data.popper = popper;
  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function preventOverflow(data, options) {
  var boundariesElement = options.boundariesElement || getOffsetParent(data.instance.popper);

  // If offsetParent is the reference element, we really want to
  // go one step up and use the next offsetParent as reference to
  // avoid to make this modifier completely useless and look like broken
  if (data.instance.reference === boundariesElement) {
    boundariesElement = getOffsetParent(boundariesElement);
  }

  // NOTE: DOM access here
  // resets the popper's position so that the document size can be calculated excluding
  // the size of the popper element itself
  var transformProp = getSupportedPropertyName('transform');
  var popperStyles = data.instance.popper.style; // assignment to help minification
  var top = popperStyles.top,
      left = popperStyles.left,
      transform = popperStyles[transformProp];

  popperStyles.top = '';
  popperStyles.left = '';
  popperStyles[transformProp] = '';

  var boundaries = getBoundaries(data.instance.popper, data.instance.reference, options.padding, boundariesElement, data.positionFixed);

  // NOTE: DOM access here
  // restores the original style properties after the offsets have been computed
  popperStyles.top = top;
  popperStyles.left = left;
  popperStyles[transformProp] = transform;

  options.boundaries = boundaries;

  var order = options.priority;
  var popper = data.offsets.popper;

  var check = {
    primary: function primary(placement) {
      var value = popper[placement];
      if (popper[placement] < boundaries[placement] && !options.escapeWithReference) {
        value = Math.max(popper[placement], boundaries[placement]);
      }
      return defineProperty({}, placement, value);
    },
    secondary: function secondary(placement) {
      var mainSide = placement === 'right' ? 'left' : 'top';
      var value = popper[mainSide];
      if (popper[placement] > boundaries[placement] && !options.escapeWithReference) {
        value = Math.min(popper[mainSide], boundaries[placement] - (placement === 'right' ? popper.width : popper.height));
      }
      return defineProperty({}, mainSide, value);
    }
  };

  order.forEach(function (placement) {
    var side = ['left', 'top'].indexOf(placement) !== -1 ? 'primary' : 'secondary';
    popper = _extends({}, popper, check[side](placement));
  });

  data.offsets.popper = popper;

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function shift(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var shiftvariation = placement.split('-')[1];

  // if shift shiftvariation is specified, run the modifier
  if (shiftvariation) {
    var _data$offsets = data.offsets,
        reference = _data$offsets.reference,
        popper = _data$offsets.popper;

    var isVertical = ['bottom', 'top'].indexOf(basePlacement) !== -1;
    var side = isVertical ? 'left' : 'top';
    var measurement = isVertical ? 'width' : 'height';

    var shiftOffsets = {
      start: defineProperty({}, side, reference[side]),
      end: defineProperty({}, side, reference[side] + reference[measurement] - popper[measurement])
    };

    data.offsets.popper = _extends({}, popper, shiftOffsets[shiftvariation]);
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by update method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function hide(data) {
  if (!isModifierRequired(data.instance.modifiers, 'hide', 'preventOverflow')) {
    return data;
  }

  var refRect = data.offsets.reference;
  var bound = find(data.instance.modifiers, function (modifier) {
    return modifier.name === 'preventOverflow';
  }).boundaries;

  if (refRect.bottom < bound.top || refRect.left > bound.right || refRect.top > bound.bottom || refRect.right < bound.left) {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === true) {
      return data;
    }

    data.hide = true;
    data.attributes['x-out-of-boundaries'] = '';
  } else {
    // Avoid unnecessary DOM access if visibility hasn't changed
    if (data.hide === false) {
      return data;
    }

    data.hide = false;
    data.attributes['x-out-of-boundaries'] = false;
  }

  return data;
}

/**
 * @function
 * @memberof Modifiers
 * @argument {Object} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {Object} The data object, properly modified
 */
function inner(data) {
  var placement = data.placement;
  var basePlacement = placement.split('-')[0];
  var _data$offsets = data.offsets,
      popper = _data$offsets.popper,
      reference = _data$offsets.reference;

  var isHoriz = ['left', 'right'].indexOf(basePlacement) !== -1;

  var subtractLength = ['top', 'left'].indexOf(basePlacement) === -1;

  popper[isHoriz ? 'left' : 'top'] = reference[basePlacement] - (subtractLength ? popper[isHoriz ? 'width' : 'height'] : 0);

  data.placement = getOppositePlacement(placement);
  data.offsets.popper = getClientRect(popper);

  return data;
}

/**
 * Modifier function, each modifier can have a function of this type assigned
 * to its `fn` property.<br />
 * These functions will be called on each update, this means that you must
 * make sure they are performant enough to avoid performance bottlenecks.
 *
 * @function ModifierFn
 * @argument {dataObject} data - The data object generated by `update` method
 * @argument {Object} options - Modifiers configuration and options
 * @returns {dataObject} The data object, properly modified
 */

/**
 * Modifiers are plugins used to alter the behavior of your poppers.<br />
 * Popper.js uses a set of 9 modifiers to provide all the basic functionalities
 * needed by the library.
 *
 * Usually you don't want to override the `order`, `fn` and `onLoad` props.
 * All the other properties are configurations that could be tweaked.
 * @namespace modifiers
 */
var modifiers = {
  /**
   * Modifier used to shift the popper on the start or end of its reference
   * element.<br />
   * It will read the variation of the `placement` property.<br />
   * It can be one either `-end` or `-start`.
   * @memberof modifiers
   * @inner
   */
  shift: {
    /** @prop {number} order=100 - Index used to define the order of execution */
    order: 100,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: shift
  },

  /**
   * The `offset` modifier can shift your popper on both its axis.
   *
   * It accepts the following units:
   * - `px` or unitless, interpreted as pixels
   * - `%` or `%r`, percentage relative to the length of the reference element
   * - `%p`, percentage relative to the length of the popper element
   * - `vw`, CSS viewport width unit
   * - `vh`, CSS viewport height unit
   *
   * For length is intended the main axis relative to the placement of the popper.<br />
   * This means that if the placement is `top` or `bottom`, the length will be the
   * `width`. In case of `left` or `right`, it will be the height.
   *
   * You can provide a single value (as `Number` or `String`), or a pair of values
   * as `String` divided by a comma or one (or more) white spaces.<br />
   * The latter is a deprecated method because it leads to confusion and will be
   * removed in v2.<br />
   * Additionally, it accepts additions and subtractions between different units.
   * Note that multiplications and divisions aren't supported.
   *
   * Valid examples are:
   * ```
   * 10
   * '10%'
   * '10, 10'
   * '10%, 10'
   * '10 + 10%'
   * '10 - 5vh + 3%'
   * '-10px + 5vh, 5px - 6%'
   * ```
   * > **NB**: If you desire to apply offsets to your poppers in a way that may make them overlap
   * > with their reference element, unfortunately, you will have to disable the `flip` modifier.
   * > More on this [reading this issue](https://github.com/FezVrasta/popper.js/issues/373)
   *
   * @memberof modifiers
   * @inner
   */
  offset: {
    /** @prop {number} order=200 - Index used to define the order of execution */
    order: 200,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: offset,
    /** @prop {Number|String} offset=0
     * The offset value as described in the modifier description
     */
    offset: 0
  },

  /**
   * Modifier used to prevent the popper from being positioned outside the boundary.
   *
   * An scenario exists where the reference itself is not within the boundaries.<br />
   * We can say it has "escaped the boundaries" — or just "escaped".<br />
   * In this case we need to decide whether the popper should either:
   *
   * - detach from the reference and remain "trapped" in the boundaries, or
   * - if it should ignore the boundary and "escape with its reference"
   *
   * When `escapeWithReference` is set to`true` and reference is completely
   * outside its boundaries, the popper will overflow (or completely leave)
   * the boundaries in order to remain attached to the edge of the reference.
   *
   * @memberof modifiers
   * @inner
   */
  preventOverflow: {
    /** @prop {number} order=300 - Index used to define the order of execution */
    order: 300,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: preventOverflow,
    /**
     * @prop {Array} [priority=['left','right','top','bottom']]
     * Popper will try to prevent overflow following these priorities by default,
     * then, it could overflow on the left and on top of the `boundariesElement`
     */
    priority: ['left', 'right', 'top', 'bottom'],
    /**
     * @prop {number} padding=5
     * Amount of pixel used to define a minimum distance between the boundaries
     * and the popper this makes sure the popper has always a little padding
     * between the edges of its container
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='scrollParent'
     * Boundaries used by the modifier, can be `scrollParent`, `window`,
     * `viewport` or any DOM element.
     */
    boundariesElement: 'scrollParent'
  },

  /**
   * Modifier used to make sure the reference and its popper stay near eachothers
   * without leaving any gap between the two. Expecially useful when the arrow is
   * enabled and you want to assure it to point to its reference element.
   * It cares only about the first axis, you can still have poppers with margin
   * between the popper and its reference element.
   * @memberof modifiers
   * @inner
   */
  keepTogether: {
    /** @prop {number} order=400 - Index used to define the order of execution */
    order: 400,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: keepTogether
  },

  /**
   * This modifier is used to move the `arrowElement` of the popper to make
   * sure it is positioned between the reference element and its popper element.
   * It will read the outer size of the `arrowElement` node to detect how many
   * pixels of conjuction are needed.
   *
   * It has no effect if no `arrowElement` is provided.
   * @memberof modifiers
   * @inner
   */
  arrow: {
    /** @prop {number} order=500 - Index used to define the order of execution */
    order: 500,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: arrow,
    /** @prop {String|HTMLElement} element='[x-arrow]' - Selector or node used as arrow */
    element: '[x-arrow]'
  },

  /**
   * Modifier used to flip the popper's placement when it starts to overlap its
   * reference element.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   *
   * **NOTE:** this modifier will interrupt the current update cycle and will
   * restart it if it detects the need to flip the placement.
   * @memberof modifiers
   * @inner
   */
  flip: {
    /** @prop {number} order=600 - Index used to define the order of execution */
    order: 600,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: flip,
    /**
     * @prop {String|Array} behavior='flip'
     * The behavior used to change the popper's placement. It can be one of
     * `flip`, `clockwise`, `counterclockwise` or an array with a list of valid
     * placements (with optional variations).
     */
    behavior: 'flip',
    /**
     * @prop {number} padding=5
     * The popper will flip if it hits the edges of the `boundariesElement`
     */
    padding: 5,
    /**
     * @prop {String|HTMLElement} boundariesElement='viewport'
     * The element which will define the boundaries of the popper position,
     * the popper will never be placed outside of the defined boundaries
     * (except if keepTogether is enabled)
     */
    boundariesElement: 'viewport'
  },

  /**
   * Modifier used to make the popper flow toward the inner of the reference element.
   * By default, when this modifier is disabled, the popper will be placed outside
   * the reference element.
   * @memberof modifiers
   * @inner
   */
  inner: {
    /** @prop {number} order=700 - Index used to define the order of execution */
    order: 700,
    /** @prop {Boolean} enabled=false - Whether the modifier is enabled or not */
    enabled: false,
    /** @prop {ModifierFn} */
    fn: inner
  },

  /**
   * Modifier used to hide the popper when its reference element is outside of the
   * popper boundaries. It will set a `x-out-of-boundaries` attribute which can
   * be used to hide with a CSS selector the popper when its reference is
   * out of boundaries.
   *
   * Requires the `preventOverflow` modifier before it in order to work.
   * @memberof modifiers
   * @inner
   */
  hide: {
    /** @prop {number} order=800 - Index used to define the order of execution */
    order: 800,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: hide
  },

  /**
   * Computes the style that will be applied to the popper element to gets
   * properly positioned.
   *
   * Note that this modifier will not touch the DOM, it just prepares the styles
   * so that `applyStyle` modifier can apply it. This separation is useful
   * in case you need to replace `applyStyle` with a custom implementation.
   *
   * This modifier has `850` as `order` value to maintain backward compatibility
   * with previous versions of Popper.js. Expect the modifiers ordering method
   * to change in future major versions of the library.
   *
   * @memberof modifiers
   * @inner
   */
  computeStyle: {
    /** @prop {number} order=850 - Index used to define the order of execution */
    order: 850,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: computeStyle,
    /**
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3d transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties.
     */
    gpuAcceleration: true,
    /**
     * @prop {string} [x='bottom']
     * Where to anchor the X axis (`bottom` or `top`). AKA X offset origin.
     * Change this if your popper should grow in a direction different from `bottom`
     */
    x: 'bottom',
    /**
     * @prop {string} [x='left']
     * Where to anchor the Y axis (`left` or `right`). AKA Y offset origin.
     * Change this if your popper should grow in a direction different from `right`
     */
    y: 'right'
  },

  /**
   * Applies the computed styles to the popper element.
   *
   * All the DOM manipulations are limited to this modifier. This is useful in case
   * you want to integrate Popper.js inside a framework or view library and you
   * want to delegate all the DOM manipulations to it.
   *
   * Note that if you disable this modifier, you must make sure the popper element
   * has its position set to `absolute` before Popper.js can do its work!
   *
   * Just disable this modifier and define you own to achieve the desired effect.
   *
   * @memberof modifiers
   * @inner
   */
  applyStyle: {
    /** @prop {number} order=900 - Index used to define the order of execution */
    order: 900,
    /** @prop {Boolean} enabled=true - Whether the modifier is enabled or not */
    enabled: true,
    /** @prop {ModifierFn} */
    fn: applyStyle,
    /** @prop {Function} */
    onLoad: applyStyleOnLoad,
    /**
     * @deprecated since version 1.10.0, the property moved to `computeStyle` modifier
     * @prop {Boolean} gpuAcceleration=true
     * If true, it uses the CSS 3d transformation to position the popper.
     * Otherwise, it will use the `top` and `left` properties.
     */
    gpuAcceleration: undefined
  }
};

/**
 * The `dataObject` is an object containing all the informations used by Popper.js
 * this object get passed to modifiers and to the `onCreate` and `onUpdate` callbacks.
 * @name dataObject
 * @property {Object} data.instance The Popper.js instance
 * @property {String} data.placement Placement applied to popper
 * @property {String} data.originalPlacement Placement originally defined on init
 * @property {Boolean} data.flipped True if popper has been flipped by flip modifier
 * @property {Boolean} data.hide True if the reference element is out of boundaries, useful to know when to hide the popper.
 * @property {HTMLElement} data.arrowElement Node used as arrow by arrow modifier
 * @property {Object} data.styles Any CSS property defined here will be applied to the popper, it expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.arrowStyles Any CSS property defined here will be applied to the popper arrow, it expects the JavaScript nomenclature (eg. `marginBottom`)
 * @property {Object} data.boundaries Offsets of the popper boundaries
 * @property {Object} data.offsets The measurements of popper, reference and arrow elements.
 * @property {Object} data.offsets.popper `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.reference `top`, `left`, `width`, `height` values
 * @property {Object} data.offsets.arrow] `top` and `left` offsets, only one of them will be different from 0
 */

/**
 * Default options provided to Popper.js constructor.<br />
 * These can be overriden using the `options` argument of Popper.js.<br />
 * To override an option, simply pass as 3rd argument an object with the same
 * structure of this object, example:
 * ```
 * new Popper(ref, pop, {
 *   modifiers: {
 *     preventOverflow: { enabled: false }
 *   }
 * })
 * ```
 * @type {Object}
 * @static
 * @memberof Popper
 */
var Defaults = {
  /**
   * Popper's placement
   * @prop {Popper.placements} placement='bottom'
   */
  placement: 'bottom',

  /**
   * Set this to true if you want popper to position it self in 'fixed' mode
   * @prop {Boolean} positionFixed=false
   */
  positionFixed: false,

  /**
   * Whether events (resize, scroll) are initially enabled
   * @prop {Boolean} eventsEnabled=true
   */
  eventsEnabled: true,

  /**
   * Set to true if you want to automatically remove the popper when
   * you call the `destroy` method.
   * @prop {Boolean} removeOnDestroy=false
   */
  removeOnDestroy: false,

  /**
   * Callback called when the popper is created.<br />
   * By default, is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onCreate}
   */
  onCreate: function onCreate() {},

  /**
   * Callback called when the popper is updated, this callback is not called
   * on the initialization/creation of the popper, but only on subsequent
   * updates.<br />
   * By default, is set to no-op.<br />
   * Access Popper.js instance with `data.instance`.
   * @prop {onUpdate}
   */
  onUpdate: function onUpdate() {},

  /**
   * List of modifiers used to modify the offsets before they are applied to the popper.
   * They provide most of the functionalities of Popper.js
   * @prop {modifiers}
   */
  modifiers: modifiers
};

/**
 * @callback onCreate
 * @param {dataObject} data
 */

/**
 * @callback onUpdate
 * @param {dataObject} data
 */

// Utils
// Methods
var Popper = function () {
  /**
   * Create a new Popper.js instance
   * @class Popper
   * @param {HTMLElement|referenceObject} reference - The reference element used to position the popper
   * @param {HTMLElement} popper - The HTML element used as popper.
   * @param {Object} options - Your custom options to override the ones defined in [Defaults](#defaults)
   * @return {Object} instance - The generated Popper.js instance
   */
  function Popper(reference, popper) {
    var _this = this;

    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    classCallCheck(this, Popper);

    this.scheduleUpdate = function () {
      return requestAnimationFrame(_this.update);
    };

    // make update() debounced, so that it only runs at most once-per-tick
    this.update = debounce(this.update.bind(this));

    // with {} we create a new object with the options inside it
    this.options = _extends({}, Popper.Defaults, options);

    // init state
    this.state = {
      isDestroyed: false,
      isCreated: false,
      scrollParents: []
    };

    // get reference and popper elements (allow jQuery wrappers)
    this.reference = reference && reference.jquery ? reference[0] : reference;
    this.popper = popper && popper.jquery ? popper[0] : popper;

    // Deep merge modifiers options
    this.options.modifiers = {};
    Object.keys(_extends({}, Popper.Defaults.modifiers, options.modifiers)).forEach(function (name) {
      _this.options.modifiers[name] = _extends({}, Popper.Defaults.modifiers[name] || {}, options.modifiers ? options.modifiers[name] : {});
    });

    // Refactoring modifiers' list (Object => Array)
    this.modifiers = Object.keys(this.options.modifiers).map(function (name) {
      return _extends({
        name: name
      }, _this.options.modifiers[name]);
    })
    // sort the modifiers by order
    .sort(function (a, b) {
      return a.order - b.order;
    });

    // modifiers have the ability to execute arbitrary code when Popper.js get inited
    // such code is executed in the same order of its modifier
    // they could add new properties to their options configuration
    // BE AWARE: don't add options to `options.modifiers.name` but to `modifierOptions`!
    this.modifiers.forEach(function (modifierOptions) {
      if (modifierOptions.enabled && isFunction(modifierOptions.onLoad)) {
        modifierOptions.onLoad(_this.reference, _this.popper, _this.options, modifierOptions, _this.state);
      }
    });

    // fire the first update to position the popper in the right place
    this.update();

    var eventsEnabled = this.options.eventsEnabled;
    if (eventsEnabled) {
      // setup event listeners, they will take care of update the position in specific situations
      this.enableEventListeners();
    }

    this.state.eventsEnabled = eventsEnabled;
  }

  // We can't use class properties because they don't get listed in the
  // class prototype and break stuff like Sinon stubs


  createClass(Popper, [{
    key: 'update',
    value: function update$$1() {
      return update.call(this);
    }
  }, {
    key: 'destroy',
    value: function destroy$$1() {
      return destroy.call(this);
    }
  }, {
    key: 'enableEventListeners',
    value: function enableEventListeners$$1() {
      return enableEventListeners.call(this);
    }
  }, {
    key: 'disableEventListeners',
    value: function disableEventListeners$$1() {
      return disableEventListeners.call(this);
    }

    /**
     * Schedule an update, it will run on the next UI update available
     * @method scheduleUpdate
     * @memberof Popper
     */


    /**
     * Collection of utilities useful when writing custom modifiers.
     * Starting from version 1.7, this method is available only if you
     * include `popper-utils.js` before `popper.js`.
     *
     * **DEPRECATION**: This way to access PopperUtils is deprecated
     * and will be removed in v2! Use the PopperUtils module directly instead.
     * Due to the high instability of the methods contained in Utils, we can't
     * guarantee them to follow semver. Use them at your own risk!
     * @static
     * @private
     * @type {Object}
     * @deprecated since version 1.8
     * @member Utils
     * @memberof Popper
     */

  }]);
  return Popper;
}();

/**
 * The `referenceObject` is an object that provides an interface compatible with Popper.js
 * and lets you use it as replacement of a real DOM node.<br />
 * You can use this method to position a popper relatively to a set of coordinates
 * in case you don't have a DOM node to use as reference.
 *
 * ```
 * new Popper(referenceObject, popperNode);
 * ```
 *
 * NB: This feature isn't supported in Internet Explorer 10
 * @name referenceObject
 * @property {Function} data.getBoundingClientRect
 * A function that returns a set of coordinates compatible with the native `getBoundingClientRect` method.
 * @property {number} data.clientWidth
 * An ES6 getter that will return the width of the virtual reference element.
 * @property {number} data.clientHeight
 * An ES6 getter that will return the height of the virtual reference element.
 */


Popper.Utils = (typeof window !== 'undefined' ? window : global).PopperUtils;
Popper.placements = placements;
Popper.Defaults = Defaults;

/* harmony default export */ __webpack_exports__["default"] = (Popper);
//# sourceMappingURL=popper.js.map

/* WEBPACK VAR INJECTION */}.call(__webpack_exports__, __webpack_require__(19)))

/***/ }),
/* 19 */,
/* 20 */,
/* 21 */,
/* 22 */,
/* 23 */,
/* 24 */,
/* 25 */,
/* 26 */,
/* 27 */,
/* 28 */,
/* 29 */,
/* 30 */,
/* 31 */,
/* 32 */,
/* 33 */,
/* 34 */
/***/ (function(module, exports, __webpack_require__) {


window._ = __webpack_require__(36);
window.Popper = __webpack_require__(18).default;
window.Vue = __webpack_require__(37);
/**
 * We'll load jQuery and the Bootstrap jQuery plugin which provides support
 * for JavaScript based Bootstrap features such as modals and tabs. This
 * code may be modified to fit the specific needs of your application.
 */

try {
  window.$ = window.jQuery = __webpack_require__(20);

  __webpack_require__(35);
} catch (e) {}

/**
 * We'll load the axios HTTP library which allows us to easily issue requests
 * to our Laravel back-end. This library automatically handles sending the
 * CSRF token as a header based on the value of the "XSRF" token cookie.
 */

window.axios = __webpack_require__(38);

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Next we will register the CSRF Token as a common header with Axios so that
 * all outgoing HTTP requests automatically have it attached. This is just
 * a simple convenience so we don't have to attach every token manually.
 */

var token = document.head.querySelector('meta[name="csrf-token"]');

if (token) {
  window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
} else {
  console.error('CSRF token not found: https://laravel.com/docs/csrf#csrf-x-csrf-token');
}

/**
 * Echo exposes an expressive API for subscribing to channels and listening
 * for events that are broadcast by Laravel. Echo and event broadcasting
 * allows your team to easily build robust real-time web applications.
 */

// import Echo from 'laravel-echo'

// window.Pusher = require('pusher-js');

// window.Echo = new Echo({
//     broadcaster: 'pusher',
//     key: process.env.MIX_PUSHER_APP_KEY,
//     cluster: process.env.MIX_PUSHER_APP_CLUSTER,
//     encrypted: true
// });

/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

/*!
  * Bootstrap v4.0.0 (https://getbootstrap.com)
  * Copyright 2011-2018 The Bootstrap Authors (https://github.com/twbs/bootstrap/graphs/contributors)
  * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
  */
(function (global, factory) {
	 true ? factory(exports, __webpack_require__(20), __webpack_require__(18)) :
	typeof define === 'function' && define.amd ? define(['exports', 'jquery', 'popper.js'], factory) :
	(factory((global.bootstrap = {}),global.jQuery,global.Popper));
}(this, (function (exports,$,Popper) { 'use strict';

$ = $ && $.hasOwnProperty('default') ? $['default'] : $;
Popper = Popper && Popper.hasOwnProperty('default') ? Popper['default'] : Popper;

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): util.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Util = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Private TransitionEnd Helpers
   * ------------------------------------------------------------------------
   */
  var transition = false;
  var MAX_UID = 1000000; // Shoutout AngusCroll (https://goo.gl/pxwQGp)

  function toType(obj) {
    return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
  }

  function getSpecialTransitionEndEvent() {
    return {
      bindType: transition.end,
      delegateType: transition.end,
      handle: function handle(event) {
        if ($$$1(event.target).is(this)) {
          return event.handleObj.handler.apply(this, arguments); // eslint-disable-line prefer-rest-params
        }

        return undefined; // eslint-disable-line no-undefined
      }
    };
  }

  function transitionEndTest() {
    if (typeof window !== 'undefined' && window.QUnit) {
      return false;
    }

    return {
      end: 'transitionend'
    };
  }

  function transitionEndEmulator(duration) {
    var _this = this;

    var called = false;
    $$$1(this).one(Util.TRANSITION_END, function () {
      called = true;
    });
    setTimeout(function () {
      if (!called) {
        Util.triggerTransitionEnd(_this);
      }
    }, duration);
    return this;
  }

  function setTransitionEndSupport() {
    transition = transitionEndTest();
    $$$1.fn.emulateTransitionEnd = transitionEndEmulator;

    if (Util.supportsTransitionEnd()) {
      $$$1.event.special[Util.TRANSITION_END] = getSpecialTransitionEndEvent();
    }
  }

  function escapeId(selector) {
    // We escape IDs in case of special selectors (selector = '#myId:something')
    // $.escapeSelector does not exist in jQuery < 3
    selector = typeof $$$1.escapeSelector === 'function' ? $$$1.escapeSelector(selector).substr(1) : selector.replace(/(:|\.|\[|\]|,|=|@)/g, '\\$1');
    return selector;
  }
  /**
   * --------------------------------------------------------------------------
   * Public Util Api
   * --------------------------------------------------------------------------
   */


  var Util = {
    TRANSITION_END: 'bsTransitionEnd',
    getUID: function getUID(prefix) {
      do {
        // eslint-disable-next-line no-bitwise
        prefix += ~~(Math.random() * MAX_UID); // "~~" acts like a faster Math.floor() here
      } while (document.getElementById(prefix));

      return prefix;
    },
    getSelectorFromElement: function getSelectorFromElement(element) {
      var selector = element.getAttribute('data-target');

      if (!selector || selector === '#') {
        selector = element.getAttribute('href') || '';
      } // If it's an ID


      if (selector.charAt(0) === '#') {
        selector = escapeId(selector);
      }

      try {
        var $selector = $$$1(document).find(selector);
        return $selector.length > 0 ? selector : null;
      } catch (err) {
        return null;
      }
    },
    reflow: function reflow(element) {
      return element.offsetHeight;
    },
    triggerTransitionEnd: function triggerTransitionEnd(element) {
      $$$1(element).trigger(transition.end);
    },
    supportsTransitionEnd: function supportsTransitionEnd() {
      return Boolean(transition);
    },
    isElement: function isElement(obj) {
      return (obj[0] || obj).nodeType;
    },
    typeCheckConfig: function typeCheckConfig(componentName, config, configTypes) {
      for (var property in configTypes) {
        if (Object.prototype.hasOwnProperty.call(configTypes, property)) {
          var expectedTypes = configTypes[property];
          var value = config[property];
          var valueType = value && Util.isElement(value) ? 'element' : toType(value);

          if (!new RegExp(expectedTypes).test(valueType)) {
            throw new Error(componentName.toUpperCase() + ": " + ("Option \"" + property + "\" provided type \"" + valueType + "\" ") + ("but expected type \"" + expectedTypes + "\"."));
          }
        }
      }
    }
  };
  setTransitionEndSupport();
  return Util;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): alert.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Alert = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'alert';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.alert';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var TRANSITION_DURATION = 150;
  var Selector = {
    DISMISS: '[data-dismiss="alert"]'
  };
  var Event = {
    CLOSE: "close" + EVENT_KEY,
    CLOSED: "closed" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    ALERT: 'alert',
    FADE: 'fade',
    SHOW: 'show'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Alert =
  /*#__PURE__*/
  function () {
    function Alert(element) {
      this._element = element;
    } // Getters


    var _proto = Alert.prototype;

    // Public
    _proto.close = function close(element) {
      element = element || this._element;

      var rootElement = this._getRootElement(element);

      var customEvent = this._triggerCloseEvent(rootElement);

      if (customEvent.isDefaultPrevented()) {
        return;
      }

      this._removeElement(rootElement);
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      this._element = null;
    }; // Private


    _proto._getRootElement = function _getRootElement(element) {
      var selector = Util.getSelectorFromElement(element);
      var parent = false;

      if (selector) {
        parent = $$$1(selector)[0];
      }

      if (!parent) {
        parent = $$$1(element).closest("." + ClassName.ALERT)[0];
      }

      return parent;
    };

    _proto._triggerCloseEvent = function _triggerCloseEvent(element) {
      var closeEvent = $$$1.Event(Event.CLOSE);
      $$$1(element).trigger(closeEvent);
      return closeEvent;
    };

    _proto._removeElement = function _removeElement(element) {
      var _this = this;

      $$$1(element).removeClass(ClassName.SHOW);

      if (!Util.supportsTransitionEnd() || !$$$1(element).hasClass(ClassName.FADE)) {
        this._destroyElement(element);

        return;
      }

      $$$1(element).one(Util.TRANSITION_END, function (event) {
        return _this._destroyElement(element, event);
      }).emulateTransitionEnd(TRANSITION_DURATION);
    };

    _proto._destroyElement = function _destroyElement(element) {
      $$$1(element).detach().trigger(Event.CLOSED).remove();
    }; // Static


    Alert._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $element = $$$1(this);
        var data = $element.data(DATA_KEY);

        if (!data) {
          data = new Alert(this);
          $element.data(DATA_KEY, data);
        }

        if (config === 'close') {
          data[config](this);
        }
      });
    };

    Alert._handleDismiss = function _handleDismiss(alertInstance) {
      return function (event) {
        if (event) {
          event.preventDefault();
        }

        alertInstance.close(this);
      };
    };

    _createClass(Alert, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);
    return Alert;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.CLICK_DATA_API, Selector.DISMISS, Alert._handleDismiss(new Alert()));
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Alert._jQueryInterface;
  $$$1.fn[NAME].Constructor = Alert;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Alert._jQueryInterface;
  };

  return Alert;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): button.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Button = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'button';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.button';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var ClassName = {
    ACTIVE: 'active',
    BUTTON: 'btn',
    FOCUS: 'focus'
  };
  var Selector = {
    DATA_TOGGLE_CARROT: '[data-toggle^="button"]',
    DATA_TOGGLE: '[data-toggle="buttons"]',
    INPUT: 'input',
    ACTIVE: '.active',
    BUTTON: '.btn'
  };
  var Event = {
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
    FOCUS_BLUR_DATA_API: "focus" + EVENT_KEY + DATA_API_KEY + " " + ("blur" + EVENT_KEY + DATA_API_KEY)
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Button =
  /*#__PURE__*/
  function () {
    function Button(element) {
      this._element = element;
    } // Getters


    var _proto = Button.prototype;

    // Public
    _proto.toggle = function toggle() {
      var triggerChangeEvent = true;
      var addAriaPressed = true;
      var rootElement = $$$1(this._element).closest(Selector.DATA_TOGGLE)[0];

      if (rootElement) {
        var input = $$$1(this._element).find(Selector.INPUT)[0];

        if (input) {
          if (input.type === 'radio') {
            if (input.checked && $$$1(this._element).hasClass(ClassName.ACTIVE)) {
              triggerChangeEvent = false;
            } else {
              var activeElement = $$$1(rootElement).find(Selector.ACTIVE)[0];

              if (activeElement) {
                $$$1(activeElement).removeClass(ClassName.ACTIVE);
              }
            }
          }

          if (triggerChangeEvent) {
            if (input.hasAttribute('disabled') || rootElement.hasAttribute('disabled') || input.classList.contains('disabled') || rootElement.classList.contains('disabled')) {
              return;
            }

            input.checked = !$$$1(this._element).hasClass(ClassName.ACTIVE);
            $$$1(input).trigger('change');
          }

          input.focus();
          addAriaPressed = false;
        }
      }

      if (addAriaPressed) {
        this._element.setAttribute('aria-pressed', !$$$1(this._element).hasClass(ClassName.ACTIVE));
      }

      if (triggerChangeEvent) {
        $$$1(this._element).toggleClass(ClassName.ACTIVE);
      }
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      this._element = null;
    }; // Static


    Button._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        if (!data) {
          data = new Button(this);
          $$$1(this).data(DATA_KEY, data);
        }

        if (config === 'toggle') {
          data[config]();
        }
      });
    };

    _createClass(Button, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);
    return Button;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE_CARROT, function (event) {
    event.preventDefault();
    var button = event.target;

    if (!$$$1(button).hasClass(ClassName.BUTTON)) {
      button = $$$1(button).closest(Selector.BUTTON);
    }

    Button._jQueryInterface.call($$$1(button), 'toggle');
  }).on(Event.FOCUS_BLUR_DATA_API, Selector.DATA_TOGGLE_CARROT, function (event) {
    var button = $$$1(event.target).closest(Selector.BUTTON)[0];
    $$$1(button).toggleClass(ClassName.FOCUS, /^focus(in)?$/.test(event.type));
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Button._jQueryInterface;
  $$$1.fn[NAME].Constructor = Button;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Button._jQueryInterface;
  };

  return Button;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): carousel.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Carousel = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'carousel';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.carousel';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var TRANSITION_DURATION = 600;
  var ARROW_LEFT_KEYCODE = 37; // KeyboardEvent.which value for left arrow key

  var ARROW_RIGHT_KEYCODE = 39; // KeyboardEvent.which value for right arrow key

  var TOUCHEVENT_COMPAT_WAIT = 500; // Time for mouse compat events to fire after touch

  var Default = {
    interval: 5000,
    keyboard: true,
    slide: false,
    pause: 'hover',
    wrap: true
  };
  var DefaultType = {
    interval: '(number|boolean)',
    keyboard: 'boolean',
    slide: '(boolean|string)',
    pause: '(string|boolean)',
    wrap: 'boolean'
  };
  var Direction = {
    NEXT: 'next',
    PREV: 'prev',
    LEFT: 'left',
    RIGHT: 'right'
  };
  var Event = {
    SLIDE: "slide" + EVENT_KEY,
    SLID: "slid" + EVENT_KEY,
    KEYDOWN: "keydown" + EVENT_KEY,
    MOUSEENTER: "mouseenter" + EVENT_KEY,
    MOUSELEAVE: "mouseleave" + EVENT_KEY,
    TOUCHEND: "touchend" + EVENT_KEY,
    LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    CAROUSEL: 'carousel',
    ACTIVE: 'active',
    SLIDE: 'slide',
    RIGHT: 'carousel-item-right',
    LEFT: 'carousel-item-left',
    NEXT: 'carousel-item-next',
    PREV: 'carousel-item-prev',
    ITEM: 'carousel-item'
  };
  var Selector = {
    ACTIVE: '.active',
    ACTIVE_ITEM: '.active.carousel-item',
    ITEM: '.carousel-item',
    NEXT_PREV: '.carousel-item-next, .carousel-item-prev',
    INDICATORS: '.carousel-indicators',
    DATA_SLIDE: '[data-slide], [data-slide-to]',
    DATA_RIDE: '[data-ride="carousel"]'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Carousel =
  /*#__PURE__*/
  function () {
    function Carousel(element, config) {
      this._items = null;
      this._interval = null;
      this._activeElement = null;
      this._isPaused = false;
      this._isSliding = false;
      this.touchTimeout = null;
      this._config = this._getConfig(config);
      this._element = $$$1(element)[0];
      this._indicatorsElement = $$$1(this._element).find(Selector.INDICATORS)[0];

      this._addEventListeners();
    } // Getters


    var _proto = Carousel.prototype;

    // Public
    _proto.next = function next() {
      if (!this._isSliding) {
        this._slide(Direction.NEXT);
      }
    };

    _proto.nextWhenVisible = function nextWhenVisible() {
      // Don't call next when the page isn't visible
      // or the carousel or its parent isn't visible
      if (!document.hidden && $$$1(this._element).is(':visible') && $$$1(this._element).css('visibility') !== 'hidden') {
        this.next();
      }
    };

    _proto.prev = function prev() {
      if (!this._isSliding) {
        this._slide(Direction.PREV);
      }
    };

    _proto.pause = function pause(event) {
      if (!event) {
        this._isPaused = true;
      }

      if ($$$1(this._element).find(Selector.NEXT_PREV)[0] && Util.supportsTransitionEnd()) {
        Util.triggerTransitionEnd(this._element);
        this.cycle(true);
      }

      clearInterval(this._interval);
      this._interval = null;
    };

    _proto.cycle = function cycle(event) {
      if (!event) {
        this._isPaused = false;
      }

      if (this._interval) {
        clearInterval(this._interval);
        this._interval = null;
      }

      if (this._config.interval && !this._isPaused) {
        this._interval = setInterval((document.visibilityState ? this.nextWhenVisible : this.next).bind(this), this._config.interval);
      }
    };

    _proto.to = function to(index) {
      var _this = this;

      this._activeElement = $$$1(this._element).find(Selector.ACTIVE_ITEM)[0];

      var activeIndex = this._getItemIndex(this._activeElement);

      if (index > this._items.length - 1 || index < 0) {
        return;
      }

      if (this._isSliding) {
        $$$1(this._element).one(Event.SLID, function () {
          return _this.to(index);
        });
        return;
      }

      if (activeIndex === index) {
        this.pause();
        this.cycle();
        return;
      }

      var direction = index > activeIndex ? Direction.NEXT : Direction.PREV;

      this._slide(direction, this._items[index]);
    };

    _proto.dispose = function dispose() {
      $$$1(this._element).off(EVENT_KEY);
      $$$1.removeData(this._element, DATA_KEY);
      this._items = null;
      this._config = null;
      this._element = null;
      this._interval = null;
      this._isPaused = null;
      this._isSliding = null;
      this._activeElement = null;
      this._indicatorsElement = null;
    }; // Private


    _proto._getConfig = function _getConfig(config) {
      config = _extends({}, Default, config);
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    _proto._addEventListeners = function _addEventListeners() {
      var _this2 = this;

      if (this._config.keyboard) {
        $$$1(this._element).on(Event.KEYDOWN, function (event) {
          return _this2._keydown(event);
        });
      }

      if (this._config.pause === 'hover') {
        $$$1(this._element).on(Event.MOUSEENTER, function (event) {
          return _this2.pause(event);
        }).on(Event.MOUSELEAVE, function (event) {
          return _this2.cycle(event);
        });

        if ('ontouchstart' in document.documentElement) {
          // If it's a touch-enabled device, mouseenter/leave are fired as
          // part of the mouse compatibility events on first tap - the carousel
          // would stop cycling until user tapped out of it;
          // here, we listen for touchend, explicitly pause the carousel
          // (as if it's the second time we tap on it, mouseenter compat event
          // is NOT fired) and after a timeout (to allow for mouse compatibility
          // events to fire) we explicitly restart cycling
          $$$1(this._element).on(Event.TOUCHEND, function () {
            _this2.pause();

            if (_this2.touchTimeout) {
              clearTimeout(_this2.touchTimeout);
            }

            _this2.touchTimeout = setTimeout(function (event) {
              return _this2.cycle(event);
            }, TOUCHEVENT_COMPAT_WAIT + _this2._config.interval);
          });
        }
      }
    };

    _proto._keydown = function _keydown(event) {
      if (/input|textarea/i.test(event.target.tagName)) {
        return;
      }

      switch (event.which) {
        case ARROW_LEFT_KEYCODE:
          event.preventDefault();
          this.prev();
          break;

        case ARROW_RIGHT_KEYCODE:
          event.preventDefault();
          this.next();
          break;

        default:
      }
    };

    _proto._getItemIndex = function _getItemIndex(element) {
      this._items = $$$1.makeArray($$$1(element).parent().find(Selector.ITEM));
      return this._items.indexOf(element);
    };

    _proto._getItemByDirection = function _getItemByDirection(direction, activeElement) {
      var isNextDirection = direction === Direction.NEXT;
      var isPrevDirection = direction === Direction.PREV;

      var activeIndex = this._getItemIndex(activeElement);

      var lastItemIndex = this._items.length - 1;
      var isGoingToWrap = isPrevDirection && activeIndex === 0 || isNextDirection && activeIndex === lastItemIndex;

      if (isGoingToWrap && !this._config.wrap) {
        return activeElement;
      }

      var delta = direction === Direction.PREV ? -1 : 1;
      var itemIndex = (activeIndex + delta) % this._items.length;
      return itemIndex === -1 ? this._items[this._items.length - 1] : this._items[itemIndex];
    };

    _proto._triggerSlideEvent = function _triggerSlideEvent(relatedTarget, eventDirectionName) {
      var targetIndex = this._getItemIndex(relatedTarget);

      var fromIndex = this._getItemIndex($$$1(this._element).find(Selector.ACTIVE_ITEM)[0]);

      var slideEvent = $$$1.Event(Event.SLIDE, {
        relatedTarget: relatedTarget,
        direction: eventDirectionName,
        from: fromIndex,
        to: targetIndex
      });
      $$$1(this._element).trigger(slideEvent);
      return slideEvent;
    };

    _proto._setActiveIndicatorElement = function _setActiveIndicatorElement(element) {
      if (this._indicatorsElement) {
        $$$1(this._indicatorsElement).find(Selector.ACTIVE).removeClass(ClassName.ACTIVE);

        var nextIndicator = this._indicatorsElement.children[this._getItemIndex(element)];

        if (nextIndicator) {
          $$$1(nextIndicator).addClass(ClassName.ACTIVE);
        }
      }
    };

    _proto._slide = function _slide(direction, element) {
      var _this3 = this;

      var activeElement = $$$1(this._element).find(Selector.ACTIVE_ITEM)[0];

      var activeElementIndex = this._getItemIndex(activeElement);

      var nextElement = element || activeElement && this._getItemByDirection(direction, activeElement);

      var nextElementIndex = this._getItemIndex(nextElement);

      var isCycling = Boolean(this._interval);
      var directionalClassName;
      var orderClassName;
      var eventDirectionName;

      if (direction === Direction.NEXT) {
        directionalClassName = ClassName.LEFT;
        orderClassName = ClassName.NEXT;
        eventDirectionName = Direction.LEFT;
      } else {
        directionalClassName = ClassName.RIGHT;
        orderClassName = ClassName.PREV;
        eventDirectionName = Direction.RIGHT;
      }

      if (nextElement && $$$1(nextElement).hasClass(ClassName.ACTIVE)) {
        this._isSliding = false;
        return;
      }

      var slideEvent = this._triggerSlideEvent(nextElement, eventDirectionName);

      if (slideEvent.isDefaultPrevented()) {
        return;
      }

      if (!activeElement || !nextElement) {
        // Some weirdness is happening, so we bail
        return;
      }

      this._isSliding = true;

      if (isCycling) {
        this.pause();
      }

      this._setActiveIndicatorElement(nextElement);

      var slidEvent = $$$1.Event(Event.SLID, {
        relatedTarget: nextElement,
        direction: eventDirectionName,
        from: activeElementIndex,
        to: nextElementIndex
      });

      if (Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.SLIDE)) {
        $$$1(nextElement).addClass(orderClassName);
        Util.reflow(nextElement);
        $$$1(activeElement).addClass(directionalClassName);
        $$$1(nextElement).addClass(directionalClassName);
        $$$1(activeElement).one(Util.TRANSITION_END, function () {
          $$$1(nextElement).removeClass(directionalClassName + " " + orderClassName).addClass(ClassName.ACTIVE);
          $$$1(activeElement).removeClass(ClassName.ACTIVE + " " + orderClassName + " " + directionalClassName);
          _this3._isSliding = false;
          setTimeout(function () {
            return $$$1(_this3._element).trigger(slidEvent);
          }, 0);
        }).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        $$$1(activeElement).removeClass(ClassName.ACTIVE);
        $$$1(nextElement).addClass(ClassName.ACTIVE);
        this._isSliding = false;
        $$$1(this._element).trigger(slidEvent);
      }

      if (isCycling) {
        this.cycle();
      }
    }; // Static


    Carousel._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        var _config = _extends({}, Default, $$$1(this).data());

        if (typeof config === 'object') {
          _config = _extends({}, _config, config);
        }

        var action = typeof config === 'string' ? config : _config.slide;

        if (!data) {
          data = new Carousel(this, _config);
          $$$1(this).data(DATA_KEY, data);
        }

        if (typeof config === 'number') {
          data.to(config);
        } else if (typeof action === 'string') {
          if (typeof data[action] === 'undefined') {
            throw new TypeError("No method named \"" + action + "\"");
          }

          data[action]();
        } else if (_config.interval) {
          data.pause();
          data.cycle();
        }
      });
    };

    Carousel._dataApiClickHandler = function _dataApiClickHandler(event) {
      var selector = Util.getSelectorFromElement(this);

      if (!selector) {
        return;
      }

      var target = $$$1(selector)[0];

      if (!target || !$$$1(target).hasClass(ClassName.CAROUSEL)) {
        return;
      }

      var config = _extends({}, $$$1(target).data(), $$$1(this).data());
      var slideIndex = this.getAttribute('data-slide-to');

      if (slideIndex) {
        config.interval = false;
      }

      Carousel._jQueryInterface.call($$$1(target), config);

      if (slideIndex) {
        $$$1(target).data(DATA_KEY).to(slideIndex);
      }

      event.preventDefault();
    };

    _createClass(Carousel, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);
    return Carousel;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_SLIDE, Carousel._dataApiClickHandler);
  $$$1(window).on(Event.LOAD_DATA_API, function () {
    $$$1(Selector.DATA_RIDE).each(function () {
      var $carousel = $$$1(this);

      Carousel._jQueryInterface.call($carousel, $carousel.data());
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Carousel._jQueryInterface;
  $$$1.fn[NAME].Constructor = Carousel;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Carousel._jQueryInterface;
  };

  return Carousel;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): collapse.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Collapse = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'collapse';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.collapse';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var TRANSITION_DURATION = 600;
  var Default = {
    toggle: true,
    parent: ''
  };
  var DefaultType = {
    toggle: 'boolean',
    parent: '(string|element)'
  };
  var Event = {
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    SHOW: 'show',
    COLLAPSE: 'collapse',
    COLLAPSING: 'collapsing',
    COLLAPSED: 'collapsed'
  };
  var Dimension = {
    WIDTH: 'width',
    HEIGHT: 'height'
  };
  var Selector = {
    ACTIVES: '.show, .collapsing',
    DATA_TOGGLE: '[data-toggle="collapse"]'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Collapse =
  /*#__PURE__*/
  function () {
    function Collapse(element, config) {
      this._isTransitioning = false;
      this._element = element;
      this._config = this._getConfig(config);
      this._triggerArray = $$$1.makeArray($$$1("[data-toggle=\"collapse\"][href=\"#" + element.id + "\"]," + ("[data-toggle=\"collapse\"][data-target=\"#" + element.id + "\"]")));
      var tabToggles = $$$1(Selector.DATA_TOGGLE);

      for (var i = 0; i < tabToggles.length; i++) {
        var elem = tabToggles[i];
        var selector = Util.getSelectorFromElement(elem);

        if (selector !== null && $$$1(selector).filter(element).length > 0) {
          this._selector = selector;

          this._triggerArray.push(elem);
        }
      }

      this._parent = this._config.parent ? this._getParent() : null;

      if (!this._config.parent) {
        this._addAriaAndCollapsedClass(this._element, this._triggerArray);
      }

      if (this._config.toggle) {
        this.toggle();
      }
    } // Getters


    var _proto = Collapse.prototype;

    // Public
    _proto.toggle = function toggle() {
      if ($$$1(this._element).hasClass(ClassName.SHOW)) {
        this.hide();
      } else {
        this.show();
      }
    };

    _proto.show = function show() {
      var _this = this;

      if (this._isTransitioning || $$$1(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var actives;
      var activesData;

      if (this._parent) {
        actives = $$$1.makeArray($$$1(this._parent).find(Selector.ACTIVES).filter("[data-parent=\"" + this._config.parent + "\"]"));

        if (actives.length === 0) {
          actives = null;
        }
      }

      if (actives) {
        activesData = $$$1(actives).not(this._selector).data(DATA_KEY);

        if (activesData && activesData._isTransitioning) {
          return;
        }
      }

      var startEvent = $$$1.Event(Event.SHOW);
      $$$1(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      if (actives) {
        Collapse._jQueryInterface.call($$$1(actives).not(this._selector), 'hide');

        if (!activesData) {
          $$$1(actives).data(DATA_KEY, null);
        }
      }

      var dimension = this._getDimension();

      $$$1(this._element).removeClass(ClassName.COLLAPSE).addClass(ClassName.COLLAPSING);
      this._element.style[dimension] = 0;

      if (this._triggerArray.length > 0) {
        $$$1(this._triggerArray).removeClass(ClassName.COLLAPSED).attr('aria-expanded', true);
      }

      this.setTransitioning(true);

      var complete = function complete() {
        $$$1(_this._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).addClass(ClassName.SHOW);
        _this._element.style[dimension] = '';

        _this.setTransitioning(false);

        $$$1(_this._element).trigger(Event.SHOWN);
      };

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      var capitalizedDimension = dimension[0].toUpperCase() + dimension.slice(1);
      var scrollSize = "scroll" + capitalizedDimension;
      $$$1(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      this._element.style[dimension] = this._element[scrollSize] + "px";
    };

    _proto.hide = function hide() {
      var _this2 = this;

      if (this._isTransitioning || !$$$1(this._element).hasClass(ClassName.SHOW)) {
        return;
      }

      var startEvent = $$$1.Event(Event.HIDE);
      $$$1(this._element).trigger(startEvent);

      if (startEvent.isDefaultPrevented()) {
        return;
      }

      var dimension = this._getDimension();

      this._element.style[dimension] = this._element.getBoundingClientRect()[dimension] + "px";
      Util.reflow(this._element);
      $$$1(this._element).addClass(ClassName.COLLAPSING).removeClass(ClassName.COLLAPSE).removeClass(ClassName.SHOW);

      if (this._triggerArray.length > 0) {
        for (var i = 0; i < this._triggerArray.length; i++) {
          var trigger = this._triggerArray[i];
          var selector = Util.getSelectorFromElement(trigger);

          if (selector !== null) {
            var $elem = $$$1(selector);

            if (!$elem.hasClass(ClassName.SHOW)) {
              $$$1(trigger).addClass(ClassName.COLLAPSED).attr('aria-expanded', false);
            }
          }
        }
      }

      this.setTransitioning(true);

      var complete = function complete() {
        _this2.setTransitioning(false);

        $$$1(_this2._element).removeClass(ClassName.COLLAPSING).addClass(ClassName.COLLAPSE).trigger(Event.HIDDEN);
      };

      this._element.style[dimension] = '';

      if (!Util.supportsTransitionEnd()) {
        complete();
        return;
      }

      $$$1(this._element).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
    };

    _proto.setTransitioning = function setTransitioning(isTransitioning) {
      this._isTransitioning = isTransitioning;
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      this._config = null;
      this._parent = null;
      this._element = null;
      this._triggerArray = null;
      this._isTransitioning = null;
    }; // Private


    _proto._getConfig = function _getConfig(config) {
      config = _extends({}, Default, config);
      config.toggle = Boolean(config.toggle); // Coerce string values

      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    _proto._getDimension = function _getDimension() {
      var hasWidth = $$$1(this._element).hasClass(Dimension.WIDTH);
      return hasWidth ? Dimension.WIDTH : Dimension.HEIGHT;
    };

    _proto._getParent = function _getParent() {
      var _this3 = this;

      var parent = null;

      if (Util.isElement(this._config.parent)) {
        parent = this._config.parent; // It's a jQuery object

        if (typeof this._config.parent.jquery !== 'undefined') {
          parent = this._config.parent[0];
        }
      } else {
        parent = $$$1(this._config.parent)[0];
      }

      var selector = "[data-toggle=\"collapse\"][data-parent=\"" + this._config.parent + "\"]";
      $$$1(parent).find(selector).each(function (i, element) {
        _this3._addAriaAndCollapsedClass(Collapse._getTargetFromElement(element), [element]);
      });
      return parent;
    };

    _proto._addAriaAndCollapsedClass = function _addAriaAndCollapsedClass(element, triggerArray) {
      if (element) {
        var isOpen = $$$1(element).hasClass(ClassName.SHOW);

        if (triggerArray.length > 0) {
          $$$1(triggerArray).toggleClass(ClassName.COLLAPSED, !isOpen).attr('aria-expanded', isOpen);
        }
      }
    }; // Static


    Collapse._getTargetFromElement = function _getTargetFromElement(element) {
      var selector = Util.getSelectorFromElement(element);
      return selector ? $$$1(selector)[0] : null;
    };

    Collapse._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $$$1(this);
        var data = $this.data(DATA_KEY);

        var _config = _extends({}, Default, $this.data(), typeof config === 'object' && config);

        if (!data && _config.toggle && /show|hide/.test(config)) {
          _config.toggle = false;
        }

        if (!data) {
          data = new Collapse(this, _config);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Collapse, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);
    return Collapse;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    // preventDefault only for <a> elements (which change the URL) not inside the collapsible element
    if (event.currentTarget.tagName === 'A') {
      event.preventDefault();
    }

    var $trigger = $$$1(this);
    var selector = Util.getSelectorFromElement(this);
    $$$1(selector).each(function () {
      var $target = $$$1(this);
      var data = $target.data(DATA_KEY);
      var config = data ? 'toggle' : $trigger.data();

      Collapse._jQueryInterface.call($target, config);
    });
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Collapse._jQueryInterface;
  $$$1.fn[NAME].Constructor = Collapse;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Collapse._jQueryInterface;
  };

  return Collapse;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): dropdown.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Dropdown = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'dropdown';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.dropdown';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var SPACE_KEYCODE = 32; // KeyboardEvent.which value for space key

  var TAB_KEYCODE = 9; // KeyboardEvent.which value for tab key

  var ARROW_UP_KEYCODE = 38; // KeyboardEvent.which value for up arrow key

  var ARROW_DOWN_KEYCODE = 40; // KeyboardEvent.which value for down arrow key

  var RIGHT_MOUSE_BUTTON_WHICH = 3; // MouseEvent.which value for the right button (assuming a right-handed mouse)

  var REGEXP_KEYDOWN = new RegExp(ARROW_UP_KEYCODE + "|" + ARROW_DOWN_KEYCODE + "|" + ESCAPE_KEYCODE);
  var Event = {
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    CLICK: "click" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY,
    KEYDOWN_DATA_API: "keydown" + EVENT_KEY + DATA_API_KEY,
    KEYUP_DATA_API: "keyup" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    DISABLED: 'disabled',
    SHOW: 'show',
    DROPUP: 'dropup',
    DROPRIGHT: 'dropright',
    DROPLEFT: 'dropleft',
    MENURIGHT: 'dropdown-menu-right',
    MENULEFT: 'dropdown-menu-left',
    POSITION_STATIC: 'position-static'
  };
  var Selector = {
    DATA_TOGGLE: '[data-toggle="dropdown"]',
    FORM_CHILD: '.dropdown form',
    MENU: '.dropdown-menu',
    NAVBAR_NAV: '.navbar-nav',
    VISIBLE_ITEMS: '.dropdown-menu .dropdown-item:not(.disabled)'
  };
  var AttachmentMap = {
    TOP: 'top-start',
    TOPEND: 'top-end',
    BOTTOM: 'bottom-start',
    BOTTOMEND: 'bottom-end',
    RIGHT: 'right-start',
    RIGHTEND: 'right-end',
    LEFT: 'left-start',
    LEFTEND: 'left-end'
  };
  var Default = {
    offset: 0,
    flip: true,
    boundary: 'scrollParent'
  };
  var DefaultType = {
    offset: '(number|string|function)',
    flip: 'boolean',
    boundary: '(string|element)'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Dropdown =
  /*#__PURE__*/
  function () {
    function Dropdown(element, config) {
      this._element = element;
      this._popper = null;
      this._config = this._getConfig(config);
      this._menu = this._getMenuElement();
      this._inNavbar = this._detectNavbar();

      this._addEventListeners();
    } // Getters


    var _proto = Dropdown.prototype;

    // Public
    _proto.toggle = function toggle() {
      if (this._element.disabled || $$$1(this._element).hasClass(ClassName.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this._element);

      var isActive = $$$1(this._menu).hasClass(ClassName.SHOW);

      Dropdown._clearMenus();

      if (isActive) {
        return;
      }

      var relatedTarget = {
        relatedTarget: this._element
      };
      var showEvent = $$$1.Event(Event.SHOW, relatedTarget);
      $$$1(parent).trigger(showEvent);

      if (showEvent.isDefaultPrevented()) {
        return;
      } // Disable totally Popper.js for Dropdown in Navbar


      if (!this._inNavbar) {
        /**
         * Check for Popper dependency
         * Popper - https://popper.js.org
         */
        if (typeof Popper === 'undefined') {
          throw new TypeError('Bootstrap dropdown require Popper.js (https://popper.js.org)');
        }

        var element = this._element; // For dropup with alignment we use the parent as popper container

        if ($$$1(parent).hasClass(ClassName.DROPUP)) {
          if ($$$1(this._menu).hasClass(ClassName.MENULEFT) || $$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
            element = parent;
          }
        } // If boundary is not `scrollParent`, then set position to `static`
        // to allow the menu to "escape" the scroll parent's boundaries
        // https://github.com/twbs/bootstrap/issues/24251


        if (this._config.boundary !== 'scrollParent') {
          $$$1(parent).addClass(ClassName.POSITION_STATIC);
        }

        this._popper = new Popper(element, this._menu, this._getPopperConfig());
      } // If this is a touch-enabled device we add extra
      // empty mouseover listeners to the body's immediate children;
      // only needed because of broken event delegation on iOS
      // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html


      if ('ontouchstart' in document.documentElement && $$$1(parent).closest(Selector.NAVBAR_NAV).length === 0) {
        $$$1('body').children().on('mouseover', null, $$$1.noop);
      }

      this._element.focus();

      this._element.setAttribute('aria-expanded', true);

      $$$1(this._menu).toggleClass(ClassName.SHOW);
      $$$1(parent).toggleClass(ClassName.SHOW).trigger($$$1.Event(Event.SHOWN, relatedTarget));
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      $$$1(this._element).off(EVENT_KEY);
      this._element = null;
      this._menu = null;

      if (this._popper !== null) {
        this._popper.destroy();

        this._popper = null;
      }
    };

    _proto.update = function update() {
      this._inNavbar = this._detectNavbar();

      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    }; // Private


    _proto._addEventListeners = function _addEventListeners() {
      var _this = this;

      $$$1(this._element).on(Event.CLICK, function (event) {
        event.preventDefault();
        event.stopPropagation();

        _this.toggle();
      });
    };

    _proto._getConfig = function _getConfig(config) {
      config = _extends({}, this.constructor.Default, $$$1(this._element).data(), config);
      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);
      return config;
    };

    _proto._getMenuElement = function _getMenuElement() {
      if (!this._menu) {
        var parent = Dropdown._getParentFromElement(this._element);

        this._menu = $$$1(parent).find(Selector.MENU)[0];
      }

      return this._menu;
    };

    _proto._getPlacement = function _getPlacement() {
      var $parentDropdown = $$$1(this._element).parent();
      var placement = AttachmentMap.BOTTOM; // Handle dropup

      if ($parentDropdown.hasClass(ClassName.DROPUP)) {
        placement = AttachmentMap.TOP;

        if ($$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
          placement = AttachmentMap.TOPEND;
        }
      } else if ($parentDropdown.hasClass(ClassName.DROPRIGHT)) {
        placement = AttachmentMap.RIGHT;
      } else if ($parentDropdown.hasClass(ClassName.DROPLEFT)) {
        placement = AttachmentMap.LEFT;
      } else if ($$$1(this._menu).hasClass(ClassName.MENURIGHT)) {
        placement = AttachmentMap.BOTTOMEND;
      }

      return placement;
    };

    _proto._detectNavbar = function _detectNavbar() {
      return $$$1(this._element).closest('.navbar').length > 0;
    };

    _proto._getPopperConfig = function _getPopperConfig() {
      var _this2 = this;

      var offsetConf = {};

      if (typeof this._config.offset === 'function') {
        offsetConf.fn = function (data) {
          data.offsets = _extends({}, data.offsets, _this2._config.offset(data.offsets) || {});
          return data;
        };
      } else {
        offsetConf.offset = this._config.offset;
      }

      var popperConfig = {
        placement: this._getPlacement(),
        modifiers: {
          offset: offsetConf,
          flip: {
            enabled: this._config.flip
          },
          preventOverflow: {
            boundariesElement: this._config.boundary
          }
        }
      };
      return popperConfig;
    }; // Static


    Dropdown._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        var _config = typeof config === 'object' ? config : null;

        if (!data) {
          data = new Dropdown(this, _config);
          $$$1(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    Dropdown._clearMenus = function _clearMenus(event) {
      if (event && (event.which === RIGHT_MOUSE_BUTTON_WHICH || event.type === 'keyup' && event.which !== TAB_KEYCODE)) {
        return;
      }

      var toggles = $$$1.makeArray($$$1(Selector.DATA_TOGGLE));

      for (var i = 0; i < toggles.length; i++) {
        var parent = Dropdown._getParentFromElement(toggles[i]);

        var context = $$$1(toggles[i]).data(DATA_KEY);
        var relatedTarget = {
          relatedTarget: toggles[i]
        };

        if (!context) {
          continue;
        }

        var dropdownMenu = context._menu;

        if (!$$$1(parent).hasClass(ClassName.SHOW)) {
          continue;
        }

        if (event && (event.type === 'click' && /input|textarea/i.test(event.target.tagName) || event.type === 'keyup' && event.which === TAB_KEYCODE) && $$$1.contains(parent, event.target)) {
          continue;
        }

        var hideEvent = $$$1.Event(Event.HIDE, relatedTarget);
        $$$1(parent).trigger(hideEvent);

        if (hideEvent.isDefaultPrevented()) {
          continue;
        } // If this is a touch-enabled device we remove the extra
        // empty mouseover listeners we added for iOS support


        if ('ontouchstart' in document.documentElement) {
          $$$1('body').children().off('mouseover', null, $$$1.noop);
        }

        toggles[i].setAttribute('aria-expanded', 'false');
        $$$1(dropdownMenu).removeClass(ClassName.SHOW);
        $$$1(parent).removeClass(ClassName.SHOW).trigger($$$1.Event(Event.HIDDEN, relatedTarget));
      }
    };

    Dropdown._getParentFromElement = function _getParentFromElement(element) {
      var parent;
      var selector = Util.getSelectorFromElement(element);

      if (selector) {
        parent = $$$1(selector)[0];
      }

      return parent || element.parentNode;
    }; // eslint-disable-next-line complexity


    Dropdown._dataApiKeydownHandler = function _dataApiKeydownHandler(event) {
      // If not input/textarea:
      //  - And not a key in REGEXP_KEYDOWN => not a dropdown command
      // If input/textarea:
      //  - If space key => not a dropdown command
      //  - If key is other than escape
      //    - If key is not up or down => not a dropdown command
      //    - If trigger inside the menu => not a dropdown command
      if (/input|textarea/i.test(event.target.tagName) ? event.which === SPACE_KEYCODE || event.which !== ESCAPE_KEYCODE && (event.which !== ARROW_DOWN_KEYCODE && event.which !== ARROW_UP_KEYCODE || $$$1(event.target).closest(Selector.MENU).length) : !REGEXP_KEYDOWN.test(event.which)) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      if (this.disabled || $$$1(this).hasClass(ClassName.DISABLED)) {
        return;
      }

      var parent = Dropdown._getParentFromElement(this);

      var isActive = $$$1(parent).hasClass(ClassName.SHOW);

      if (!isActive && (event.which !== ESCAPE_KEYCODE || event.which !== SPACE_KEYCODE) || isActive && (event.which === ESCAPE_KEYCODE || event.which === SPACE_KEYCODE)) {
        if (event.which === ESCAPE_KEYCODE) {
          var toggle = $$$1(parent).find(Selector.DATA_TOGGLE)[0];
          $$$1(toggle).trigger('focus');
        }

        $$$1(this).trigger('click');
        return;
      }

      var items = $$$1(parent).find(Selector.VISIBLE_ITEMS).get();

      if (items.length === 0) {
        return;
      }

      var index = items.indexOf(event.target);

      if (event.which === ARROW_UP_KEYCODE && index > 0) {
        // Up
        index--;
      }

      if (event.which === ARROW_DOWN_KEYCODE && index < items.length - 1) {
        // Down
        index++;
      }

      if (index < 0) {
        index = 0;
      }

      items[index].focus();
    };

    _createClass(Dropdown, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }]);
    return Dropdown;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.KEYDOWN_DATA_API, Selector.DATA_TOGGLE, Dropdown._dataApiKeydownHandler).on(Event.KEYDOWN_DATA_API, Selector.MENU, Dropdown._dataApiKeydownHandler).on(Event.CLICK_DATA_API + " " + Event.KEYUP_DATA_API, Dropdown._clearMenus).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    event.preventDefault();
    event.stopPropagation();

    Dropdown._jQueryInterface.call($$$1(this), 'toggle');
  }).on(Event.CLICK_DATA_API, Selector.FORM_CHILD, function (e) {
    e.stopPropagation();
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Dropdown._jQueryInterface;
  $$$1.fn[NAME].Constructor = Dropdown;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Dropdown._jQueryInterface;
  };

  return Dropdown;
}($, Popper);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): modal.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Modal = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'modal';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.modal';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var TRANSITION_DURATION = 300;
  var BACKDROP_TRANSITION_DURATION = 150;
  var ESCAPE_KEYCODE = 27; // KeyboardEvent.which value for Escape (Esc) key

  var Default = {
    backdrop: true,
    keyboard: true,
    focus: true,
    show: true
  };
  var DefaultType = {
    backdrop: '(boolean|string)',
    keyboard: 'boolean',
    focus: 'boolean',
    show: 'boolean'
  };
  var Event = {
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    FOCUSIN: "focusin" + EVENT_KEY,
    RESIZE: "resize" + EVENT_KEY,
    CLICK_DISMISS: "click.dismiss" + EVENT_KEY,
    KEYDOWN_DISMISS: "keydown.dismiss" + EVENT_KEY,
    MOUSEUP_DISMISS: "mouseup.dismiss" + EVENT_KEY,
    MOUSEDOWN_DISMISS: "mousedown.dismiss" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    SCROLLBAR_MEASURER: 'modal-scrollbar-measure',
    BACKDROP: 'modal-backdrop',
    OPEN: 'modal-open',
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector = {
    DIALOG: '.modal-dialog',
    DATA_TOGGLE: '[data-toggle="modal"]',
    DATA_DISMISS: '[data-dismiss="modal"]',
    FIXED_CONTENT: '.fixed-top, .fixed-bottom, .is-fixed, .sticky-top',
    STICKY_CONTENT: '.sticky-top',
    NAVBAR_TOGGLER: '.navbar-toggler'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Modal =
  /*#__PURE__*/
  function () {
    function Modal(element, config) {
      this._config = this._getConfig(config);
      this._element = element;
      this._dialog = $$$1(element).find(Selector.DIALOG)[0];
      this._backdrop = null;
      this._isShown = false;
      this._isBodyOverflowing = false;
      this._ignoreBackdropClick = false;
      this._originalBodyPadding = 0;
      this._scrollbarWidth = 0;
    } // Getters


    var _proto = Modal.prototype;

    // Public
    _proto.toggle = function toggle(relatedTarget) {
      return this._isShown ? this.hide() : this.show(relatedTarget);
    };

    _proto.show = function show(relatedTarget) {
      var _this = this;

      if (this._isTransitioning || this._isShown) {
        return;
      }

      if (Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE)) {
        this._isTransitioning = true;
      }

      var showEvent = $$$1.Event(Event.SHOW, {
        relatedTarget: relatedTarget
      });
      $$$1(this._element).trigger(showEvent);

      if (this._isShown || showEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = true;

      this._checkScrollbar();

      this._setScrollbar();

      this._adjustDialog();

      $$$1(document.body).addClass(ClassName.OPEN);

      this._setEscapeEvent();

      this._setResizeEvent();

      $$$1(this._element).on(Event.CLICK_DISMISS, Selector.DATA_DISMISS, function (event) {
        return _this.hide(event);
      });
      $$$1(this._dialog).on(Event.MOUSEDOWN_DISMISS, function () {
        $$$1(_this._element).one(Event.MOUSEUP_DISMISS, function (event) {
          if ($$$1(event.target).is(_this._element)) {
            _this._ignoreBackdropClick = true;
          }
        });
      });

      this._showBackdrop(function () {
        return _this._showElement(relatedTarget);
      });
    };

    _proto.hide = function hide(event) {
      var _this2 = this;

      if (event) {
        event.preventDefault();
      }

      if (this._isTransitioning || !this._isShown) {
        return;
      }

      var hideEvent = $$$1.Event(Event.HIDE);
      $$$1(this._element).trigger(hideEvent);

      if (!this._isShown || hideEvent.isDefaultPrevented()) {
        return;
      }

      this._isShown = false;
      var transition = Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE);

      if (transition) {
        this._isTransitioning = true;
      }

      this._setEscapeEvent();

      this._setResizeEvent();

      $$$1(document).off(Event.FOCUSIN);
      $$$1(this._element).removeClass(ClassName.SHOW);
      $$$1(this._element).off(Event.CLICK_DISMISS);
      $$$1(this._dialog).off(Event.MOUSEDOWN_DISMISS);

      if (transition) {
        $$$1(this._element).one(Util.TRANSITION_END, function (event) {
          return _this2._hideModal(event);
        }).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        this._hideModal();
      }
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      $$$1(window, document, this._element, this._backdrop).off(EVENT_KEY);
      this._config = null;
      this._element = null;
      this._dialog = null;
      this._backdrop = null;
      this._isShown = null;
      this._isBodyOverflowing = null;
      this._ignoreBackdropClick = null;
      this._scrollbarWidth = null;
    };

    _proto.handleUpdate = function handleUpdate() {
      this._adjustDialog();
    }; // Private


    _proto._getConfig = function _getConfig(config) {
      config = _extends({}, Default, config);
      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    _proto._showElement = function _showElement(relatedTarget) {
      var _this3 = this;

      var transition = Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE);

      if (!this._element.parentNode || this._element.parentNode.nodeType !== Node.ELEMENT_NODE) {
        // Don't move modal's DOM position
        document.body.appendChild(this._element);
      }

      this._element.style.display = 'block';

      this._element.removeAttribute('aria-hidden');

      this._element.scrollTop = 0;

      if (transition) {
        Util.reflow(this._element);
      }

      $$$1(this._element).addClass(ClassName.SHOW);

      if (this._config.focus) {
        this._enforceFocus();
      }

      var shownEvent = $$$1.Event(Event.SHOWN, {
        relatedTarget: relatedTarget
      });

      var transitionComplete = function transitionComplete() {
        if (_this3._config.focus) {
          _this3._element.focus();
        }

        _this3._isTransitioning = false;
        $$$1(_this3._element).trigger(shownEvent);
      };

      if (transition) {
        $$$1(this._dialog).one(Util.TRANSITION_END, transitionComplete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        transitionComplete();
      }
    };

    _proto._enforceFocus = function _enforceFocus() {
      var _this4 = this;

      $$$1(document).off(Event.FOCUSIN) // Guard against infinite focus loop
      .on(Event.FOCUSIN, function (event) {
        if (document !== event.target && _this4._element !== event.target && $$$1(_this4._element).has(event.target).length === 0) {
          _this4._element.focus();
        }
      });
    };

    _proto._setEscapeEvent = function _setEscapeEvent() {
      var _this5 = this;

      if (this._isShown && this._config.keyboard) {
        $$$1(this._element).on(Event.KEYDOWN_DISMISS, function (event) {
          if (event.which === ESCAPE_KEYCODE) {
            event.preventDefault();

            _this5.hide();
          }
        });
      } else if (!this._isShown) {
        $$$1(this._element).off(Event.KEYDOWN_DISMISS);
      }
    };

    _proto._setResizeEvent = function _setResizeEvent() {
      var _this6 = this;

      if (this._isShown) {
        $$$1(window).on(Event.RESIZE, function (event) {
          return _this6.handleUpdate(event);
        });
      } else {
        $$$1(window).off(Event.RESIZE);
      }
    };

    _proto._hideModal = function _hideModal() {
      var _this7 = this;

      this._element.style.display = 'none';

      this._element.setAttribute('aria-hidden', true);

      this._isTransitioning = false;

      this._showBackdrop(function () {
        $$$1(document.body).removeClass(ClassName.OPEN);

        _this7._resetAdjustments();

        _this7._resetScrollbar();

        $$$1(_this7._element).trigger(Event.HIDDEN);
      });
    };

    _proto._removeBackdrop = function _removeBackdrop() {
      if (this._backdrop) {
        $$$1(this._backdrop).remove();
        this._backdrop = null;
      }
    };

    _proto._showBackdrop = function _showBackdrop(callback) {
      var _this8 = this;

      var animate = $$$1(this._element).hasClass(ClassName.FADE) ? ClassName.FADE : '';

      if (this._isShown && this._config.backdrop) {
        var doAnimate = Util.supportsTransitionEnd() && animate;
        this._backdrop = document.createElement('div');
        this._backdrop.className = ClassName.BACKDROP;

        if (animate) {
          $$$1(this._backdrop).addClass(animate);
        }

        $$$1(this._backdrop).appendTo(document.body);
        $$$1(this._element).on(Event.CLICK_DISMISS, function (event) {
          if (_this8._ignoreBackdropClick) {
            _this8._ignoreBackdropClick = false;
            return;
          }

          if (event.target !== event.currentTarget) {
            return;
          }

          if (_this8._config.backdrop === 'static') {
            _this8._element.focus();
          } else {
            _this8.hide();
          }
        });

        if (doAnimate) {
          Util.reflow(this._backdrop);
        }

        $$$1(this._backdrop).addClass(ClassName.SHOW);

        if (!callback) {
          return;
        }

        if (!doAnimate) {
          callback();
          return;
        }

        $$$1(this._backdrop).one(Util.TRANSITION_END, callback).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
      } else if (!this._isShown && this._backdrop) {
        $$$1(this._backdrop).removeClass(ClassName.SHOW);

        var callbackRemove = function callbackRemove() {
          _this8._removeBackdrop();

          if (callback) {
            callback();
          }
        };

        if (Util.supportsTransitionEnd() && $$$1(this._element).hasClass(ClassName.FADE)) {
          $$$1(this._backdrop).one(Util.TRANSITION_END, callbackRemove).emulateTransitionEnd(BACKDROP_TRANSITION_DURATION);
        } else {
          callbackRemove();
        }
      } else if (callback) {
        callback();
      }
    }; // ----------------------------------------------------------------------
    // the following methods are used to handle overflowing modals
    // todo (fat): these should probably be refactored out of modal.js
    // ----------------------------------------------------------------------


    _proto._adjustDialog = function _adjustDialog() {
      var isModalOverflowing = this._element.scrollHeight > document.documentElement.clientHeight;

      if (!this._isBodyOverflowing && isModalOverflowing) {
        this._element.style.paddingLeft = this._scrollbarWidth + "px";
      }

      if (this._isBodyOverflowing && !isModalOverflowing) {
        this._element.style.paddingRight = this._scrollbarWidth + "px";
      }
    };

    _proto._resetAdjustments = function _resetAdjustments() {
      this._element.style.paddingLeft = '';
      this._element.style.paddingRight = '';
    };

    _proto._checkScrollbar = function _checkScrollbar() {
      var rect = document.body.getBoundingClientRect();
      this._isBodyOverflowing = rect.left + rect.right < window.innerWidth;
      this._scrollbarWidth = this._getScrollbarWidth();
    };

    _proto._setScrollbar = function _setScrollbar() {
      var _this9 = this;

      if (this._isBodyOverflowing) {
        // Note: DOMNode.style.paddingRight returns the actual value or '' if not set
        //   while $(DOMNode).css('padding-right') returns the calculated value or 0 if not set
        // Adjust fixed content padding
        $$$1(Selector.FIXED_CONTENT).each(function (index, element) {
          var actualPadding = $$$1(element)[0].style.paddingRight;
          var calculatedPadding = $$$1(element).css('padding-right');
          $$$1(element).data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + _this9._scrollbarWidth + "px");
        }); // Adjust sticky content margin

        $$$1(Selector.STICKY_CONTENT).each(function (index, element) {
          var actualMargin = $$$1(element)[0].style.marginRight;
          var calculatedMargin = $$$1(element).css('margin-right');
          $$$1(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) - _this9._scrollbarWidth + "px");
        }); // Adjust navbar-toggler margin

        $$$1(Selector.NAVBAR_TOGGLER).each(function (index, element) {
          var actualMargin = $$$1(element)[0].style.marginRight;
          var calculatedMargin = $$$1(element).css('margin-right');
          $$$1(element).data('margin-right', actualMargin).css('margin-right', parseFloat(calculatedMargin) + _this9._scrollbarWidth + "px");
        }); // Adjust body padding

        var actualPadding = document.body.style.paddingRight;
        var calculatedPadding = $$$1('body').css('padding-right');
        $$$1('body').data('padding-right', actualPadding).css('padding-right', parseFloat(calculatedPadding) + this._scrollbarWidth + "px");
      }
    };

    _proto._resetScrollbar = function _resetScrollbar() {
      // Restore fixed content padding
      $$$1(Selector.FIXED_CONTENT).each(function (index, element) {
        var padding = $$$1(element).data('padding-right');

        if (typeof padding !== 'undefined') {
          $$$1(element).css('padding-right', padding).removeData('padding-right');
        }
      }); // Restore sticky content and navbar-toggler margin

      $$$1(Selector.STICKY_CONTENT + ", " + Selector.NAVBAR_TOGGLER).each(function (index, element) {
        var margin = $$$1(element).data('margin-right');

        if (typeof margin !== 'undefined') {
          $$$1(element).css('margin-right', margin).removeData('margin-right');
        }
      }); // Restore body padding

      var padding = $$$1('body').data('padding-right');

      if (typeof padding !== 'undefined') {
        $$$1('body').css('padding-right', padding).removeData('padding-right');
      }
    };

    _proto._getScrollbarWidth = function _getScrollbarWidth() {
      // thx d.walsh
      var scrollDiv = document.createElement('div');
      scrollDiv.className = ClassName.SCROLLBAR_MEASURER;
      document.body.appendChild(scrollDiv);
      var scrollbarWidth = scrollDiv.getBoundingClientRect().width - scrollDiv.clientWidth;
      document.body.removeChild(scrollDiv);
      return scrollbarWidth;
    }; // Static


    Modal._jQueryInterface = function _jQueryInterface(config, relatedTarget) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        var _config = _extends({}, Modal.Default, $$$1(this).data(), typeof config === 'object' && config);

        if (!data) {
          data = new Modal(this, _config);
          $$$1(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config](relatedTarget);
        } else if (_config.show) {
          data.show(relatedTarget);
        }
      });
    };

    _createClass(Modal, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);
    return Modal;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    var _this10 = this;

    var target;
    var selector = Util.getSelectorFromElement(this);

    if (selector) {
      target = $$$1(selector)[0];
    }

    var config = $$$1(target).data(DATA_KEY) ? 'toggle' : _extends({}, $$$1(target).data(), $$$1(this).data());

    if (this.tagName === 'A' || this.tagName === 'AREA') {
      event.preventDefault();
    }

    var $target = $$$1(target).one(Event.SHOW, function (showEvent) {
      if (showEvent.isDefaultPrevented()) {
        // Only register focus restorer if modal will actually get shown
        return;
      }

      $target.one(Event.HIDDEN, function () {
        if ($$$1(_this10).is(':visible')) {
          _this10.focus();
        }
      });
    });

    Modal._jQueryInterface.call($$$1(target), config, this);
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Modal._jQueryInterface;
  $$$1.fn[NAME].Constructor = Modal;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Modal._jQueryInterface;
  };

  return Modal;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): tooltip.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Tooltip = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'tooltip';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.tooltip';
  var EVENT_KEY = "." + DATA_KEY;
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var TRANSITION_DURATION = 150;
  var CLASS_PREFIX = 'bs-tooltip';
  var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var DefaultType = {
    animation: 'boolean',
    template: 'string',
    title: '(string|element|function)',
    trigger: 'string',
    delay: '(number|object)',
    html: 'boolean',
    selector: '(string|boolean)',
    placement: '(string|function)',
    offset: '(number|string)',
    container: '(string|element|boolean)',
    fallbackPlacement: '(string|array)',
    boundary: '(string|element)'
  };
  var AttachmentMap = {
    AUTO: 'auto',
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
  };
  var Default = {
    animation: true,
    template: '<div class="tooltip" role="tooltip">' + '<div class="arrow"></div>' + '<div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    selector: false,
    placement: 'top',
    offset: 0,
    container: false,
    fallbackPlacement: 'flip',
    boundary: 'scrollParent'
  };
  var HoverState = {
    SHOW: 'show',
    OUT: 'out'
  };
  var Event = {
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    INSERTED: "inserted" + EVENT_KEY,
    CLICK: "click" + EVENT_KEY,
    FOCUSIN: "focusin" + EVENT_KEY,
    FOCUSOUT: "focusout" + EVENT_KEY,
    MOUSEENTER: "mouseenter" + EVENT_KEY,
    MOUSELEAVE: "mouseleave" + EVENT_KEY
  };
  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector = {
    TOOLTIP: '.tooltip',
    TOOLTIP_INNER: '.tooltip-inner',
    ARROW: '.arrow'
  };
  var Trigger = {
    HOVER: 'hover',
    FOCUS: 'focus',
    CLICK: 'click',
    MANUAL: 'manual'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Tooltip =
  /*#__PURE__*/
  function () {
    function Tooltip(element, config) {
      /**
       * Check for Popper dependency
       * Popper - https://popper.js.org
       */
      if (typeof Popper === 'undefined') {
        throw new TypeError('Bootstrap tooltips require Popper.js (https://popper.js.org)');
      } // private


      this._isEnabled = true;
      this._timeout = 0;
      this._hoverState = '';
      this._activeTrigger = {};
      this._popper = null; // Protected

      this.element = element;
      this.config = this._getConfig(config);
      this.tip = null;

      this._setListeners();
    } // Getters


    var _proto = Tooltip.prototype;

    // Public
    _proto.enable = function enable() {
      this._isEnabled = true;
    };

    _proto.disable = function disable() {
      this._isEnabled = false;
    };

    _proto.toggleEnabled = function toggleEnabled() {
      this._isEnabled = !this._isEnabled;
    };

    _proto.toggle = function toggle(event) {
      if (!this._isEnabled) {
        return;
      }

      if (event) {
        var dataKey = this.constructor.DATA_KEY;
        var context = $$$1(event.currentTarget).data(dataKey);

        if (!context) {
          context = new this.constructor(event.currentTarget, this._getDelegateConfig());
          $$$1(event.currentTarget).data(dataKey, context);
        }

        context._activeTrigger.click = !context._activeTrigger.click;

        if (context._isWithActiveTrigger()) {
          context._enter(null, context);
        } else {
          context._leave(null, context);
        }
      } else {
        if ($$$1(this.getTipElement()).hasClass(ClassName.SHOW)) {
          this._leave(null, this);

          return;
        }

        this._enter(null, this);
      }
    };

    _proto.dispose = function dispose() {
      clearTimeout(this._timeout);
      $$$1.removeData(this.element, this.constructor.DATA_KEY);
      $$$1(this.element).off(this.constructor.EVENT_KEY);
      $$$1(this.element).closest('.modal').off('hide.bs.modal');

      if (this.tip) {
        $$$1(this.tip).remove();
      }

      this._isEnabled = null;
      this._timeout = null;
      this._hoverState = null;
      this._activeTrigger = null;

      if (this._popper !== null) {
        this._popper.destroy();
      }

      this._popper = null;
      this.element = null;
      this.config = null;
      this.tip = null;
    };

    _proto.show = function show() {
      var _this = this;

      if ($$$1(this.element).css('display') === 'none') {
        throw new Error('Please use show on visible elements');
      }

      var showEvent = $$$1.Event(this.constructor.Event.SHOW);

      if (this.isWithContent() && this._isEnabled) {
        $$$1(this.element).trigger(showEvent);
        var isInTheDom = $$$1.contains(this.element.ownerDocument.documentElement, this.element);

        if (showEvent.isDefaultPrevented() || !isInTheDom) {
          return;
        }

        var tip = this.getTipElement();
        var tipId = Util.getUID(this.constructor.NAME);
        tip.setAttribute('id', tipId);
        this.element.setAttribute('aria-describedby', tipId);
        this.setContent();

        if (this.config.animation) {
          $$$1(tip).addClass(ClassName.FADE);
        }

        var placement = typeof this.config.placement === 'function' ? this.config.placement.call(this, tip, this.element) : this.config.placement;

        var attachment = this._getAttachment(placement);

        this.addAttachmentClass(attachment);
        var container = this.config.container === false ? document.body : $$$1(this.config.container);
        $$$1(tip).data(this.constructor.DATA_KEY, this);

        if (!$$$1.contains(this.element.ownerDocument.documentElement, this.tip)) {
          $$$1(tip).appendTo(container);
        }

        $$$1(this.element).trigger(this.constructor.Event.INSERTED);
        this._popper = new Popper(this.element, tip, {
          placement: attachment,
          modifiers: {
            offset: {
              offset: this.config.offset
            },
            flip: {
              behavior: this.config.fallbackPlacement
            },
            arrow: {
              element: Selector.ARROW
            },
            preventOverflow: {
              boundariesElement: this.config.boundary
            }
          },
          onCreate: function onCreate(data) {
            if (data.originalPlacement !== data.placement) {
              _this._handlePopperPlacementChange(data);
            }
          },
          onUpdate: function onUpdate(data) {
            _this._handlePopperPlacementChange(data);
          }
        });
        $$$1(tip).addClass(ClassName.SHOW); // If this is a touch-enabled device we add extra
        // empty mouseover listeners to the body's immediate children;
        // only needed because of broken event delegation on iOS
        // https://www.quirksmode.org/blog/archives/2014/02/mouse_event_bub.html

        if ('ontouchstart' in document.documentElement) {
          $$$1('body').children().on('mouseover', null, $$$1.noop);
        }

        var complete = function complete() {
          if (_this.config.animation) {
            _this._fixTransition();
          }

          var prevHoverState = _this._hoverState;
          _this._hoverState = null;
          $$$1(_this.element).trigger(_this.constructor.Event.SHOWN);

          if (prevHoverState === HoverState.OUT) {
            _this._leave(null, _this);
          }
        };

        if (Util.supportsTransitionEnd() && $$$1(this.tip).hasClass(ClassName.FADE)) {
          $$$1(this.tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(Tooltip._TRANSITION_DURATION);
        } else {
          complete();
        }
      }
    };

    _proto.hide = function hide(callback) {
      var _this2 = this;

      var tip = this.getTipElement();
      var hideEvent = $$$1.Event(this.constructor.Event.HIDE);

      var complete = function complete() {
        if (_this2._hoverState !== HoverState.SHOW && tip.parentNode) {
          tip.parentNode.removeChild(tip);
        }

        _this2._cleanTipClass();

        _this2.element.removeAttribute('aria-describedby');

        $$$1(_this2.element).trigger(_this2.constructor.Event.HIDDEN);

        if (_this2._popper !== null) {
          _this2._popper.destroy();
        }

        if (callback) {
          callback();
        }
      };

      $$$1(this.element).trigger(hideEvent);

      if (hideEvent.isDefaultPrevented()) {
        return;
      }

      $$$1(tip).removeClass(ClassName.SHOW); // If this is a touch-enabled device we remove the extra
      // empty mouseover listeners we added for iOS support

      if ('ontouchstart' in document.documentElement) {
        $$$1('body').children().off('mouseover', null, $$$1.noop);
      }

      this._activeTrigger[Trigger.CLICK] = false;
      this._activeTrigger[Trigger.FOCUS] = false;
      this._activeTrigger[Trigger.HOVER] = false;

      if (Util.supportsTransitionEnd() && $$$1(this.tip).hasClass(ClassName.FADE)) {
        $$$1(tip).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        complete();
      }

      this._hoverState = '';
    };

    _proto.update = function update() {
      if (this._popper !== null) {
        this._popper.scheduleUpdate();
      }
    }; // Protected


    _proto.isWithContent = function isWithContent() {
      return Boolean(this.getTitle());
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $$$1(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $$$1(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var $tip = $$$1(this.getTipElement());
      this.setElementContent($tip.find(Selector.TOOLTIP_INNER), this.getTitle());
      $tip.removeClass(ClassName.FADE + " " + ClassName.SHOW);
    };

    _proto.setElementContent = function setElementContent($element, content) {
      var html = this.config.html;

      if (typeof content === 'object' && (content.nodeType || content.jquery)) {
        // Content is a DOM node or a jQuery
        if (html) {
          if (!$$$1(content).parent().is($element)) {
            $element.empty().append(content);
          }
        } else {
          $element.text($$$1(content).text());
        }
      } else {
        $element[html ? 'html' : 'text'](content);
      }
    };

    _proto.getTitle = function getTitle() {
      var title = this.element.getAttribute('data-original-title');

      if (!title) {
        title = typeof this.config.title === 'function' ? this.config.title.call(this.element) : this.config.title;
      }

      return title;
    }; // Private


    _proto._getAttachment = function _getAttachment(placement) {
      return AttachmentMap[placement.toUpperCase()];
    };

    _proto._setListeners = function _setListeners() {
      var _this3 = this;

      var triggers = this.config.trigger.split(' ');
      triggers.forEach(function (trigger) {
        if (trigger === 'click') {
          $$$1(_this3.element).on(_this3.constructor.Event.CLICK, _this3.config.selector, function (event) {
            return _this3.toggle(event);
          });
        } else if (trigger !== Trigger.MANUAL) {
          var eventIn = trigger === Trigger.HOVER ? _this3.constructor.Event.MOUSEENTER : _this3.constructor.Event.FOCUSIN;
          var eventOut = trigger === Trigger.HOVER ? _this3.constructor.Event.MOUSELEAVE : _this3.constructor.Event.FOCUSOUT;
          $$$1(_this3.element).on(eventIn, _this3.config.selector, function (event) {
            return _this3._enter(event);
          }).on(eventOut, _this3.config.selector, function (event) {
            return _this3._leave(event);
          });
        }

        $$$1(_this3.element).closest('.modal').on('hide.bs.modal', function () {
          return _this3.hide();
        });
      });

      if (this.config.selector) {
        this.config = _extends({}, this.config, {
          trigger: 'manual',
          selector: ''
        });
      } else {
        this._fixTitle();
      }
    };

    _proto._fixTitle = function _fixTitle() {
      var titleType = typeof this.element.getAttribute('data-original-title');

      if (this.element.getAttribute('title') || titleType !== 'string') {
        this.element.setAttribute('data-original-title', this.element.getAttribute('title') || '');
        this.element.setAttribute('title', '');
      }
    };

    _proto._enter = function _enter(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $$$1(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $$$1(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusin' ? Trigger.FOCUS : Trigger.HOVER] = true;
      }

      if ($$$1(context.getTipElement()).hasClass(ClassName.SHOW) || context._hoverState === HoverState.SHOW) {
        context._hoverState = HoverState.SHOW;
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HoverState.SHOW;

      if (!context.config.delay || !context.config.delay.show) {
        context.show();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.SHOW) {
          context.show();
        }
      }, context.config.delay.show);
    };

    _proto._leave = function _leave(event, context) {
      var dataKey = this.constructor.DATA_KEY;
      context = context || $$$1(event.currentTarget).data(dataKey);

      if (!context) {
        context = new this.constructor(event.currentTarget, this._getDelegateConfig());
        $$$1(event.currentTarget).data(dataKey, context);
      }

      if (event) {
        context._activeTrigger[event.type === 'focusout' ? Trigger.FOCUS : Trigger.HOVER] = false;
      }

      if (context._isWithActiveTrigger()) {
        return;
      }

      clearTimeout(context._timeout);
      context._hoverState = HoverState.OUT;

      if (!context.config.delay || !context.config.delay.hide) {
        context.hide();
        return;
      }

      context._timeout = setTimeout(function () {
        if (context._hoverState === HoverState.OUT) {
          context.hide();
        }
      }, context.config.delay.hide);
    };

    _proto._isWithActiveTrigger = function _isWithActiveTrigger() {
      for (var trigger in this._activeTrigger) {
        if (this._activeTrigger[trigger]) {
          return true;
        }
      }

      return false;
    };

    _proto._getConfig = function _getConfig(config) {
      config = _extends({}, this.constructor.Default, $$$1(this.element).data(), config);

      if (typeof config.delay === 'number') {
        config.delay = {
          show: config.delay,
          hide: config.delay
        };
      }

      if (typeof config.title === 'number') {
        config.title = config.title.toString();
      }

      if (typeof config.content === 'number') {
        config.content = config.content.toString();
      }

      Util.typeCheckConfig(NAME, config, this.constructor.DefaultType);
      return config;
    };

    _proto._getDelegateConfig = function _getDelegateConfig() {
      var config = {};

      if (this.config) {
        for (var key in this.config) {
          if (this.constructor.Default[key] !== this.config[key]) {
            config[key] = this.config[key];
          }
        }
      }

      return config;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $$$1(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(''));
      }
    };

    _proto._handlePopperPlacementChange = function _handlePopperPlacementChange(data) {
      this._cleanTipClass();

      this.addAttachmentClass(this._getAttachment(data.placement));
    };

    _proto._fixTransition = function _fixTransition() {
      var tip = this.getTipElement();
      var initConfigAnimation = this.config.animation;

      if (tip.getAttribute('x-placement') !== null) {
        return;
      }

      $$$1(tip).removeClass(ClassName.FADE);
      this.config.animation = false;
      this.hide();
      this.show();
      this.config.animation = initConfigAnimation;
    }; // Static


    Tooltip._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        var _config = typeof config === 'object' && config;

        if (!data && /dispose|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Tooltip(this, _config);
          $$$1(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Tooltip, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }]);
    return Tooltip;
  }();
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $$$1.fn[NAME] = Tooltip._jQueryInterface;
  $$$1.fn[NAME].Constructor = Tooltip;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tooltip._jQueryInterface;
  };

  return Tooltip;
}($, Popper);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): popover.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Popover = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'popover';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.popover';
  var EVENT_KEY = "." + DATA_KEY;
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var CLASS_PREFIX = 'bs-popover';
  var BSCLS_PREFIX_REGEX = new RegExp("(^|\\s)" + CLASS_PREFIX + "\\S+", 'g');
  var Default = _extends({}, Tooltip.Default, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip">' + '<div class="arrow"></div>' + '<h3 class="popover-header"></h3>' + '<div class="popover-body"></div></div>'
  });
  var DefaultType = _extends({}, Tooltip.DefaultType, {
    content: '(string|element|function)'
  });
  var ClassName = {
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector = {
    TITLE: '.popover-header',
    CONTENT: '.popover-body'
  };
  var Event = {
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    INSERTED: "inserted" + EVENT_KEY,
    CLICK: "click" + EVENT_KEY,
    FOCUSIN: "focusin" + EVENT_KEY,
    FOCUSOUT: "focusout" + EVENT_KEY,
    MOUSEENTER: "mouseenter" + EVENT_KEY,
    MOUSELEAVE: "mouseleave" + EVENT_KEY
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Popover =
  /*#__PURE__*/
  function (_Tooltip) {
    _inheritsLoose(Popover, _Tooltip);

    function Popover() {
      return _Tooltip.apply(this, arguments) || this;
    }

    var _proto = Popover.prototype;

    // Overrides
    _proto.isWithContent = function isWithContent() {
      return this.getTitle() || this._getContent();
    };

    _proto.addAttachmentClass = function addAttachmentClass(attachment) {
      $$$1(this.getTipElement()).addClass(CLASS_PREFIX + "-" + attachment);
    };

    _proto.getTipElement = function getTipElement() {
      this.tip = this.tip || $$$1(this.config.template)[0];
      return this.tip;
    };

    _proto.setContent = function setContent() {
      var $tip = $$$1(this.getTipElement()); // We use append for html objects to maintain js events

      this.setElementContent($tip.find(Selector.TITLE), this.getTitle());

      var content = this._getContent();

      if (typeof content === 'function') {
        content = content.call(this.element);
      }

      this.setElementContent($tip.find(Selector.CONTENT), content);
      $tip.removeClass(ClassName.FADE + " " + ClassName.SHOW);
    }; // Private


    _proto._getContent = function _getContent() {
      return this.element.getAttribute('data-content') || this.config.content;
    };

    _proto._cleanTipClass = function _cleanTipClass() {
      var $tip = $$$1(this.getTipElement());
      var tabClass = $tip.attr('class').match(BSCLS_PREFIX_REGEX);

      if (tabClass !== null && tabClass.length > 0) {
        $tip.removeClass(tabClass.join(''));
      }
    }; // Static


    Popover._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        var _config = typeof config === 'object' ? config : null;

        if (!data && /destroy|hide/.test(config)) {
          return;
        }

        if (!data) {
          data = new Popover(this, _config);
          $$$1(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Popover, null, [{
      key: "VERSION",
      // Getters
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }, {
      key: "NAME",
      get: function get() {
        return NAME;
      }
    }, {
      key: "DATA_KEY",
      get: function get() {
        return DATA_KEY;
      }
    }, {
      key: "Event",
      get: function get() {
        return Event;
      }
    }, {
      key: "EVENT_KEY",
      get: function get() {
        return EVENT_KEY;
      }
    }, {
      key: "DefaultType",
      get: function get() {
        return DefaultType;
      }
    }]);
    return Popover;
  }(Tooltip);
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */


  $$$1.fn[NAME] = Popover._jQueryInterface;
  $$$1.fn[NAME].Constructor = Popover;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Popover._jQueryInterface;
  };

  return Popover;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): scrollspy.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var ScrollSpy = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'scrollspy';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.scrollspy';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var Default = {
    offset: 10,
    method: 'auto',
    target: ''
  };
  var DefaultType = {
    offset: 'number',
    method: 'string',
    target: '(string|element)'
  };
  var Event = {
    ACTIVATE: "activate" + EVENT_KEY,
    SCROLL: "scroll" + EVENT_KEY,
    LOAD_DATA_API: "load" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    DROPDOWN_ITEM: 'dropdown-item',
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active'
  };
  var Selector = {
    DATA_SPY: '[data-spy="scroll"]',
    ACTIVE: '.active',
    NAV_LIST_GROUP: '.nav, .list-group',
    NAV_LINKS: '.nav-link',
    NAV_ITEMS: '.nav-item',
    LIST_ITEMS: '.list-group-item',
    DROPDOWN: '.dropdown',
    DROPDOWN_ITEMS: '.dropdown-item',
    DROPDOWN_TOGGLE: '.dropdown-toggle'
  };
  var OffsetMethod = {
    OFFSET: 'offset',
    POSITION: 'position'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var ScrollSpy =
  /*#__PURE__*/
  function () {
    function ScrollSpy(element, config) {
      var _this = this;

      this._element = element;
      this._scrollElement = element.tagName === 'BODY' ? window : element;
      this._config = this._getConfig(config);
      this._selector = this._config.target + " " + Selector.NAV_LINKS + "," + (this._config.target + " " + Selector.LIST_ITEMS + ",") + (this._config.target + " " + Selector.DROPDOWN_ITEMS);
      this._offsets = [];
      this._targets = [];
      this._activeTarget = null;
      this._scrollHeight = 0;
      $$$1(this._scrollElement).on(Event.SCROLL, function (event) {
        return _this._process(event);
      });
      this.refresh();

      this._process();
    } // Getters


    var _proto = ScrollSpy.prototype;

    // Public
    _proto.refresh = function refresh() {
      var _this2 = this;

      var autoMethod = this._scrollElement === this._scrollElement.window ? OffsetMethod.OFFSET : OffsetMethod.POSITION;
      var offsetMethod = this._config.method === 'auto' ? autoMethod : this._config.method;
      var offsetBase = offsetMethod === OffsetMethod.POSITION ? this._getScrollTop() : 0;
      this._offsets = [];
      this._targets = [];
      this._scrollHeight = this._getScrollHeight();
      var targets = $$$1.makeArray($$$1(this._selector));
      targets.map(function (element) {
        var target;
        var targetSelector = Util.getSelectorFromElement(element);

        if (targetSelector) {
          target = $$$1(targetSelector)[0];
        }

        if (target) {
          var targetBCR = target.getBoundingClientRect();

          if (targetBCR.width || targetBCR.height) {
            // TODO (fat): remove sketch reliance on jQuery position/offset
            return [$$$1(target)[offsetMethod]().top + offsetBase, targetSelector];
          }
        }

        return null;
      }).filter(function (item) {
        return item;
      }).sort(function (a, b) {
        return a[0] - b[0];
      }).forEach(function (item) {
        _this2._offsets.push(item[0]);

        _this2._targets.push(item[1]);
      });
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      $$$1(this._scrollElement).off(EVENT_KEY);
      this._element = null;
      this._scrollElement = null;
      this._config = null;
      this._selector = null;
      this._offsets = null;
      this._targets = null;
      this._activeTarget = null;
      this._scrollHeight = null;
    }; // Private


    _proto._getConfig = function _getConfig(config) {
      config = _extends({}, Default, config);

      if (typeof config.target !== 'string') {
        var id = $$$1(config.target).attr('id');

        if (!id) {
          id = Util.getUID(NAME);
          $$$1(config.target).attr('id', id);
        }

        config.target = "#" + id;
      }

      Util.typeCheckConfig(NAME, config, DefaultType);
      return config;
    };

    _proto._getScrollTop = function _getScrollTop() {
      return this._scrollElement === window ? this._scrollElement.pageYOffset : this._scrollElement.scrollTop;
    };

    _proto._getScrollHeight = function _getScrollHeight() {
      return this._scrollElement.scrollHeight || Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
    };

    _proto._getOffsetHeight = function _getOffsetHeight() {
      return this._scrollElement === window ? window.innerHeight : this._scrollElement.getBoundingClientRect().height;
    };

    _proto._process = function _process() {
      var scrollTop = this._getScrollTop() + this._config.offset;

      var scrollHeight = this._getScrollHeight();

      var maxScroll = this._config.offset + scrollHeight - this._getOffsetHeight();

      if (this._scrollHeight !== scrollHeight) {
        this.refresh();
      }

      if (scrollTop >= maxScroll) {
        var target = this._targets[this._targets.length - 1];

        if (this._activeTarget !== target) {
          this._activate(target);
        }

        return;
      }

      if (this._activeTarget && scrollTop < this._offsets[0] && this._offsets[0] > 0) {
        this._activeTarget = null;

        this._clear();

        return;
      }

      for (var i = this._offsets.length; i--;) {
        var isActiveTarget = this._activeTarget !== this._targets[i] && scrollTop >= this._offsets[i] && (typeof this._offsets[i + 1] === 'undefined' || scrollTop < this._offsets[i + 1]);

        if (isActiveTarget) {
          this._activate(this._targets[i]);
        }
      }
    };

    _proto._activate = function _activate(target) {
      this._activeTarget = target;

      this._clear();

      var queries = this._selector.split(','); // eslint-disable-next-line arrow-body-style


      queries = queries.map(function (selector) {
        return selector + "[data-target=\"" + target + "\"]," + (selector + "[href=\"" + target + "\"]");
      });
      var $link = $$$1(queries.join(','));

      if ($link.hasClass(ClassName.DROPDOWN_ITEM)) {
        $link.closest(Selector.DROPDOWN).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
        $link.addClass(ClassName.ACTIVE);
      } else {
        // Set triggered link as active
        $link.addClass(ClassName.ACTIVE); // Set triggered links parents as active
        // With both <ul> and <nav> markup a parent is the previous sibling of any nav ancestor

        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_LINKS + ", " + Selector.LIST_ITEMS).addClass(ClassName.ACTIVE); // Handle special case when .nav-link is inside .nav-item

        $link.parents(Selector.NAV_LIST_GROUP).prev(Selector.NAV_ITEMS).children(Selector.NAV_LINKS).addClass(ClassName.ACTIVE);
      }

      $$$1(this._scrollElement).trigger(Event.ACTIVATE, {
        relatedTarget: target
      });
    };

    _proto._clear = function _clear() {
      $$$1(this._selector).filter(Selector.ACTIVE).removeClass(ClassName.ACTIVE);
    }; // Static


    ScrollSpy._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var data = $$$1(this).data(DATA_KEY);

        var _config = typeof config === 'object' && config;

        if (!data) {
          data = new ScrollSpy(this, _config);
          $$$1(this).data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(ScrollSpy, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }, {
      key: "Default",
      get: function get() {
        return Default;
      }
    }]);
    return ScrollSpy;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(window).on(Event.LOAD_DATA_API, function () {
    var scrollSpys = $$$1.makeArray($$$1(Selector.DATA_SPY));

    for (var i = scrollSpys.length; i--;) {
      var $spy = $$$1(scrollSpys[i]);

      ScrollSpy._jQueryInterface.call($spy, $spy.data());
    }
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = ScrollSpy._jQueryInterface;
  $$$1.fn[NAME].Constructor = ScrollSpy;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return ScrollSpy._jQueryInterface;
  };

  return ScrollSpy;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0): tab.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

var Tab = function ($$$1) {
  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME = 'tab';
  var VERSION = '4.0.0';
  var DATA_KEY = 'bs.tab';
  var EVENT_KEY = "." + DATA_KEY;
  var DATA_API_KEY = '.data-api';
  var JQUERY_NO_CONFLICT = $$$1.fn[NAME];
  var TRANSITION_DURATION = 150;
  var Event = {
    HIDE: "hide" + EVENT_KEY,
    HIDDEN: "hidden" + EVENT_KEY,
    SHOW: "show" + EVENT_KEY,
    SHOWN: "shown" + EVENT_KEY,
    CLICK_DATA_API: "click" + EVENT_KEY + DATA_API_KEY
  };
  var ClassName = {
    DROPDOWN_MENU: 'dropdown-menu',
    ACTIVE: 'active',
    DISABLED: 'disabled',
    FADE: 'fade',
    SHOW: 'show'
  };
  var Selector = {
    DROPDOWN: '.dropdown',
    NAV_LIST_GROUP: '.nav, .list-group',
    ACTIVE: '.active',
    ACTIVE_UL: '> li > .active',
    DATA_TOGGLE: '[data-toggle="tab"], [data-toggle="pill"], [data-toggle="list"]',
    DROPDOWN_TOGGLE: '.dropdown-toggle',
    DROPDOWN_ACTIVE_CHILD: '> .dropdown-menu .active'
    /**
     * ------------------------------------------------------------------------
     * Class Definition
     * ------------------------------------------------------------------------
     */

  };

  var Tab =
  /*#__PURE__*/
  function () {
    function Tab(element) {
      this._element = element;
    } // Getters


    var _proto = Tab.prototype;

    // Public
    _proto.show = function show() {
      var _this = this;

      if (this._element.parentNode && this._element.parentNode.nodeType === Node.ELEMENT_NODE && $$$1(this._element).hasClass(ClassName.ACTIVE) || $$$1(this._element).hasClass(ClassName.DISABLED)) {
        return;
      }

      var target;
      var previous;
      var listElement = $$$1(this._element).closest(Selector.NAV_LIST_GROUP)[0];
      var selector = Util.getSelectorFromElement(this._element);

      if (listElement) {
        var itemSelector = listElement.nodeName === 'UL' ? Selector.ACTIVE_UL : Selector.ACTIVE;
        previous = $$$1.makeArray($$$1(listElement).find(itemSelector));
        previous = previous[previous.length - 1];
      }

      var hideEvent = $$$1.Event(Event.HIDE, {
        relatedTarget: this._element
      });
      var showEvent = $$$1.Event(Event.SHOW, {
        relatedTarget: previous
      });

      if (previous) {
        $$$1(previous).trigger(hideEvent);
      }

      $$$1(this._element).trigger(showEvent);

      if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) {
        return;
      }

      if (selector) {
        target = $$$1(selector)[0];
      }

      this._activate(this._element, listElement);

      var complete = function complete() {
        var hiddenEvent = $$$1.Event(Event.HIDDEN, {
          relatedTarget: _this._element
        });
        var shownEvent = $$$1.Event(Event.SHOWN, {
          relatedTarget: previous
        });
        $$$1(previous).trigger(hiddenEvent);
        $$$1(_this._element).trigger(shownEvent);
      };

      if (target) {
        this._activate(target, target.parentNode, complete);
      } else {
        complete();
      }
    };

    _proto.dispose = function dispose() {
      $$$1.removeData(this._element, DATA_KEY);
      this._element = null;
    }; // Private


    _proto._activate = function _activate(element, container, callback) {
      var _this2 = this;

      var activeElements;

      if (container.nodeName === 'UL') {
        activeElements = $$$1(container).find(Selector.ACTIVE_UL);
      } else {
        activeElements = $$$1(container).children(Selector.ACTIVE);
      }

      var active = activeElements[0];
      var isTransitioning = callback && Util.supportsTransitionEnd() && active && $$$1(active).hasClass(ClassName.FADE);

      var complete = function complete() {
        return _this2._transitionComplete(element, active, callback);
      };

      if (active && isTransitioning) {
        $$$1(active).one(Util.TRANSITION_END, complete).emulateTransitionEnd(TRANSITION_DURATION);
      } else {
        complete();
      }
    };

    _proto._transitionComplete = function _transitionComplete(element, active, callback) {
      if (active) {
        $$$1(active).removeClass(ClassName.SHOW + " " + ClassName.ACTIVE);
        var dropdownChild = $$$1(active.parentNode).find(Selector.DROPDOWN_ACTIVE_CHILD)[0];

        if (dropdownChild) {
          $$$1(dropdownChild).removeClass(ClassName.ACTIVE);
        }

        if (active.getAttribute('role') === 'tab') {
          active.setAttribute('aria-selected', false);
        }
      }

      $$$1(element).addClass(ClassName.ACTIVE);

      if (element.getAttribute('role') === 'tab') {
        element.setAttribute('aria-selected', true);
      }

      Util.reflow(element);
      $$$1(element).addClass(ClassName.SHOW);

      if (element.parentNode && $$$1(element.parentNode).hasClass(ClassName.DROPDOWN_MENU)) {
        var dropdownElement = $$$1(element).closest(Selector.DROPDOWN)[0];

        if (dropdownElement) {
          $$$1(dropdownElement).find(Selector.DROPDOWN_TOGGLE).addClass(ClassName.ACTIVE);
        }

        element.setAttribute('aria-expanded', true);
      }

      if (callback) {
        callback();
      }
    }; // Static


    Tab._jQueryInterface = function _jQueryInterface(config) {
      return this.each(function () {
        var $this = $$$1(this);
        var data = $this.data(DATA_KEY);

        if (!data) {
          data = new Tab(this);
          $this.data(DATA_KEY, data);
        }

        if (typeof config === 'string') {
          if (typeof data[config] === 'undefined') {
            throw new TypeError("No method named \"" + config + "\"");
          }

          data[config]();
        }
      });
    };

    _createClass(Tab, null, [{
      key: "VERSION",
      get: function get() {
        return VERSION;
      }
    }]);
    return Tab;
  }();
  /**
   * ------------------------------------------------------------------------
   * Data Api implementation
   * ------------------------------------------------------------------------
   */


  $$$1(document).on(Event.CLICK_DATA_API, Selector.DATA_TOGGLE, function (event) {
    event.preventDefault();

    Tab._jQueryInterface.call($$$1(this), 'show');
  });
  /**
   * ------------------------------------------------------------------------
   * jQuery
   * ------------------------------------------------------------------------
   */

  $$$1.fn[NAME] = Tab._jQueryInterface;
  $$$1.fn[NAME].Constructor = Tab;

  $$$1.fn[NAME].noConflict = function () {
    $$$1.fn[NAME] = JQUERY_NO_CONFLICT;
    return Tab._jQueryInterface;
  };

  return Tab;
}($);

/**
 * --------------------------------------------------------------------------
 * Bootstrap (v4.0.0-alpha.6): index.js
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * --------------------------------------------------------------------------
 */

(function ($$$1) {
  if (typeof $$$1 === 'undefined') {
    throw new TypeError('Bootstrap\'s JavaScript requires jQuery. jQuery must be included before Bootstrap\'s JavaScript.');
  }

  var version = $$$1.fn.jquery.split(' ')[0].split('.');
  var minMajor = 1;
  var ltMajor = 2;
  var minMinor = 9;
  var minPatch = 1;
  var maxMajor = 4;

  if (version[0] < ltMajor && version[1] < minMinor || version[0] === minMajor && version[1] === minMinor && version[2] < minPatch || version[0] >= maxMajor) {
    throw new Error('Bootstrap\'s JavaScript requires at least jQuery v1.9.1 but less than v4.0.0');
  }
})($);

exports.Util = Util;
exports.Alert = Alert;
exports.Button = Button;
exports.Carousel = Carousel;
exports.Collapse = Collapse;
exports.Dropdown = Dropdown;
exports.Modal = Modal;
exports.Popover = Popover;
exports.Scrollspy = ScrollSpy;
exports.Tab = Tab;
exports.Tooltip = Tooltip;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=bootstrap.js.map


/***/ }),
/* 36 */,
/* 37 */,
/* 38 */,
/* 39 */,
/* 40 */,
/* 41 */,
/* 42 */,
/* 43 */,
/* 44 */,
/* 45 */,
/* 46 */,
/* 47 */,
/* 48 */,
/* 49 */,
/* 50 */,
/* 51 */,
/* 52 */,
/* 53 */,
/* 54 */,
/* 55 */,
/* 56 */,
/* 57 */,
/* 58 */,
/* 59 */,
/* 60 */,
/* 61 */,
/* 62 */,
/* 63 */,
/* 64 */,
/* 65 */,
/* 66 */,
/* 67 */,
/* 68 */,
/* 69 */,
/* 70 */,
/* 71 */,
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(73);


/***/ }),
/* 73 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_layouts_SideBar__ = __webpack_require__(4);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__components_layouts_SideBar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0__components_layouts_SideBar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_layouts_NavBar__ = __webpack_require__(13);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__components_layouts_NavBar___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__components_layouts_NavBar__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Hello__ = __webpack_require__(74);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_Hello___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2__components_Hello__);
__webpack_require__(34);
// 匯入 Hello.vue 檔，不需加副檔名



new Vue({
    // 找到 hello.blade.php 中指定的掛載點元素
    el: '#app',

    // 使用我們建立的 Hello(.vue) 元件
    components: { NavBar: __WEBPACK_IMPORTED_MODULE_1__components_layouts_NavBar___default.a, SideBar: __WEBPACK_IMPORTED_MODULE_0__components_layouts_SideBar___default.a, Hello: __WEBPACK_IMPORTED_MODULE_2__components_Hello___default.a }
});

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

var disposed = false
function injectStyle (ssrContext) {
  if (disposed) return
  __webpack_require__(75)
}
var normalizeComponent = __webpack_require__(0)
/* script */
var __vue_script__ = __webpack_require__(77)
/* template */
var __vue_template__ = __webpack_require__(78)
/* template functional */
var __vue_template_functional__ = false
/* styles */
var __vue_styles__ = injectStyle
/* scopeId */
var __vue_scopeId__ = null
/* moduleIdentifier (server only) */
var __vue_module_identifier__ = null
var Component = normalizeComponent(
  __vue_script__,
  __vue_template__,
  __vue_template_functional__,
  __vue_styles__,
  __vue_scopeId__,
  __vue_module_identifier__
)
Component.options.__file = "resources/assets/js/components/Hello.vue"

/* hot reload */
if (false) {(function () {
  var hotAPI = require("vue-hot-reload-api")
  hotAPI.install(require("vue"), false)
  if (!hotAPI.compatible) return
  module.hot.accept()
  if (!module.hot.data) {
    hotAPI.createRecord("data-v-e28e2faa", Component.options)
  } else {
    hotAPI.reload("data-v-e28e2faa", Component.options)
  }
  module.hot.dispose(function (data) {
    disposed = true
  })
})()}

module.exports = Component.exports


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(76);
if(typeof content === 'string') content = [[module.i, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var update = __webpack_require__(2)("8a47bff6", content, false, {});
// Hot Module Replacement
if(false) {
 // When the styles change, update the <style> tags
 if(!content.locals) {
   module.hot.accept("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-e28e2faa\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Hello.vue", function() {
     var newContent = require("!!../../../../node_modules/css-loader/index.js!../../../../node_modules/vue-loader/lib/style-compiler/index.js?{\"vue\":true,\"id\":\"data-v-e28e2faa\",\"scoped\":false,\"hasInlineConfig\":true}!../../../../node_modules/vue-loader/lib/selector.js?type=styles&index=0!./Hello.vue");
     if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
     update(newContent);
   });
 }
 // When the module is disposed, remove the <style> tags
 module.hot.dispose(function() { update(); });
}

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(1)(false);
// imports


// module
exports.push([module.i, "\n.hello {\n    font-size: 2em;\n    color: green;\n}\n", ""]);

// exports


/***/ }),
/* 77 */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
//
//
//
//
//
//
//

/* harmony default export */ __webpack_exports__["default"] = ({
    props: ['name'],
    data: function data() {
        return {
            msg: 'This is a Laravel with Vue Demo.'
        };
    }
});

/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

var render = function() {
  var _vm = this
  var _h = _vm.$createElement
  var _c = _vm._self._c || _h
  return _c("div", [
    _c("h1", [_vm._v("Hello")]),
    _vm._v(" "),
    _c("p", { staticClass: "hello" }, [
      _vm._v("Hi " + _vm._s(_vm.name || "匿名"))
    ]),
    _vm._v(" "),
    _c("p", [_vm._v(_vm._s(_vm.msg))])
  ])
}
var staticRenderFns = []
render._withStripped = true
module.exports = { render: render, staticRenderFns: staticRenderFns }
if (false) {
  module.hot.accept()
  if (module.hot.data) {
    require("vue-hot-reload-api")      .rerender("data-v-e28e2faa", module.exports)
  }
}

/***/ })
],[72]);