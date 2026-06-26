/**
 * @fileOverview
 *
 * Text input support.
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {

    require('../tool/innertext');

    var Debug = require('../tool/debug');
    var debug = new Debug('input');

    function InputRuntime() {
        var fsm = this.fsm;
        var minder = this.minder;
        var hotbox = this.hotbox;
        var receiver = this.receiver;
        var receiverElement = receiver.element;
        var isGecko = window.kity.Browser.gecko;

        // setup everything to go
        setupReciverElement();
        setupFsm();
        setupHotbox();

        // expose editText()
        this.editText = editText;


        // listen the fsm changes, make action.
        function setupFsm() {

            // when jumped to input mode, enter
            fsm.when('* -> input', enterInputMode);

            // when exited, commit or exit depends on the exit reason
            fsm.when('input -> *', function(exit, enter, reason) {
                switch (reason) {
                    case 'input-cancel':
                        return exitInputMode();
                    case 'input-commit':
                    default:
                        return commitInputResult();
                }
            });

            // lost focus to commit
            receiver.onblur(function (e) {
                if (fsm.state() == 'input') {
                    fsm.jump('normal', 'input-commit');
                }
            });

            minder.on('beforemousedown', function () {
                if (fsm.state() == 'input') {
                    fsm.jump('normal', 'input-commit');
                }
            });

            minder.on('dblclick', function() {
                if (minder.getSelectedNode() && minder._status !== 'readonly') {
                    editText();
                }
            });
        }


        // let the receiver follow the current selected node position
        function setupReciverElement() {
            if (debug.flaged) {
                receiverElement.classList.add('debug');
            }

            receiverElement.onmousedown = function(e) {
                e.stopPropagation();
            };

            minder.on('layoutallfinish viewchange viewchanged selectionchange', function(e) {

                // viewchange event is too frequenced, lazy it
                if (e.type == 'viewchange' && fsm.state() != 'input') return;

                updatePosition();
            });

            updatePosition();
        }


        // edit entrance in hotbox
        function setupHotbox() {
            hotbox.state('main').button({
                position: 'center',
                label: 'Edit',
                key: 'F2',
                enable: function() {
                    return minder.queryCommandState('text') != -1;
                },
                action: editText
            });
        }


        /**
         * Detect font styling so bold/italic triggered by ctrl/cmd + b/i in edit mode matches the rendered node.
         * @editor Naixor
         * @Date 2015-12-2
         */
         // edit for the selected node
        function editText() {
            var node = minder.getSelectedNode();
            if (!node) {
                return;
            }
            var textContainer = receiverElement;
            receiverElement.innerText = "";
            if (node.getData('font-weight') === 'bold') {
                var b = document.createElement('b');
                textContainer.appendChild(b);
                textContainer = b;
            }
            if (node.getData('font-style') === 'italic') {
                var i = document.createElement('i');
                textContainer.appendChild(i);
                textContainer = i;
            }
            textContainer.innerText = minder.queryCommandValue('text');

            if (isGecko) {
                receiver.fixFFCaretDisappeared();
            };
            fsm.jump('input', 'input-request');
            receiver.selectAll();
        }

        /**
         * Detect font styling so bold/italic triggered by ctrl/cmd + b/i in edit mode matches the rendered node.
         * @editor Naixor
         * @Date 2015-12-2
         */
        function enterInputMode() {
            var node = minder.getSelectedNode();
            if (node) {
                var fontSize = node.getData('font-size') || node.getStyle('font-size');
                receiverElement.style.fontSize = fontSize + 'px';
                receiverElement.style.minWidth = 0;
                receiverElement.style.minWidth = receiverElement.clientWidth + 'px';
                receiverElement.style.fontWeight = node.getData('font-weight') || '';
                receiverElement.style.fontStyle = node.getData('font-style') || '';
                receiverElement.classList.add('input');
                receiverElement.focus();
            }
        }

        /**
         * Handle text submission.
         * @Desc: Some browsers, such as Chrome, wrap copied node text in a span. This logic then sees a span instead of a text node, which can otherwise produce undefined.
         * @Warning: The code below uses [].slice.call to convert HTMLDomCollection to Array, which may have issues in IE8 and below.
         * @Editor: Naixor
         * @Date: 2015.9.16
         */
        function commitInputText (textNodes) {
            var text = '';
            var TAB_CHAR = '\t',
                ENTER_CHAR = '\n',
                STR_CHECK = /\S/,
                SPACE_CHAR = '\u0020',
                // Handle SPACE charCode values 32 and 160 across browsers such as Firefox, SG, BD, LB, and IE.
                SPACE_CHAR_REGEXP = new RegExp('(\u0020|' + String.fromCharCode(160) + ')'),
                BR = document.createElement('br');
            var isBold = false,
                isItalic = false;

            for (var str,
                    _divChildNodes,
                    space_l, space_num, tab_num,
                    i = 0, l = textNodes.length; i < l; i++) {
                str = textNodes[i];

                switch (Object.prototype.toString.call(str)) {
                    // Normal handling.
                    case '[object HTMLBRElement]': {
                        text += ENTER_CHAR;
                        break;
                    }
                    case '[object Text]': {
                        // SG may unexpectedly add &nbsp;, which affects later checks. Remove it.
                        /**
                         * Firefox wholeText can cause this issue:
                         *     |123| -> Type text in a node, creating TextNode [#Text 123].
                         *     Commit, edit again, and append characters.
                         *     |123abc| -> 123 becomes one TextNode and abc another, but wholeText on either returns 123abc.
                         * This bug exists only in Firefox, so use textContent instead of wholeText.
                         */
                        str = str.textContent.replace("&nbsp;", " ");

                        if (!STR_CHECK.test(str)) {
                            space_l = str.length;
                            while (space_l--) {
                                if (SPACE_CHAR_REGEXP.test(str[space_l])) {
                                    text += SPACE_CHAR;
                                } else if (str[space_l] === TAB_CHAR) {
                                    text += TAB_CHAR;
                                }
                            }
                        } else {
                            text += str;
                        }
                        break;
                    }
                    // ctrl + b/i adds <b>/<i> tags to apply bold and italic.
                    case '[object HTMLElement]': {
                        switch (str.nodeName) {
                            case "B": {
                                isBold = true;
                                break;
                            }
                            case "I": {
                                isItalic = true;
                                break;
                            }
                            default: {}
                        }
                        [].splice.apply(textNodes, [i, 1].concat([].slice.call(str.childNodes)));
                        l = textNodes.length;
                        i--;
                        break;
                    }
                    // Added span tags are normalized and handled above.
                    case '[object HTMLSpanElement]': {
                        [].splice.apply(textNodes, [i, 1].concat([].slice.call(str.childNodes)));
                        l = textNodes.length;
                        i--;
                        break;
                    }
                    // If the tag is an image, load it when it has a valid URL.
                    case '[object HTMLImageElement]': {
                        if (str.src) {
                            if (/http(|s):\/\//.test(str.src)) {
                                minder.execCommand("Image", str.src, str.alt);
                            } else {
                                // data:image protocol case.
                            }
                        };
                        break;
                    }
                    // Added div tags are normalized and handled above.
                    case '[object HTMLDivElement]': {
                        _divChildNodes = [];
                        for (var di = 0, l = str.childNodes.length; di < l; di++) {
                            _divChildNodes.push(str.childNodes[di]);
                        }
                        _divChildNodes.push(BR);
                        [].splice.apply(textNodes, [i, 1].concat(_divChildNodes));
                        l = textNodes.length;
                        i--;
                        break;
                    }
                    default: {
                        if (str && str.childNodes.length) {
                            _divChildNodes = [];
                            for (var di = 0, l = str.childNodes.length; di < l; di++) {
                                _divChildNodes.push(str.childNodes[di]);
                            }
                            _divChildNodes.push(BR);
                            [].splice.apply(textNodes, [i, 1].concat(_divChildNodes));
                            l = textNodes.length;
                            i--;
                        } else {
                            if (str && str.textContent !== undefined) {
                                text += str.textContent;
                            } else {
                                text += "";
                            }
                        }
                        // For other pasted styled nodes, use textContent or an empty string when unavailable.
                    }
                }
            };

            text = text.replace(/^\n*|\n*$/g, '');
            text = text.replace(new RegExp('(\n|\r|\n\r)(\u0020|' + String.fromCharCode(160) + '){4}', 'g'), '$1\t');
            minder.getSelectedNode().setText(text);
            if (isBold) {
                minder.queryCommandState('bold') || minder.execCommand('bold');
            } else {
                minder.queryCommandState('bold') && minder.execCommand('bold');
            }

            if (isItalic) {
                minder.queryCommandState('italic') || minder.execCommand('italic');
            } else {
                minder.queryCommandState('italic') && minder.execCommand('italic');
            }
            exitInputMode();
            return text;
        }

        /**
         * Determine whether node text can be parsed as node data.
         * @Desc: Some browsers, such as Chrome, wrap copied node text in a span. This logic then sees a span instead of a text node, which can otherwise produce undefined.
         * @Notice: This logic should be split into kityminder-core/core/data with a dedicated importJson event for a node.
         * @Editor: Naixor
         * @Date: 2015.9.16
         */
        function commitInputNode(node, text) {
            try {
                minder.decodeData('text', text).then(function(json) {
                    function importText(node, json, minder) {
                        var data = json.data;

                        node.setText(data.text || '');

                        var childrenTreeData = json.children || [];
                        for (var i = 0; i < childrenTreeData.length; i++) {
                            var childNode = minder.createNode(null, node);
                            importText(childNode, childrenTreeData[i], minder);
                        }
                        return node;
                    }
                    importText(node, json, minder);
                    minder.fire("contentchange");
                    minder.getRoot().renderTree();
                    minder.layout(300);
                });
            } catch (e) {
                minder.fire("contentchange");
                minder.getRoot().renderTree();

                // Ignore content that cannot be converted into mind map nodes.
                if (e.toString() !== 'Error: Invalid local format') {
                    throw e;
                }
            }
        }

        function commitInputResult() {
            /**
             * @Desc: Handle the following:
             *             Decide whether to generate new nodes based on user input.
             *        fix #83 https://github.com/fex-team/kityminder-editor/issues/83
             * @Editor: Naixor
             * @Date: 2015.9.16
             */
            var textNodes = [].slice.call(receiverElement.childNodes);

            /**
             * @Desc: setTimeout is needed because receiverElement.innerHTML="" can make later textContent use in commitInputText fail in IE.
             * @Editor: Naixor
             * @Date: 2015.12.14
             */
            setTimeout(function () {
                // Fix SVG offset issues caused by oversized content.
                receiverElement.innerHTML = "";
            }, 0);
            var node = minder.getSelectedNode();

            textNodes = commitInputText(textNodes);
            commitInputNode(node, textNodes);

            if (node.type == 'root') {
                var rootText = minder.getRoot().getText();
                minder.fire('initChangeRoot', {text: rootText});
            }
        }

        function exitInputMode() {
            receiverElement.classList.remove('input');
            receiver.selectAll();
        }

        function updatePosition() {
            var planed = updatePosition;

            var focusNode = minder.getSelectedNode();
            if (!focusNode) return;

            if (!planed.timer) {
                planed.timer = setTimeout(function() {
                    var box = focusNode.getRenderBox('TextRenderer');
                    receiverElement.style.left = Math.round(box.x) + 'px';
                    receiverElement.style.top = (debug.flaged ? Math.round(box.bottom + 30) : Math.round(box.y)) + 'px';
                    //receiverElement.focus();
                    planed.timer = 0;
                });
            }
        }
    }

    return module.exports = InputRuntime;
});
