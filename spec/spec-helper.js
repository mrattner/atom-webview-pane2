'use babel';

/**
 * Asserts that the given object is an HTML element.
 * @param {any} target Object that should be an HTML element
 * @return {Boolean} False if assertion fails
 */
function isHtmlElement(target) {
	return target && target.outerHTML;
}

/**
 * Manages listeners for focus and blur events within a given element.
 */
class FocusExpectations {
	listeners = jasmine.createSpyObj('listeners', ['focus', 'blur']);
	count = { focus: 0, blur: 0 };

	/**
	 * Cleanup function to remove focus listeners on the element.
	 * @return {void}
	 */
	destroy() {
		this.element.removeEventListener('focusin', this.listeners.focus);
		this.element.removeEventListener('focusout', this.listeners.blur);
	}

	/**
	 * @param {HTMLElement} element Element to listen for focus events on
	 */
	constructor(element) {
		this.element = element;
		this.element.addEventListener('focusin', this.listeners.focus);
		this.element.addEventListener('focusout', this.listeners.blur);
	}

	/**
	 * Asserts that the listener for the given event was called the expected
	 * number of times.
	 * @param {string} eventName focus or blur
	 * @param {int} expectedCount The listener should have been called at
	 *	least this number of additional times since the last invocation
	 * @return {Boolean} False if assertion fails
	 */
	numberOfCalls(eventName, expectedCount = 0) {
		if (expectedCount > 0) {
			this.count[eventName] = this.count[eventName] + expectedCount;
		}
		const actualCount = this.listeners[eventName].calls.count();

		return (actualCount >= this.count[eventName]);
	}

	/**
	 * Matches against the most recent target of the specified event.
	 * @param {string} eventName focus or blur
	 * @param {HTMLElement} expectedTarget The HTML element that should have
	 *	been focused or blurred
	 * @param {Function} comparator Equality comparison function
	 * @return {Boolean} False if assertion fails
	 */
	mostRecentTarget(eventName, expectedTarget, comparator) {
		if (!expectedTarget || !expectedTarget.outerHTML) {
			const message = `${expectedTarget} is not an HTMLElement`;
			throw new TypeError(message);
		}
		const mostRecentCall = this.listeners[eventName].calls.mostRecent();
		if (!mostRecentCall) {
			return false;
		}
		const actualTarget = mostRecentCall.args.target;
		return (comparator(expectedTarget, actualTarget));
	}
}

/**
 * Watches an element for focus events, and provides custom matchers
 * for testing focus within the element's subtree.
 * @param {HTMLElement} element Root element on which to watch for focus
 *	events
 * @return {Function} Cleanup function that can be invoked to remove the
 *	focus event listeners from the element
 */
function enableFocusExpectations(element) {
	const expect = new FocusExpectations(element);

	/**
	 * Jasmine custom matcher function that expects a child element to
	 *	have received focus.
	 * @param {Object} util Jasmine's matchersUtil passed to custom matchers
	 * @param {Object} customEqualityTesters Additional equality testers
	 *	registered with Jasmine
	 * @return {Object} Comparison matcher
	 */
	function toBeFocused(util, customEqualityTesters) {
		const compare = (expected, actual) => {
			return util.equals(expected, actual, customEqualityTesters);
		};

		return {
			compare(actual) {
				return {
					pass: isHtmlElement(actual)
						&& expect.numberOfCalls('focus', 1)
						&& expect.mostRecentTarget('focus', actual, compare),
					message: `Expected ${actual.outerHTML} to be focused.`
				};
			},
			negativeCompare(actual) {
				return {
					pass: isHtmlElement(actual)
						&& !expect.mostRecentTarget('focus', actual, compare),
					message: `Expected ${actual.outerHTML} not to be focused.`
				};
			}
		};
	}

	/**
	 * Jasmine custom matcher function that expects one child element to
	 *	have lost focus and another to have received focus.
	 * @param {Object} util Jasmine's matchersUtil passed to custom matchers
	 * @param {Object} customEqualityTesters Additional equality testers
	 *	registered with Jasmine
	 * @return {Object} Comparison matcher
	 */
	function toLoseFocusTo(util, customEqualityTesters) {
		const comparator = (expected, actual) => {
			return util.equals(expected, actual, customEqualityTesters);
		};

		return {
			compare(actual, expected) {
				return {
					pass: isHtmlElement(actual)
						&& expect.numberOfCalls('focus', 1)
						&& expect.mostRecentTarget('focus', expected, comparator)
						&& expect.numberOfCalls('blur', 1)
						&& expect.mostRecentTarget('blur', actual, comparator),
					message: `Expected ${actual.outerHTML} to lose focus to
						${expected.outerHTML}.`
				};
			},
			negativeCompare(actual, expected) {
				return {
					pass: isHtmlElement(actual)
						&& (!expect.mostRecentTarget('focus', expected, comparator)
						|| !expect.mostRecentTarget('blur', actual, comparator)),
					message: `Expected ${actual.outerHTML} not to lose focus
						to ${expected.outerHTML}.`
				};
			}
		};
	}

	jasmine.addMatchers({toBeFocused, toLoseFocusTo});
	return () => {
		expect.destroy();
	};
}

export default {
	enableFocusExpectations
};
