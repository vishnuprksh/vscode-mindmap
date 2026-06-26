/**
 * @fileOverview
 *
 * Mind map example runtime.
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {
  var Minder = require('../minder');

  function MinderRuntime() {
    // Do not use kityminder key handling. ReceiverRuntime handles it all.
    var minder = new Minder({
      enableKeyReceiver: false,
      enableAnimation: true,
    });

    // Render and initialize.
    minder.renderTo(this.selector);
    minder.setTheme(null);
    minder.select(minder.getRoot(), true);
    minder.execCommand('text', 'MainTopic');

    // Export for other runtimes.
    this.minder = minder;
  }

  return (module.exports = MinderRuntime);
});
