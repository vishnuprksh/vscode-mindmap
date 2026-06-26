/**
 * @fileOverview
 *
 * Keyboard event receiver and dispatcher.
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */

define(function(require, exports, module) {
    var key = require('../tool/key');
    var hotbox = require('hotbox');

    function ReceiverRuntime() {
        var fsm = this.fsm;
        var minder = this.minder;
        var me = this;

        // Event receiving div.
        var element = document.createElement('div');
        element.contentEditable = true;
        /**
         * @Desc: Add tabindex so the contenteditable element can receive focus and blur events whether contenteditable is true or false.
         * @Editor: Naixor
         * @Date: 2015.09.14
         */
        element.setAttribute('tabindex', -1);
        element.classList.add('receiver');
        element.onkeydown = element.onkeypress = element.onkeyup = dispatchKeyEvent;
        element.addEventListener('compositionstart', dispatchKeyEvent);
        // element.addEventListener('compositionend', dispatchKeyEvent);
        this.container.appendChild(element);

        // Receiver object.
        var receiver = {
            element: element,
            selectAll: function() {
                // Ensure there is selected content.
                if (!element.innerHTML) element.innerHTML = '&nbsp;';
                var range = document.createRange();
                var selection = window.getSelection();
                range.selectNodeContents(element);
                selection.removeAllRanges();
                selection.addRange(range);
                element.focus();
            },
            /**
             * @Desc: Add enable and disable methods to solve IME blocking issues in hotbox state.
             * @Editor: Naixor
             * @Date: 2015.09.14
             */
            enable: function() {
                element.setAttribute("contenteditable", true);
            },
            disable: function() {
                element.setAttribute("contenteditable", false);
            },
            /**
             * @Desc: Work around the Firefox caret loss bug for contenteditable divs.
             * @Editor: Naixor
             * @Date: 2015.10.15
             */
            fixFFCaretDisappeared: function() {
                element.removeAttribute("contenteditable");
                element.setAttribute("contenteditable", "true");
                element.blur();
                element.focus();
            },
            /**
             * Use this event instead of mouse events to detect receiver focus loss.
             * @editor Naixor
             * @Date 2015-12-2
             */
            onblur: function (handler) {
                element.onblur = handler;
            }
        };
        receiver.selectAll();

        minder.on('beforemousedown', receiver.selectAll);
        minder.on('receiverfocus', receiver.selectAll);
        minder.on('readonly', function() {
            // Disable minder event handling and remove the receiver and hotbox.
            minder.disable();
            editor.receiver.element.parentElement.removeChild(editor.receiver.element);
            editor.hotbox.$container.removeChild(editor.hotbox.$element);
        });

        // Listeners. Received events are dispatched to all listeners.
        var listeners = [];

        // Listen for events in a specific state. If no state is passed, listen in all states.
        receiver.listen = function(state, listener) {
            if (arguments.length == 1) {
                listener = state;
                state = '*';
            }
            listener.notifyState = state;
            listeners.push(listener);
        };

        function dispatchKeyEvent(e) {
            e.is = function(keyExpression) {
                var subs = keyExpression.split('|');
                for (var i = 0; i < subs.length; i++) {
                    if (key.is(this, subs[i])) return true;
                }
                return false;
            };
            var listener, jumpState;
            for (var i = 0; i < listeners.length; i++) {

                listener = listeners[i];
                // Ignore listeners that are not active in the current state.
                if (listener.notifyState != '*' && listener.notifyState != fsm.state()) {
                    continue;
                }

                /**
                 *
                 * Listeners have one allowed handling path: transition state.
                 * If a listener decides to transition, it returns the target state.
                 * Each event allows only one listener to perform a state transition.
                 * The listener performs the transition itself because it may need to pass a reason, then returns the result.
                 * Example:
                 *
                 * ```js
                 *  receiver.listen('normal', function(e) {
                 *      if (isSomeReasonForJumpState(e)) {
                 *          return fsm.jump('newstate', e);
                 *      }
                 *  });
                 * ```
                 */
                if (listener.call(null, e)) {
                    return;
                }
            }
        }

        this.receiver = receiver;
    }

    return module.exports = ReceiverRuntime;

});
