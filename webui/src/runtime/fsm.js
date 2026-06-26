/**
 * @fileOverview
 *
 * Editor state machine.
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {

    var Debug = require('../tool/debug');
    var debug = new Debug('fsm');

    function handlerConditionMatch(condition, when, exit, enter) {
        if (condition.when != when) return false;
        if (condition.enter != '*' && condition.enter != enter) return false;
        if (condition.exit != '*' && condition.exit != exit) return;
        return true;
    }

    function FSM(defaultState) {
        var currentState = defaultState;
        var BEFORE_ARROW = ' - ';
        var AFTER_ARROW = ' -> ';
        var handlers = [];

        /**
         * State transition.
         *
         * Notify all state transition watchers.
         *
         * @param  {string} newState  New state name.
         * @param  {any} reason Transition reason. It can be passed to transition watchers.
         */
        this.jump = function(newState, reason) {
            if (!reason) throw new Error('Please tell fsm the reason to jump');

            var oldState = currentState;
            var notify = [oldState, newState].concat([].slice.call(arguments, 1));
            var i, handler;

            // Before transition.
            for (i = 0; i < handlers.length; i++) {
                handler = handlers[i];
                if (handlerConditionMatch(handler.condition, 'before', oldState, newState)) {
                    if (handler.apply(null, notify)) return;
                }
            }

            currentState = newState;
            debug.log('[{0}] {1} -> {2}', reason, oldState, newState);

            // After transition.
            for (i = 0; i < handlers.length; i++) {
                handler = handlers[i];
                if (handlerConditionMatch(handler.condition, 'after', oldState, newState)) {
                    handler.apply(null, notify);
                }
            }
            return currentState;
        };

        /**
         * Return the current state.
         * @return {string}
         */
        this.state = function() {
            return currentState;
        };

        /**
         * Add a state transition watcher.
         * 
         * @param {string} condition
         *     Watch timing.
         *         "* => *" (default)
         *
         * @param  {Function} handler
         *     Watch function. It receives three arguments during transitions:
         *         * from - State before transition.
         *         * to - State after transition.
         *         * reason - Transition reason.
         */
        this.when = function(condition, handler) {
            if (arguments.length == 1) {
                handler = condition;
                condition = '* -> *';
            }

            var when, resolved, exit, enter;

            resolved = condition.split(BEFORE_ARROW);
            if (resolved.length == 2) {
                when = 'before';
            } else {
                resolved = condition.split(AFTER_ARROW);
                if (resolved.length == 2) {
                    when = 'after';
                }
            }
            if (!when) throw new Error('Illegal fsm condition: ' + condition);

            exit = resolved[0];
            enter = resolved[1];

            handler.condition = {
                when: when,
                exit: exit,
                enter: enter
            };

            handlers.push(handler);
        };
    }

    function FSMRumtime() {
        this.fsm = new FSM('normal');
    }

    return module.exports = FSMRumtime;
});
