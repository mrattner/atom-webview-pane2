'use babel';

import {nth} from '../lib/focus-handlers';
import {ToolbarComponent} from '../lib/toolbar-component';
import {enableFocusExpectations} from './spec-helper';

describe('focus handlers', () => {
	describe('nth', () => {
		const list = ['zero', 'one', 'two', 'three', 'four', 'five'];

		it('can be called without n', () => {
			expect(nth(list)).toBe('zero');
		});

		it('works with array indices within bounds', () => {
			expect(nth(list, 0)).toBe('zero');
			expect(nth(list, 1)).toBe('one');
			expect(nth(list, 2)).toBe('two');
			expect(nth(list, 3)).toBe('three');
			expect(nth(list, 4)).toBe('four');
			expect(nth(list, 5)).toBe('five');
		});

		it('works with negative indices within bounds', () => {
			expect(nth(list, -1)).toBe('five');
			expect(nth(list, -2)).toBe('four');
			expect(nth(list, -3)).toBe('three');
			expect(nth(list, -4)).toBe('two');
			expect(nth(list, -5)).toBe('one');
			expect(nth(list, -6)).toBe('zero');
		});

		it('works with positive indices out of bounds', () => {
			expect(nth(list, 6)).toBe('zero');
			expect(nth(list, 7)).toBe('one');
			expect(nth(list, 8)).toBe('two');
			expect(nth(list, 9)).toBe('three');
			expect(nth(list, 10)).toBe('four');
			expect(nth(list, 11)).toBe('five');
		});

		it('works with negative indices out of bounds', () => {
			expect(nth(list, -7)).toBe('five');
			expect(nth(list, -8)).toBe('four');
			expect(nth(list, -9)).toBe('three');
			expect(nth(list, -10)).toBe('two');
			expect(nth(list, -11)).toBe('one');
			expect(nth(list, -12)).toBe('zero');
		});
	});

	describe('integration with atom commands', () => {
		const actions = jasmine.createSpyObj('commands', ['back', 'forward',
			'go', 'stop', 'refresh', 'toggleDevTools', 'toggleAutoReload']);
		const toolbar = new ToolbarComponent({actions});
		const inputs = Array.from(
			toolbar.element.querySelectorAll('button, input')
		);
		const [backButton, stopRefreshButton, forwardButton, urlInput,
			devToolsButton, autoReloadButton] = inputs;
		let activationPromise, cleanupFunction;

		function resetToolbarFocus() {
			Object.values(actions).forEach((spy) => {
				spy.calls.reset();
			});
			document.getElementById('dummy').focus();
			expect(toolbar.element).withContext('reset').not.toBeFocused();
		}

		beforeAll(() => {
			cleanupFunction = enableFocusExpectations(toolbar.element);
		});

		beforeEach(() => {
			jasmine.attachToDOM(toolbar.element);
			jasmine.attachToDOM(atom.views.getView(atom.workspace));
			const dummyInput = document.createElement('input');
			dummyInput.type = 'text';
			dummyInput.value = 'I do nothing!';
			dummyInput.id = 'dummy';
			jasmine.attachToDOM(dummyInput);
			activationPromise = atom.packages.activatePackage('webview-pane2');
		});

		afterAll(() => {
			(cleanupFunction)();
		});

		describe('core:confirm command', () => {
			beforeEach(async() => {
				const workspaceElement = atom.views.getView(atom.workspace);
				atom.commands.dispatch(workspaceElement, 'webview-pane2:open');
				await activationPromise;
			});

			it('does nothing if no inputs are focused', () => {
				resetToolbarFocus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				Object.values(actions).forEach((spy) => {
					expect(spy).not.toHaveBeenCalled();
				});
			});

			it('invokes Back', async () => {
				await toolbar.update({canGoBack: true});
				backButton.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.back).toHaveBeenCalledTimes(1);
			});

			it('invokes Forward', async () => {
				await toolbar.update({canGoForward: true});
				forwardButton.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.forward).toHaveBeenCalledTimes(1);
			});

			it('invokes Go', () => {
				urlInput.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.go).toHaveBeenCalledTimes(1);
			});

			it('invokes Refresh', async () => {
				await toolbar.update({isLoading: false});
				stopRefreshButton.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.refresh).toHaveBeenCalledTimes(1);
			});

			it('invokes Stop', async () => {
				await toolbar.update({isLoading: true});
				stopRefreshButton.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.stop).toHaveBeenCalledTimes(1);
			});

			it('invokes Toggle Auto Reload', () => {
				autoReloadButton.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.toggleAutoReload).toHaveBeenCalledTimes(1);
			});

			it('invokes Toggle Dev Tools', () => {
				devToolsButton.focus();
				atom.commands.dispatch(toolbar.element, 'core:confirm');
				expect(actions.toggleDevTools).toHaveBeenCalledTimes(1);
			});
		});

		describe('focus/tab order', () => {
			describe('when some buttons are disabled', () => {
				let activeInputs;

				beforeEach(async () => {
					const workspaceElement = atom.views.getView(atom.workspace);
					atom.commands.dispatch(workspaceElement, 'webview-pane2:open');
					await activationPromise;
					await toolbar.update({
						canGoBack: false,
						canGoForward: false});
					resetToolbarFocus();
					activeInputs = inputs.filter((element) => {
						return !element.matches(':disabled');
					});
				});

				it('focuses the next active input', () => {
					atom.commands.dispatch(toolbar.element,
						'core:focus-next');
					expect(activeInputs[0]).toBeFocused();

					activeInputs.forEach((input, index) => {
						atom.commands.dispatch(toolbar.element,
							'core:focus-next');
						expect(input).toLoseFocusTo(
							nth(activeInputs, index + 1));
					});
				});

				it('focuses the previous active input', () => {
					atom.commands.dispatch(toolbar.element,
						'core:focus-previous');
					expect(activeInputs[activeInputs.length - 1]).toBeFocused();

					activeInputs.forEach((input, index) => {
						atom.commands.dispatch(toolbar.element,
							'core:focus-previous');
						expect(input).toLoseFocusTo(nth(activeInputs, index - 1));
					});
				});
			});

			describe('when no buttons are disabled', () => {
				beforeEach(async () => {
					const workspaceElement = atom.views.getView(atom.workspace);
					atom.commands.dispatch(workspaceElement, 'webview-pane2:open');
					await activationPromise;
					await toolbar.update({
						canGoBack: true,
						canGoForward: true});
					resetToolbarFocus();
				});

				it('focuses the next input', () => {
					atom.commands.dispatch(toolbar.element, 'core:focus-next');
					expect(inputs[0]).toBeFocused();

					inputs.forEach((input, index) => {
						atom.commands.dispatch(toolbar.element,
							'core:focus-next');
						expect(input).toLoseFocusTo(nth(inputs, index + 1));
					});
				});

				it('focuses the previous input', () => {
					atom.commands.dispatch(toolbar.element,
						'core:focus-previous');
					expect(inputs[inputs.length - 1]).toBeFocused();

					inputs.forEach((input, index) => {
						atom.commands.dispatch(toolbar.element,
							'core:focus-previous');
						expect(input).toLoseFocusTo(nth(inputs, index - 1));
					});
				});
			});
		});
	});
});
