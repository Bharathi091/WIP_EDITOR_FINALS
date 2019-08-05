/* globals chrome: false */
/* globals __dirname: false */
/* globals require: false */
/* globals Buffer: false */
/* globals module: false */

/**
 * Typo is a JavaScript implementation of a spellchecker using hunspell-style 
 * dictionaries.
 */

/***
 **Module Name:  spellCheck
 **File Name :  spellCheck.js
 **Project :      Fulcrum spell Checker
 **Copyright(c) : Fulcrum.
 **Organization : Fulcrum
 **author :  Fulcrum UI Team
 **license :
 **version :  0.0.1
 **Created on : Mar 26 2019
 **Last modified on: Apr 22 2019
 **Description : 
 */

var Typo;

(function() {
	"use strict";

	/**
	 * Typo constructor.
	 *
	 * @param {String} [dictionary] The locale code of the dictionary being used. e.g.,
	 *                              "en_US". This is only used to auto-load dictionaries.
	 * @param {String} [affData]    The data from the dictionary's .aff file. If omitted
	 *                              and Typo.js is being used in a Chrome extension, the .aff
	 *                              file will be loaded automatically from
	 *                              lib/typo/dictionaries/[dictionary]/[dictionary].aff
	 *                              In other environments, it will be loaded from
	 *                              [settings.dictionaryPath]/dictionaries/[dictionary]/[dictionary].aff
	 * @param {String} [wordsData]  The data from the dictionary's .dic file. If omitted
	 *                              and Typo.js is being used in a Chrome extension, the .dic
	 *                              file will be loaded automatically from
	 *                              lib/typo/dictionaries/[dictionary]/[dictionary].dic
	 *                              In other environments, it will be loaded from
	 *                              [settings.dictionaryPath]/dictionaries/[dictionary]/[dictionary].dic
	 * @param {Object} [settings]   Constructor settings. Available properties are:
	 *                              {String} [dictionaryPath]: path to load dictionary from in non-chrome
	 *                              environment.
	 *                              {Object} [flags]: flag information.
	 *                              {Boolean} [asyncLoad]: If true, affData and wordsData will be loaded
	 *                              asynchronously.
	 *                              {Function} [loadedCallback]: Called when both affData and wordsData
	 *                              have been loaded. Only used if asyncLoad is set to true. The parameter
	 *                              is the instantiated Typo object.
	 *
	 * @returns {Typo} A Typo object.
	 */
	(function(root, factory) {
		if (typeof define === 'function' && define.amd) {

			// AMD. Register as an anonymous module.
			define(["jquery"], function($) {
				return (root.returnExportsGlobal = factory($));
			});
		} else if (typeof exports === 'object') {
			// Node. Does not work with strict CommonJS, but
			// only CommonJS-like enviroments that support module.exports,
			// like Node.
			module.exports = factory(require("jquery"));
		} else {
			factory(jQuery);
		}
	}(this, function($) {

		/*
		  Implement Github like autocomplete mentions
		  http://ichord.github.com/At.js
  
		  Copyright (c) 2013 chord.luo@gmail.com
		  Licensed under the MIT license.
		*/

		"use strict";
		var EditableCaret, InputCaret, Mirror, Utils, discoveryIframeOf, methods, oDocument, oFrame, oWindow, pluginName, setContextBy;

		pluginName = 'caret';

		EditableCaret = (function() {
			function EditableCaret($inputor) {
				this.$inputor = $inputor;
				this.domInputor = this.$inputor[0];
			}

			EditableCaret.prototype.setPos = function(pos) {
				var fn, found, offset, sel;
				if (sel = oWindow.getSelection()) {
					offset = 0;
					found = false;
					(fn = function(pos, parent) {
						var node, range, _i, _len, _ref, _results;
						_ref = parent.childNodes;
						_results = [];
						for (_i = 0, _len = _ref.length; _i < _len; _i++) {
							node = _ref[_i];
							if (found) {
								break;
							}
							if (node.nodeType === 3) {
								if (offset + node.length >= pos) {
									found = true;
									range = oDocument.createRange();
									range.setStart(node, pos - offset);
									sel.removeAllRanges();
									sel.addRange(range);
									break;
								} else {
									_results.push(offset += node.length);
								}
							} else {
								_results.push(fn(pos, node));
							}
						}
						return _results;
					})(pos, this.domInputor);
				}
				return this.domInputor;
			};

			EditableCaret.prototype.getIEPosition = function() {
				return this.getPosition();
			};

			EditableCaret.prototype.getPosition = function() {
				var inputor_offset, offset;
				offset = this.getOffset();
				inputor_offset = this.$inputor.offset();
				offset.left -= inputor_offset.left;
				offset.top -= inputor_offset.top;
				return offset;
			};

			EditableCaret.prototype.getOldIEPos = function() {
				var preCaretTextRange, textRange;
				textRange = oDocument.selection.createRange();
				preCaretTextRange = oDocument.body.createTextRange();
				preCaretTextRange.moveToElementText(this.domInputor);
				preCaretTextRange.setEndPoint("EndToEnd", textRange);
				return preCaretTextRange.text.length;
			};

			EditableCaret.prototype.getPos = function() {
				var clonedRange, pos, range;
				if (range = this.range()) {
					clonedRange = range.cloneRange();
					clonedRange.selectNodeContents(this.domInputor);
					clonedRange.setEnd(range.endContainer, range.endOffset);
					pos = clonedRange.toString().length;
					clonedRange.detach();
					return pos;
				} else if (oDocument.selection) {
					return this.getOldIEPos();
				}
			};

			EditableCaret.prototype.getOldIEOffset = function() {
				var range, rect;
				range = oDocument.selection.createRange().duplicate();
				range.moveStart("character", -1);
				rect = range.getBoundingClientRect();
				return {
					height: rect.bottom - rect.top,
					left: rect.left,
					top: rect.top
				};
			};

			EditableCaret.prototype.getOffset = function(pos) {
				var clonedRange, offset, range, rect, shadowCaret;
				if (oWindow.getSelection && (range = this.range())) {
					if (range.endOffset - 1 > 0 && range.endContainer !== this.domInputor) {
						clonedRange = range.cloneRange();
						clonedRange.setStart(range.endContainer, range.endOffset - 1);
						clonedRange.setEnd(range.endContainer, range.endOffset);
						rect = clonedRange.getBoundingClientRect();
						offset = {
							height: rect.height,
							left: rect.left + rect.width,
							top: rect.top
						};
						clonedRange.detach();
					}
					if (!offset || (offset != null ? offset.height : void 0) === 0) {
						clonedRange = range.cloneRange();
						shadowCaret = $(oDocument.createTextNode("|"));
						clonedRange.insertNode(shadowCaret[0]);
						clonedRange.selectNode(shadowCaret[0]);
						rect = clonedRange.getBoundingClientRect();
						offset = {
							height: rect.height,
							left: rect.left,
							top: rect.top
						};
						shadowCaret.remove();
						clonedRange.detach();
					}
				} else if (oDocument.selection) {
					offset = this.getOldIEOffset();
				}
				if (offset) {
					offset.top += $(oWindow).scrollTop();
					offset.left += $(oWindow).scrollLeft();
				}
				return offset;
			};

			EditableCaret.prototype.range = function() {
				var sel;
				if (!oWindow.getSelection) {
					return;
				}
				sel = oWindow.getSelection();
				if (sel.rangeCount > 0) {
					return sel.getRangeAt(0);
				} else {
					return null;
				}
			};

			return EditableCaret;

		})();

		InputCaret = (function() {
			function InputCaret($inputor) {
				this.$inputor = $inputor;
				this.domInputor = this.$inputor[0];
			}

			InputCaret.prototype.getIEPos = function() {
				var endRange, inputor, len, normalizedValue, pos, range, textInputRange;
				inputor = this.domInputor;
				range = oDocument.selection.createRange();
				pos = 0;
				if (range && range.parentElement() === inputor) {
					normalizedValue = inputor.value.replace(/\r\n/g, "\n");
					len = normalizedValue.length;
					textInputRange = inputor.createTextRange();
					textInputRange.moveToBookmark(range.getBookmark());
					endRange = inputor.createTextRange();
					endRange.collapse(false);
					if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
						pos = len;
					} else {
						pos = -textInputRange.moveStart("character", -len);
					}
				}
				return pos;
			};

			InputCaret.prototype.getPos = function() {
				if (oDocument.selection) {
					return this.getIEPos();
				} else {
					return this.domInputor.selectionStart;
				}
			};

			InputCaret.prototype.setPos = function(pos) {
				var inputor, range;
				inputor = this.domInputor;
				if (oDocument.selection) {
					range = inputor.createTextRange();
					range.move("character", pos);
					range.select();
				} else if (inputor.setSelectionRange) {
					inputor.setSelectionRange(pos, pos);
				}
				return inputor;
			};

			InputCaret.prototype.getIEOffset = function(pos) {
				var h, textRange, x, y;
				textRange = this.domInputor.createTextRange();
				pos || (pos = this.getPos());
				textRange.move('character', pos);
				x = textRange.boundingLeft;
				y = textRange.boundingTop;
				h = textRange.boundingHeight;
				return {
					left: x,
					top: y,
					height: h
				};
			};

			InputCaret.prototype.getOffset = function(pos) {
				var $inputor, offset, position;
				$inputor = this.$inputor;
				if (oDocument.selection) {
					offset = this.getIEOffset(pos);
					offset.top += $(oWindow).scrollTop() + $inputor.scrollTop();
					offset.left += $(oWindow).scrollLeft() + $inputor.scrollLeft();
					return offset;
				} else {
					offset = $inputor.offset();
					position = this.getPosition(pos);
					return offset = {
						left: offset.left + position.left - $inputor.scrollLeft(),
						top: offset.top + position.top - $inputor.scrollTop(),
						height: position.height
					};
				}
			};

			InputCaret.prototype.getPosition = function(pos) {
				var $inputor, at_rect, end_range, format, html, mirror, start_range;
				$inputor = this.$inputor;
				format = function(value) {
					value = value.replace(/<|>|`|"|&/g, '?').replace(/\r\n|\r|\n/g, "<br/>");
					if (/firefox/i.test(navigator.userAgent)) {
						value = value.replace(/\s/g, '&nbsp;');
					}
					return value;
				};
				if (pos === void 0) {
					pos = this.getPos();
				}
				start_range = $inputor.val().slice(0, pos);
				end_range = $inputor.val().slice(pos);
				html = "<span style='position: relative; display: inline;'>" + format(start_range) + "</span>";
				html += "<span id='caret' style='position: relative; display: inline;'>|</span>";
				html += "<span style='position: relative; display: inline;'>" + format(end_range) + "</span>";
				mirror = new Mirror($inputor);
				return at_rect = mirror.create(html).rect();
			};

			InputCaret.prototype.getIEPosition = function(pos) {
				var h, inputorOffset, offset, x, y;
				offset = this.getIEOffset(pos);
				inputorOffset = this.$inputor.offset();
				x = offset.left - inputorOffset.left;
				y = offset.top - inputorOffset.top;
				h = offset.height;
				return {
					left: x,
					top: y,
					height: h
				};
			};

			return InputCaret;

		})();

		Mirror = (function() {
			Mirror.prototype.css_attr = ["borderBottomWidth", "borderLeftWidth", "borderRightWidth", "borderTopStyle", "borderRightStyle",
				"borderBottomStyle", "borderLeftStyle", "borderTopWidth", "boxSizing", "fontFamily", "fontSize", "fontWeight", "height",
				"letterSpacing", "lineHeight", "marginBottom", "marginLeft", "marginRight", "marginTop", "outlineWidth", "overflow", "overflowX",
				"overflowY", "paddingBottom", "paddingLeft", "paddingRight", "paddingTop", "textAlign", "textOverflow", "textTransform",
				"whiteSpace", "wordBreak", "wordWrap"
			];

			function Mirror($inputor) {
				this.$inputor = $inputor;
			}

			Mirror.prototype.mirrorCss = function() {
				var css,
					_this = this;
				css = {
					position: 'absolute',
					left: -9999,
					top: 0,
					zIndex: -20000
				};
				if (this.$inputor.prop('tagName') === 'TEXTAREA') {
					this.css_attr.push('width');
				}
				$.each(this.css_attr, function(i, p) {
					return css[p] = _this.$inputor.css(p);
				});
				return css;
			};

			Mirror.prototype.create = function(html) {
				this.$mirror = $('<div></div>');
				this.$mirror.css(this.mirrorCss());
				this.$mirror.html(html);
				this.$inputor.after(this.$mirror);
				return this;
			};

			Mirror.prototype.rect = function() {
				var $flag, pos, rect;
				$flag = this.$mirror.find("#caret");
				pos = $flag.position();
				rect = {
					left: pos.left,
					top: pos.top,
					height: $flag.height()
				};
				this.$mirror.remove();
				return rect;
			};

			return Mirror;

		})();

		Utils = {
			contentEditable: function($inputor) {
				return !!($inputor[0].contentEditable && $inputor[0].contentEditable === 'true');
			}
		};

		methods = {
			pos: function(pos) {
				if (pos || pos === 0) {
					return this.setPos(pos);
				} else {
					return this.getPos();
				}
			},
			position: function(pos) {
				if (oDocument.selection) {
					return this.getIEPosition(pos);
				} else {
					return this.getPosition(pos);
				}
			},
			offset: function(pos) {
				var offset;
				offset = this.getOffset(pos);
				return offset;
			}
		};

		oDocument = null;

		oWindow = null;

		oFrame = null;

		setContextBy = function(settings) {
			var iframe;
			if (iframe = settings != null ? settings.iframe : void 0) {
				oFrame = iframe;
				oWindow = iframe.contentWindow;
				return oDocument = iframe.contentDocument || oWindow.document;
			} else {
				oFrame = void 0;
				oWindow = window;
				return oDocument = document;
			}
		};

		discoveryIframeOf = function($dom) {
			var error;
			oDocument = $dom[0].ownerDocument;
			oWindow = oDocument.defaultView || oDocument.parentWindow;
			try {
				return oFrame = oWindow.frameElement;
			} catch (_error) {
				error = _error;
			}
		};

		$.fn.caret = function(method, value, settings) {
			var caret;
			if (methods[method]) {
				if ($.isPlainObject(value)) {
					setContextBy(value);
					value = void 0;
				} else {
					setContextBy(settings);
				}
				caret = Utils.contentEditable(this) ? new EditableCaret(this) : new InputCaret(this);
				return methods[method].apply(caret, [value]);
			} else {
				return $.error("Method " + method + " does not exist on jQuery.caret");
			}
		};

		$.fn.caret.EditableCaret = EditableCaret;

		$.fn.caret.InputCaret = InputCaret;

		$.fn.caret.Utils = Utils;

		$.fn.caret.apis = methods;

	}));

	Typo = function(dictionary, affData, wordsData, settings) {
		settings = settings || {};

		this.dictionary = null;

		this.rules = {};
		this.dictionaryTable = {};

		this.compoundRules = [];
		this.compoundRuleCodes = {};

		this.replacementTable = [];

		this.flags = settings.flags || {};

		this.memoized = {};

		this.loaded = false;

		var self = this;

		var path;

		// Loop-control variables.
		var i, j, _len, _jlen;

		if (dictionary) {
			self.dictionary = dictionary;

			// If the data is preloaded, just setup the Typo object.
			if (affData && wordsData) {
				setup();
			}
			// Loading data for Chrome extentions.
			else if (typeof window !== 'undefined' && 'chrome' in window && 'extension' in window.chrome && 'getURL' in window.chrome.extension) {
				if (settings.dictionaryPath) {
					path = settings.dictionaryPath;
				} else {
					path = "typo/dictionaries";
				}

				if (!affData) readDataFile(chrome.extension.getURL(path + "/" + dictionary + "/" + dictionary + ".aff"), setAffData);
				if (!wordsData) readDataFile(chrome.extension.getURL(path + "/" + dictionary + "/" + dictionary + ".dic"), setWordsData);
			} else {
				if (settings.dictionaryPath) {
					path = settings.dictionaryPath;
				} else if (typeof __dirname !== 'undefined') {
					path = __dirname + '/dictionaries';
				} else {
					path = './dictionaries';
				}

				if (!affData) readDataFile(path + "/" + dictionary + "/" + dictionary + ".aff", setAffData);
				if (!wordsData) readDataFile(path + "/" + dictionary + "/" + dictionary + ".dic", setWordsData);
			}
		}

		function readDataFile(url, setFunc) {
			var response = self._readFile(url, null, settings.asyncLoad);

			if (settings.asyncLoad) {
				response.then(function(data) {
					setFunc(data);
				});
			} else {
				setFunc(response);
			}
		}

		function setAffData(data) {
			affData = data;

			if (wordsData) {
				setup();
			}
		}

		function setWordsData(data) {
			wordsData = data;

			if (affData) {
				setup();
			}
		}

		function setup() {
			self.rules = self._parseAFF(affData);

			// Save the rule codes that are used in compound rules.
			self.compoundRuleCodes = {};

			for (i = 0, _len = self.compoundRules.length; i < _len; i++) {
				var rule = self.compoundRules[i];

				for (j = 0, _jlen = rule.length; j < _jlen; j++) {
					self.compoundRuleCodes[rule[j]] = [];
				}
			}

			// If we add this ONLYINCOMPOUND flag to self.compoundRuleCodes, then _parseDIC
			// will do the work of saving the list of words that are compound-only.
			if ("ONLYINCOMPOUND" in self.flags) {
				self.compoundRuleCodes[self.flags.ONLYINCOMPOUND] = [];
			}

			self.dictionaryTable = self._parseDIC(wordsData);

			// Get rid of any codes from the compound rule codes that are never used 
			// (or that were special regex characters).  Not especially necessary... 
			for (i in self.compoundRuleCodes) {
				if (self.compoundRuleCodes[i].length === 0) {
					delete self.compoundRuleCodes[i];
				}
			}

			// Build the full regular expressions for each compound rule.
			// I have a feeling (but no confirmation yet) that this method of 
			// testing for compound words is probably slow.
			for (i = 0, _len = self.compoundRules.length; i < _len; i++) {
				var ruleText = self.compoundRules[i];

				var expressionText = "";

				for (j = 0, _jlen = ruleText.length; j < _jlen; j++) {
					var character = ruleText[j];

					if (character in self.compoundRuleCodes) {
						expressionText += "(" + self.compoundRuleCodes[character].join("|") + ")";
					} else {
						expressionText += character;
					}
				}

				self.compoundRules[i] = new RegExp(expressionText, "i");
			}

			self.loaded = true;

			if (settings.asyncLoad && settings.loadedCallback) {
				settings.loadedCallback(self);
			}
		}

		return this;
	};

	Typo.prototype = {
		/**
		 * Loads a Typo instance from a hash of all of the Typo properties.
		 *
		 * @param object obj A hash of Typo properties, probably gotten from a JSON.parse(JSON.stringify(typo_instance)).
		 */

		load: function(obj) {
			for (var i in obj) {
				if (obj.hasOwnProperty(i)) {
					this[i] = obj[i];
				}
			}

			return this;
		},

		/**
		 * Read the contents of a file.
		 * 
		 * @param {String} path The path (relative) to the file.
		 * @param {String} [charset="ISO8859-1"] The expected charset of the file
		 * @param {Boolean} async If true, the file will be read asynchronously. For node.js this does nothing, all
		 *        files are read synchronously.
		 * @returns {String} The file data if async is false, otherwise a promise object. If running node.js, the data is
		 *          always returned.
		 */

		_readFile: function(path, charset, async) {
			charset = charset || "utf8";

			if (typeof XMLHttpRequest !== 'undefined') {
				var promise;
				var req = new XMLHttpRequest();
				req.open("GET", path, async);

				if (async) {
					promise = new Promise(function(resolve, reject) {
						req.onload = function() {
							if (req.status === 200) {
								resolve(req.responseText);
							} else {
								reject(req.statusText);
							}
						};

						req.onerror = function() {
							reject(req.statusText);
						}
					});
				}

				if (req.overrideMimeType)
					req.overrideMimeType("text/plain; charset=" + charset);

				req.send(null);

				return async ? promise : req.responseText;
			} else if (typeof require !== 'undefined') {
				// Node.js
				var fs = require("fs");

				try {
					if (fs.existsSync(path)) {
						return fs.readFileSync(path, charset);
					} else {
						console.log("Path " + path + " does not exist.");
					}
				} catch (e) {
					console.log(e);
					return '';
				}
			}
		},

		/**
		 * Parse the rules out from a .aff file.
		 *
		 * @param {String} data The contents of the affix file.
		 * @returns object The rules from the file.
		 */

		_parseAFF: function(data) {
			var rules = {};

			var line, subline, numEntries, lineParts;
			var i, j, _len, _jlen;

			// Remove comment lines
			data = this._removeAffixComments(data);

			var lines = data.split("\n");

			for (i = 0, _len = lines.length; i < _len; i++) {
				line = lines[i];

				var definitionParts = line.split(/\s+/);

				var ruleType = definitionParts[0];

				if (ruleType == "PFX" || ruleType == "SFX") {
					var ruleCode = definitionParts[1];
					var combineable = definitionParts[2];
					numEntries = parseInt(definitionParts[3], 10);

					var entries = [];

					for (j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
						subline = lines[j];

						lineParts = subline.split(/\s+/);
						var charactersToRemove = lineParts[2];

						var additionParts = lineParts[3].split("/");

						var charactersToAdd = additionParts[0];
						if (charactersToAdd === "0") charactersToAdd = "";

						var continuationClasses = this.parseRuleCodes(additionParts[1]);

						var regexToMatch = lineParts[4];

						var entry = {};
						entry.add = charactersToAdd;

						if (continuationClasses.length > 0) entry.continuationClasses = continuationClasses;

						if (regexToMatch !== ".") {
							if (ruleType === "SFX") {
								entry.match = new RegExp(regexToMatch + "$");
							} else {
								entry.match = new RegExp("^" + regexToMatch);
							}
						}

						if (charactersToRemove != "0") {
							if (ruleType === "SFX") {
								entry.remove = new RegExp(charactersToRemove + "$");
							} else {
								entry.remove = charactersToRemove;
							}
						}

						entries.push(entry);
					}

					rules[ruleCode] = {
						"type": ruleType,
						"combineable": (combineable == "Y"),
						"entries": entries
					};

					i += numEntries;
				} else if (ruleType === "COMPOUNDRULE") {
					numEntries = parseInt(definitionParts[1], 10);

					for (j = i + 1, _jlen = i + 1 + numEntries; j < _jlen; j++) {
						line = lines[j];

						lineParts = line.split(/\s+/);
						this.compoundRules.push(lineParts[1]);
					}

					i += numEntries;
				} else if (ruleType === "REP") {
					lineParts = line.split(/\s+/);

					if (lineParts.length === 3) {
						this.replacementTable.push([lineParts[1], lineParts[2]]);
					}
				} else {
					// ONLYINCOMPOUND
					// COMPOUNDMIN
					// FLAG
					// KEEPCASE
					// NEEDAFFIX

					this.flags[ruleType] = definitionParts[1];
				}
			}

			return rules;
		},

		/**
		 * Removes comment lines and then cleans up blank lines and trailing whitespace.
		 *
		 * @param {String} data The data from an affix file.
		 * @return {String} The cleaned-up data.
		 */

		_removeAffixComments: function(data) {
			// Remove comments
			// This used to remove any string starting with '#' up to the end of the line,
			// but some COMPOUNDRULE definitions include '#' as part of the rule.
			// I haven't seen any affix files that use comments on the same line as real data,
			// so I don't think this will break anything.
			data = data.replace(/^\s*#.*$/mg, "");

			// Trim each line
			data = data.replace(/^\s\s*/m, '').replace(/\s\s*$/m, '');

			// Remove blank lines.
			data = data.replace(/\n{2,}/g, "\n");

			// Trim the entire string
			data = data.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

			return data;
		},

		/**
		 * Parses the words out from the .dic file.
		 *
		 * @param {String} data The data from the dictionary file.
		 * @returns object The lookup table containing all of the words and
		 *                 word forms from the dictionary.
		 */

		_parseDIC: function(data) {
			data = this._removeDicComments(data);

			var lines = data.split("\n");
			var dictionaryTable = {};

			function addWord(word, rules) {
				// Some dictionaries will list the same word multiple times with different rule sets.
				if (!dictionaryTable.hasOwnProperty(word)) {
					dictionaryTable[word] = null;
				}

				if (rules.length > 0) {
					if (dictionaryTable[word] === null) {
						dictionaryTable[word] = [];
					}

					dictionaryTable[word].push(rules);
				}
			}

			// The first line is the number of words in the dictionary.
			for (var i = 1, _len = lines.length; i < _len; i++) {
				var line = lines[i];

				if (!line) {
					// Ignore empty lines.
					continue;
				}

				var parts = line.split("/", 2);

				var word = parts[0];

				// Now for each affix rule, generate that form of the word.
				if (parts.length > 1) {
					var ruleCodesArray = this.parseRuleCodes(parts[1]);

					// Save the ruleCodes for compound word situations.
					if (!("NEEDAFFIX" in this.flags) || ruleCodesArray.indexOf(this.flags.NEEDAFFIX) == -1) {
						addWord(word, ruleCodesArray);
					}

					for (var j = 0, _jlen = ruleCodesArray.length; j < _jlen; j++) {
						var code = ruleCodesArray[j];

						var rule = this.rules[code];

						if (rule) {
							var newWords = this._applyRule(word, rule);

							for (var ii = 0, _iilen = newWords.length; ii < _iilen; ii++) {
								var newWord = newWords[ii];

								addWord(newWord, []);

								if (rule.combineable) {
									for (var k = j + 1; k < _jlen; k++) {
										var combineCode = ruleCodesArray[k];

										var combineRule = this.rules[combineCode];

										if (combineRule) {
											if (combineRule.combineable && (rule.type != combineRule.type)) {
												var otherNewWords = this._applyRule(newWord, combineRule);

												for (var iii = 0, _iiilen = otherNewWords.length; iii < _iiilen; iii++) {
													var otherNewWord = otherNewWords[iii];
													addWord(otherNewWord, []);
												}
											}
										}
									}
								}
							}
						}

						if (code in this.compoundRuleCodes) {
							this.compoundRuleCodes[code].push(word);
						}
					}
				} else {
					addWord(word.trim(), []);
				}
			}

			return dictionaryTable;
		},

		/**
		 * Removes comment lines and then cleans up blank lines and trailing whitespace.
		 *
		 * @param {String} data The data from a .dic file.
		 * @return {String} The cleaned-up data.
		 */

		_removeDicComments: function(data) {
			// I can't find any official documentation on it, but at least the de_DE
			// dictionary uses tab-indented lines as comments.

			// Remove comments
			data = data.replace(/^\t.*$/mg, "");

			return data;
		},

		parseRuleCodes: function(textCodes) {
			if (!textCodes) {
				return [];
			} else if (!("FLAG" in this.flags)) {
				return textCodes.split("");
			} else if (this.flags.FLAG === "long") {
				var flags = [];

				for (var i = 0, _len = textCodes.length; i < _len; i += 2) {
					flags.push(textCodes.substr(i, 2));
				}

				return flags;
			} else if (this.flags.FLAG === "num") {
				return textCodes.split(",");
			}
		},

		/**
		 * Applies an affix rule to a word.
		 *
		 * @param {String} word The base word.
		 * @param {Object} rule The affix rule.
		 * @returns {String[]} The new words generated by the rule.
		 */

		_applyRule: function(word, rule) {
			var entries = rule.entries;
			var newWords = [];

			for (var i = 0, _len = entries.length; i < _len; i++) {
				var entry = entries[i];

				if (!entry.match || word.match(entry.match)) {
					var newWord = word;

					if (entry.remove) {
						newWord = newWord.replace(entry.remove, "");
					}

					if (rule.type === "SFX") {
						newWord = newWord + entry.add;
					} else {
						newWord = entry.add + newWord;
					}

					newWords.push(newWord);

					if ("continuationClasses" in entry) {
						for (var j = 0, _jlen = entry.continuationClasses.length; j < _jlen; j++) {
							var continuationRule = this.rules[entry.continuationClasses[j]];

							if (continuationRule) {
								newWords = newWords.concat(this._applyRule(newWord, continuationRule));
							}
							/*
							else {
								// This shouldn't happen, but it does, at least in the de_DE dictionary.
								// I think the author mistakenly supplied lower-case rule codes instead 
								// of upper-case.
							}
							*/
						}
					}
				}
			}

			return newWords;
		},

		/**
		 * Checks whether a word or a capitalization variant exists in the current dictionary.
		 * The word is trimmed and several variations of capitalizations are checked.
		 * If you want to check a word without any changes made to it, call checkExact()
		 *
		 * @see http://blog.stevenlevithan.com/archives/faster-trim-javascript re:trimming function
		 *
		 * @param {String} aWord The word to check.
		 * @returns {Boolean}
		 */

		check: function(aWord) {
			if (!this.loaded) {
				throw "Dictionary not loaded.";
			}

			// Remove leading and trailing whitespace
			var trimmedWord = aWord.replace(/^\s\s*/, '').replace(/\s\s*$/, '');

			if (this.checkExact(trimmedWord)) {
				return true;
			}

			// The exact word is not in the dictionary.
			if (trimmedWord.toUpperCase() === trimmedWord) {
				// The word was supplied in all uppercase.
				// Check for a capitalized form of the word.
				var capitalizedWord = trimmedWord[0] + trimmedWord.substring(1).toLowerCase();

				if (this.hasFlag(capitalizedWord, "KEEPCASE")) {
					// Capitalization variants are not allowed for this word.
					return false;
				}

				if (this.checkExact(capitalizedWord)) {
					return true;
				}
			}

			var lowercaseWord = trimmedWord.toLowerCase();

			if (lowercaseWord !== trimmedWord) {
				if (this.hasFlag(lowercaseWord, "KEEPCASE")) {
					// Capitalization variants are not allowed for this word.
					return false;
				}

				// Check for a lowercase form
				if (this.checkExact(lowercaseWord)) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Checks whether a word exists in the current dictionary.
		 *
		 * @param {String} word The word to check.
		 * @returns {Boolean}
		 */

		checkExact: function(word) {
			if (!this.loaded) {
				throw "Dictionary not loaded.";
			}

			var ruleCodes = this.dictionaryTable[word];

			var i, _len;

			if (typeof ruleCodes === 'undefined') {
				// Check if this might be a compound word.
				if ("COMPOUNDMIN" in this.flags && word.length >= this.flags.COMPOUNDMIN) {
					for (i = 0, _len = this.compoundRules.length; i < _len; i++) {
						if (word.match(this.compoundRules[i])) {
							return true;
						}
					}
				}
			} else if (ruleCodes === null) {
				// a null (but not undefined) value for an entry in the dictionary table
				// means that the word is in the dictionary but has no flags.
				return true;
			} else if (typeof ruleCodes === 'object') { // this.dictionary['hasOwnProperty'] will be a function.
				for (i = 0, _len = ruleCodes.length; i < _len; i++) {
					if (!this.hasFlag(word, "ONLYINCOMPOUND", ruleCodes[i])) {
						return true;
					}
				}
			}

			return false;
		},

		/**
		 * Looks up whether a given word is flagged with a given flag.
		 *
		 * @param {String} word The word in question.
		 * @param {String} flag The flag in question.
		 * @return {Boolean}
		 */

		hasFlag: function(word, flag, wordFlags) {
			if (!this.loaded) {
				throw "Dictionary not loaded.";
			}

			if (flag in this.flags) {
				if (typeof wordFlags === 'undefined') {
					wordFlags = Array.prototype.concat.apply([], this.dictionaryTable[word]);
				}

				if (wordFlags && wordFlags.indexOf(this.flags[flag]) !== -1) {
					return true;
				}
			}

			return false;
		},

		/**
		 * Returns a list of suggestions for a misspelled word.
		 *
		 * @see http://www.norvig.com/spell-correct.html for the basis of this suggestor.
		 * This suggestor is primitive, but it works.
		 *
		 * @param {String} word The misspelling.
		 * @param {Number} [limit=5] The maximum number of suggestions to return.
		 * @returns {String[]} The array of suggestions.
		 */

		alphabet: "",

		suggest: function(word, limit) {
			if (!this.loaded) {
				throw "Dictionary not loaded.";
			}

			limit = limit || 5;

			if (this.memoized.hasOwnProperty(word)) {
				var memoizedLimit = this.memoized[word]['limit'];

				// Only return the cached list if it's big enough or if there weren't enough suggestions
				// to fill a smaller limit.
				if (limit <= memoizedLimit || this.memoized[word]['suggestions'].length < memoizedLimit) {
					return this.memoized[word]['suggestions'].slice(0, limit);
				}
			}

			if (this.check(word)) return [];

			// Check the replacement table.
			for (var i = 0, _len = this.replacementTable.length; i < _len; i++) {
				var replacementEntry = this.replacementTable[i];

				if (word.indexOf(replacementEntry[0]) !== -1) {
					var correctedWord = word.replace(replacementEntry[0], replacementEntry[1]);

					if (this.check(correctedWord)) {
						return [correctedWord];
					}
				}
			}

			var self = this;
			self.alphabet = "abcdefghijklmnopqrstuvwxyz";

			/*
			if (!self.alphabet) {
				// Use the alphabet as implicitly defined by the words in the dictionary.
				var alphaHash = {};
				
				for (var i in self.dictionaryTable) {
					for (var j = 0, _len = i.length; j < _len; j++) {
						alphaHash[i[j]] = true;
					}
				}
				
				for (var i in alphaHash) {
					self.alphabet += i;
				}
				
				var alphaArray = self.alphabet.split("");
				alphaArray.sort();
				self.alphabet = alphaArray.join("");
			}
			*/

			/**
			 * Returns a hash keyed by all of the strings that can be made by making a single edit to the word (or words in) `words`
			 * The value of each entry is the number of unique ways that the resulting word can be made.
			 *
			 * @arg mixed words Either a hash keyed by words or a string word to operate on.
			 * @arg bool known_only Whether this function should ignore strings that are not in the dictionary.
			 */
			function edits1(words, known_only) {
				var rv = {};

				var i, j, _iilen, _len, _jlen, _edit;

				if (typeof words == 'string') {
					var word = words;
					words = {};
					words[word] = true;
				}

				for (var word in words) {
					for (i = 0, _len = word.length + 1; i < _len; i++) {
						var s = [word.substring(0, i), word.substring(i)];

						if (s[1]) {
							_edit = s[0] + s[1].substring(1);

							if (!known_only || self.check(_edit)) {
								if (!(_edit in rv)) {
									rv[_edit] = 1;
								} else {
									rv[_edit] += 1;
								}
							}
						}

						// Eliminate transpositions of identical letters
						if (s[1].length > 1 && s[1][1] !== s[1][0]) {
							_edit = s[0] + s[1][1] + s[1][0] + s[1].substring(2);

							if (!known_only || self.check(_edit)) {
								if (!(_edit in rv)) {
									rv[_edit] = 1;
								} else {
									rv[_edit] += 1;
								}
							}
						}

						if (s[1]) {
							for (j = 0, _jlen = self.alphabet.length; j < _jlen; j++) {
								// Eliminate replacement of a letter by itself
								if (self.alphabet[j] != s[1].substring(0, 1)) {
									_edit = s[0] + self.alphabet[j] + s[1].substring(1);

									if (!known_only || self.check(_edit)) {
										if (!(_edit in rv)) {
											rv[_edit] = 1;
										} else {
											rv[_edit] += 1;
										}
									}
								}
							}
						}

						if (s[1]) {
							for (j = 0, _jlen = self.alphabet.length; j < _jlen; j++) {
								_edit = s[0] + self.alphabet[j] + s[1];

								if (!known_only || self.check(_edit)) {
									if (!(_edit in rv)) {
										rv[_edit] = 1;
									} else {
										rv[_edit] += 1;
									}
								}
							}
						}
					}
				}

				return rv;
			}

			function correct(word) {
				// Get the edit-distance-1 and edit-distance-2 forms of this word.
				var ed1 = edits1(word);
				var ed2 = edits1(ed1, true);

				// Sort the edits based on how many different ways they were created.
				var weighted_corrections = ed2;

				for (var ed1word in ed1) {
					if (!self.check(ed1word)) {
						continue;
					}

					if (ed1word in weighted_corrections) {
						weighted_corrections[ed1word] += ed1[ed1word];
					} else {
						weighted_corrections[ed1word] = ed1[ed1word];
					}
				}

				var i, _len;

				var sorted_corrections = [];

				for (i in weighted_corrections) {
					if (weighted_corrections.hasOwnProperty(i)) {
						sorted_corrections.push([i, weighted_corrections[i]]);
					}
				}

				function sorter(a, b) {
					if (a[1] < b[1]) {
						return -1;
					}

					// @todo If a and b are equally weighted, add our own weight based on something like the key locations on this language's default keyboard.

					return 1;
				}

				sorted_corrections.sort(sorter).reverse();

				var rv = [];

				var capitalization_scheme = "lowercase";

				if (word.toUpperCase() === word) {
					capitalization_scheme = "uppercase";
				} else if (word.substr(0, 1).toUpperCase() + word.substr(1).toLowerCase() === word) {
					capitalization_scheme = "capitalized";
				}

				var working_limit = limit;

				for (i = 0; i < Math.min(working_limit, sorted_corrections.length); i++) {
					if ("uppercase" === capitalization_scheme) {
						sorted_corrections[i][0] = sorted_corrections[i][0].toUpperCase();
					} else if ("capitalized" === capitalization_scheme) {
						sorted_corrections[i][0] = sorted_corrections[i][0].substr(0, 1).toUpperCase() + sorted_corrections[i][0].substr(1);
					}

					if (!self.hasFlag(sorted_corrections[i][0], "NOSUGGEST") && rv.indexOf(sorted_corrections[i][0]) == -1) {
						rv.push(sorted_corrections[i][0]);
					} else {
						// If one of the corrections is not eligible as a suggestion , make sure we still return the right number of suggestions.
						working_limit++;
					}
				}

				return rv;
			}

			this.memoized[word] = {
				'suggestions': correct(word),
				'limit': limit
			};

			return this.memoized[word]['suggestions'];
		}
	};
})();

// Support for use as a node.js module.
if (typeof module !== 'undefined') {
	module.exports = Typo;
}
var ignoreAllArr = [];

var oldPos = 0;

(function($) {

	$.fn.spellCheker = function(opts) {

		var changeObject = {};
		var spanId = 0,
			position = 0;
		var logValue = 0;
		var clickbindingValue = '';
		var logValue1 = "";
		var bindingValueLog = 0;
		var bindingValueLog1 = 0;
		var bindingValue = '';
		var bindingValue11 = '';
		var bindingValue111 = '';
		var rowIndex = '';

		var className = $(this).attr("class");

		var options = $.extend({
			lang_code: opts.lang_code,
			Typo: Typo,
			table: "",
			outputTex: "outputTex",
			scope: opts["scope"],
			scope1: opts["scope1"]
		}, opts);

		var otable = options.table;

		var saveObjectScope = options.scope;
		var log = options.scope;

		var log1 = options.scope1;
		var dictionary = new Typo(options.lang_code, false, false, {
			dictionaryPath: options.dictionaryPath
		});

		function split(word, self, position) {

			var specialChars = /([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/;
			var verifiedString = "";
			var k = 0;

			for (var i = 0; i < word.length; i++) {
				k++;

				if (specialChars.test(word[i])) {
					var numericItem = "";
					var subText = word[i].replace(/\'/g, '').split(/([\d!~@#$%^&*()_+\=\[\]{};':"\\|,.<>\/?]+)/).filter(Boolean);
					subText.forEach(function(subItem) {
						if (ignoreAllArr.includes(subItem)) {
							numericItem = numericItem + subItem;
						} else {

							if (specialChars.test(subItem)) {

								numericItem = numericItem + subItem;
							} else {
								if (dictionary.check(subItem) == false) {
									numericItem = numericItem + '<span id="id' + spanId + '"class="target">' + subItem + '</span>';
									spanId++

								} else {
									numericItem = numericItem + subItem;
								}
							}
						}

					})
					verifiedString = verifiedString + numericItem;

				} else {
					if (ignoreAllArr.includes(word[i])) {
						verifiedString = verifiedString + word[i];
					} else {
						if (dictionary.check(word[i]) == false) {
							verifiedString = verifiedString + '<span id="id' + spanId + '"class="target">' + word[i] + '</span>';
							spanId++

						} else {
							verifiedString = verifiedString + word[i];
						}

					}
				}

				if (i == word.length - 1) {

					$(self).html(verifiedString);

					if (oldPos != 0) {
						position = oldPos;

					}

				}

			}
		

			$("#" + self.id).caret('pos', position).focus();

		
	

		

		}

		function spellChkr(divid, logValue) {

			var listClasses = "." + className;
			if (divid != 0) {
				listClasses = "#" + divid;
			}

			$(listClasses + ":visible").each(function(index, element) {

				if (log1.ignoreLog === 1) {
					ignoreAllArr = [];
				}
				$('#' + $($(element).context).attr('id') + ':visible').unbind("keyup");

				$('#' + $($(element).context).attr('id') + ':visible').keyup(function(event) {



					var self = this;
						 position = resetOffset($("#" + this.id));
					if(event.keyCode === 86){
						setTimeout(function(){
					otable.getRows()[0].getCells()[5].focus(5);	
					setTimeout(function(){
							$("#" + self.id).caret('pos', position).focus();
					}, 300);
					
						}, 1000);
					  
		
					}
					
					

				

					 oldPos = position;
					var innertext = this.innerText;
					var word = innertext.replace(/\'/g, '').split(/([\s]+)/).filter(Boolean); //split the string
					

					split(word, self, position);
					target($(this).attr('id'));

					if (otable != '') {
						rowIndex = $($($(element).context).attr('rowIndex')).selector;
                      
                      
						// var selContext = otable.getContextByIndex(rowIndex);
						// selContext.getModel().setProperty(selContext.getPath() + "/NarrativeString", $(self).text());
						// changeObject = selContext.getObject();
						var NarrativeString = $(self).text();
						changeObject = saveObjectScope.homeTable[rowIndex];
						changeObject.NarrativeString = NarrativeString;
						saveObjectScope.homeTable[rowIndex] = changeObject;
						// log1.jsonModel.setProperty("/modelData",homeTable);
						log1.jsonModel.setProperty("/modelData", saveObjectScope.homeTable);
						otable.setModel(log1.jsonModel);
						otable.bindRows("/modelData");
						saveObjectScope.saveObjects.push(changeObject);
						spellChkr(self.id, logValue1);
						saveObjectScope.isChanged = true;
						saveObjectScope.scope = otable;

						// var headerExpanded = saveObjectScope.dynamicId.getHeaderExpanded();

						// if (headerExpanded === true) {
						// 	var dynmicpx = saveObjectScope.dynmaicpx;

						// 	var orgpx = dynmicpx / 2.2 + "px";
						// 	saveObjectScope.orgpx = orgpx;
						// // otable.setVisibleRowCount(11);

						// } else {
						// 	var dynmicpx = saveObjectScope.dynmaicpx;
						// 	var orgpx = dynmicpx / 1.6 + "px";
						// 	saveObjectScope.orgpx = orgpx;
						// // otable.setVisibleRowCount(16);
						// }

					}
					
					
					


				})

				// var headerExpanded = saveObjectScope.dynamicId.getHeaderExpanded();

				// if (headerExpanded === true) {
				// 	var dynmicpx = saveObjectScope.dynmaicpx;

				// 	var orgpx = dynmicpx / 2.2 + "px";
				// 	saveObjectScope.orgpx = orgpx;
				// 	// otable.setVisibleRowCount(11);

				// } else {
				// 	var dynmicpx = saveObjectScope.dynmaicpx;
				// 	var orgpx = dynmicpx / 1.6 + "px";
				// 	saveObjectScope.orgpx = orgpx;
				// // otable.setVisibleRowCount(16);
				// }

				var inputText = $(this).text();
				var splitwords = inputText.replace(/\'/g, '').split(/([\s]+)/).filter(Boolean); //split the string
				var self = this;

				split(splitwords, self, 0);
                
    
                
				target($(this).attr('id'), element);

				if (index == $(listClasses + ":visible").length - 1) {
					//sap.ui.core.BusyIndicator.hide();
				}

			});

		}

		function target(parentDivId, element) {

			var targetCls = ".target";
			if (parentDivId != "") {
				targetCls = "#" + parentDivId + " .target";
			}
			$(targetCls).contextmenu(function(eve) {

				if ($(".menuitems")) {
					$(".menuitems").remove();
				}

				document.addEventListener('contextmenu', event => event.preventDefault());

				var currentSpanId = eve.target.id;

				var array_of_suggestions = dictionary.suggest(this.innerText);
				ul = document.createElement('ul');
				ul.className = 'menuitems';

				document.body.appendChild(ul);
				if (array_of_suggestions.length === 0) {
					ul.id = 'ul';
					var li = document.createElement('li');
					li.id = 'li';
					li.className = 'menuitemsLi';
					ul.appendChild(li);
					li.innerText = "Ignore All";
				} else {
					for (var i = 0; i < array_of_suggestions.length; i++) {
						ul.id = 'ul' + i;
						var li = document.createElement('li');
						li.id = 'li' + i;
						li.className = 'menuitemsLi';
						ul.appendChild(li);
						li.innerText = array_of_suggestions[i];

					}
					li.className = 'ignoreall';
					li.innerText = "Ignore All"
				}

				$(".menuitems").finish().toggle(100);
				$(".menuitems").css({
					top: eve.pageY + "px",
					left: eve.pageX + "px"
				});

				$(document).bind("mousedown", function(e) {
					if (!$(e.target).parents(".menuitems").length > 0) {

						$(".menuitems").hide(100);
					}
				});

				$(".menuitems li").click(function(event) {

					var oldText = eve.target.innerText;
					var parentDivId = $("#" + eve.target.id).parent().attr('id');
					var parentDivText = $("#" + parentDivId).html();

					if (event.target.innerText.toLowerCase() === "ignore all") {

						if (!ignoreAllArr.includes(eve.target.innerText)) {
							ignoreAllArr.push(eve.target.innerText);
						}
						var parentDivText = parentDivText.replace('<span id="' + eve.target.id + '" class="target">' + eve.target.innerText + '</span>',
							eve.target.innerText);
						log1.ignoreLog = 0;
						spellChkr(0, logValue1);

					} else {

						var parentDivText = parentDivText.replace('<span id="' + eve.target.id + '" class="target">' + eve.target.innerText + '</span>',
							event.target.innerText);

						if (otable != '') {

							var rowIndex = $($($(element).context).attr('rowIndex')).selector

							var selContext = otable.getContextByIndex(rowIndex);
							selContext.getModel().setProperty(selContext.getPath() + "/" + options.outputTex, parentDivText);
							changeObject = selContext.getObject();
							saveObjectScope.saveObjects.push(changeObject);

						}
						$("#" + parentDivId).html(parentDivText);
						spellChkr(parentDivId, logValue1);

					}

					$(".menuitems").hide();

				});

			});

		}

		$("." + className + ":visible").attr("contenteditable", true); //making the div editable
		$("." + className + ":visible").attr("spellcheck", true);

		spellChkr(0, 0);

		return changeObject;
	};

}(jQuery));

function resetOffset($textField) {

	var offset = $textField.caret('offset');
	var position1 = $textField.caret('pos');

	return position1;
}