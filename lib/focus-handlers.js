'use babel';

/**
 * Get the item at an array index. Negative numbers will count from the end of
 * the array instead of the beginning. Also works for indices that are out of
 * bounds of the array; the array is treated as a circular array.
 * @param {Array} collection List to get nth element from
 * @param {int} n Index to retrieve; negative index will count from the end
 * @return {any} The nth item in the collection, treating collection as a ring
 */
function nth(collection, n = 0) {
	const modulo = n - collection.length * Math.floor(n / collection.length);
	return collection[modulo];
}

/**
 * Retrieves all child elements that are currently able to receive focus,
 * and which one of these (if any) is currently focused.
 * @param {HTMLElement} element Node to query for focusable inputs
 * @return {Object} inputs: array of focusable inputs; activeIndex: index of
 * 	the currently focused element, or -1 if none of them are focused
 */
function getFocusableInputs(element) {
	const focusableInputs = Array.from(element.querySelectorAll(
		'input, button:not(:disabled)'));
	return {
		inputs: focusableInputs,
		activeIndex: focusableInputs.findIndex((input) => {
			return input.matches(':focus');
		})
	};
}

const handlers = {
	'core:focus-next': (event) => {
		event.stopPropagation();
		const {inputs, activeIndex} = getFocusableInputs(event.target);
		if (activeIndex === -1) {
			inputs[0].focus();
		} else {
			nth(inputs, activeIndex + 1).focus();
		}
	},
	'core:focus-previous': (event) => {
		event.stopPropagation();
		const {inputs, activeIndex} = getFocusableInputs(event.target);
		if (activeIndex === -1) {
			inputs[0].focus();
		} else {
			nth(inputs, activeIndex - 1).focus();
		}
	},
	'core:confirm': (event) => {
		event.stopPropagation();
		const {inputs, activeIndex} = getFocusableInputs(event.target);
		if (activeIndex === -1) {
			return;
		}
		const currentInput = inputs[activeIndex];
		if (typeof currentInput.onclick === 'function') {
			currentInput.onclick();
		} else if (currentInput.form && typeof currentInput.form.onsubmit
				=== 'function') {
			currentInput.form.onsubmit();
		}
	}
};

export default {
	handlers,
	nth
};
