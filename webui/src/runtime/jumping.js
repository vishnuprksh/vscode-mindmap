/**
 * @fileOverview
 *
 * Control state machine transitions from key events.
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {

    var Hotbox = require('../hotbox');


    // Nice: http://unixpapa.com/js/key.html
    function isIntendToInput(e) {
        if (e.ctrlKey || e.metaKey || e.altKey) return false;

        // a-zA-Z
        if (e.keyCode >= 65 && e.keyCode <= 90) return true;

        // 0-9 and the symbols above them.
        if (e.keyCode >= 48 && e.keyCode <= 57) return true;
        
        // Numpad area, excluding Enter.
        if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

        // Numpad area, excluding Enter.
        // @yinheli from pull request
        if (e.keyCode != 108 && e.keyCode >= 96 && e.keyCode <= 111) return true;

        // IME.
        if (e.keyCode == 229 || e.keyCode === 0) return true;

        return false;
    }
    /**
     * @Desc: receiver.enable() and receiver.disable() below change the div contenteditable attribute
     *        to work around browser input that cannot be blocked after hotbox is enabled.
     *        On Windows Firefox, this requires blur then focus, but that loses the user's IME state,
     *        so Firefox is not handled here.
     * @Editor: Naixor
     * @Date: 2015.09.14
     */
    function JumpingRuntime() {
        var fsm = this.fsm;
        var minder = this.minder;
        var receiver = this.receiver;
        var container = this.container;
        var receiverElement = receiver.element;
        var hotbox = this.hotbox;
        var compositionLock = false;

        // normal -> *
        receiver.listen('normal', function(e) {
            // Keep the receiver enabled so the first typed character is not lost when entering edit mode.
            receiver.enable();
            // normal -> hotbox
            if (e.is('Space')) {
                e.preventDefault();
                // Safari leaves the Space character in the receiver when triggering hotbox, so clear it.
                if (kity.Browser.safari) {
                    receiverElement.innerHTML = '';
                }
                return fsm.jump('hotbox', 'space-trigger');
            }

            /**
             * check
             * @editor Naixor
             * @Date 2015-12-2
             */
            switch (e.type) {
                case 'keydown': {
                    if (minder.getSelectedNode()) {
                        if (isIntendToInput(e)) {
                            return fsm.jump('input', 'user-input');
                        };
                    } else {
                        receiverElement.innerHTML = '';
                    }
                    // normal -> normal shortcut
                    fsm.jump('normal', 'shortcut-handle', e);
                    break;
                }
                case 'keyup': {
                    break;
                }
                default: {}
            }
        });

        // hotbox -> normal
        receiver.listen('hotbox', function(e) {
            receiver.disable();
            e.preventDefault();
            var handleResult = hotbox.dispatch(e);
            if (hotbox.state() == Hotbox.STATE_IDLE && fsm.state() == 'hotbox') {
                return fsm.jump('normal', 'hotbox-idle');
            }
        });

        // input => normal
        receiver.listen('input', function(e) {
            receiver.enable();
            if (e.type == 'keydown') {
                if (e.is('Enter')) {
                    e.preventDefault();
                    return fsm.jump('normal', 'input-commit');
                }
                if (e.is('Esc')) {
                    e.preventDefault();
                    return fsm.jump('normal', 'input-cancel');
                }
                if (e.is('Tab') || e.is('Shift + Tab')) {
                    e.preventDefault();
                }
            } else if (e.type == 'keyup' && e.is('Esc')) {
                e.preventDefault();
                if (!compositionLock) {
                    return fsm.jump('normal', 'input-cancel');
                }
            }
            else if (e.type == 'compositionstart') {
                compositionLock = true;
            }
            else if (e.type == 'compositionend') {
                setTimeout(function () {
                    compositionLock = false;
                });
            }
        });

        //////////////////////////////////////////////
        /// Right click opens hotbox.
        /// Trigger only when mouse down and mouse up positions match.
        //////////////////////////////////////////////
        var downX, downY;
        var MOUSE_RB = 2; // Right button.

        container.addEventListener('mousedown', function(e) {
            if (e.button == MOUSE_RB) {
                e.preventDefault();
            }
            if (fsm.state() == 'hotbox') {
                hotbox.active(Hotbox.STATE_IDLE);
                fsm.jump('normal', 'blur');
            } else if (fsm.state() == 'normal' && e.button == MOUSE_RB) {
                downX = e.clientX;
                downY = e.clientY;
            }
        }, false);

        container.addEventListener('mousewheel', function(e) {
            if (fsm.state() == 'hotbox') {
                hotbox.active(Hotbox.STATE_IDLE);
                fsm.jump('normal', 'mousemove-blur');
            }
        }, false);

        container.addEventListener('contextmenu', function(e) {
            e.preventDefault();
        });

        container.addEventListener('mouseup', function(e) {
            if (fsm.state() != 'normal') {
                return;
            }
            if (e.button != MOUSE_RB || e.clientX != downX || e.clientY != downY) {
                return;
            }
            if (!minder.getSelectedNode()) {
                return;
            }
            fsm.jump('hotbox', 'content-menu');
        }, false);

        // Prevent hotbox events from bubbling and closing hotbox before actions run.
        hotbox.$element.addEventListener('mousedown', function(e) {
            e.stopPropagation();
        });
    }

    return module.exports = JumpingRuntime;
});
