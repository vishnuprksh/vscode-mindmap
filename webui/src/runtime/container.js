/**
 * @fileOverview
 *
 * Initialize the editor container.
 *
 * @author: techird
 * @copyright: Baidu FEX, 2014
 */
define(function(require, exports, module) {

    /**
     * First runtime to execute. Initializes the editor container.
     */
    function ContainerRuntime() {
        var container;

	    if (typeof(this.selector) == 'string') {
		    container = document.querySelector(this.selector);
	    } else {
		    container = this.selector;
	    }

        if (!container) throw new Error('Invalid selector: ' + this.selector);

        // This class name applies editor styles.
        container.classList.add('km-editor');

        // Expose the container for other runtimes.
        this.container = container;
    }

    return module.exports = ContainerRuntime;
});
