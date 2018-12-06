'use babel';

import {ToolbarComponent} from '../lib/toolbar-component';

describe('toolbar component', () => {
	describe('inputs', () => {
		const actions = jasmine.createSpyObj('commands', ['back', 'forward', 'go',
			'stop', 'refresh', 'toggleDevTools', 'toggleAutoReload']);
		const toolbar = new ToolbarComponent({actions});
		const inputs = Array.from(
			toolbar.element.querySelectorAll('button, input')
		);
		const [backButton, stopRefreshButton, forwardButton, urlInput,
			devToolsButton, autoReloadButton] = inputs;

		beforeEach(() => {
			Object.values(actions).forEach((spy) => {
				spy.calls.reset();
			});
			jasmine.attachToDOM(toolbar.element);
		});

		describe('back button', () => {
			it('invokes Back when can go back', async () => {
				await toolbar.update({canGoBack: true});
				backButton.click();
				expect(actions.back).toHaveBeenCalledTimes(1);
			});

			it('is disabled when cannot go back', async () => {
				await toolbar.update({canGoBack: false});
				expect(backButton).toBeDisabled();
			});
		});

		describe('forward button', () => {
			it('invokes Forward when can go forward', async () => {
				await toolbar.update({canGoForward: true});
				forwardButton.click();
				expect(actions.forward).toHaveBeenCalledTimes(1);
			});
			it('is disabled when cannot go forward', async () => {
				await toolbar.update({canGoForward: false});
				expect(forwardButton).toBeDisabled();
			});
		});

		describe('refresh/stop button', () => {
			it('invokes Stop when loading', async () => {
				await toolbar.update({isLoading: true});
				stopRefreshButton.click();
				expect(actions.stop).toHaveBeenCalledTimes(1);
			});

			it('invokes Refresh when not loading', async () => {
				await toolbar.update({isLoading: false});
				stopRefreshButton.click();
				expect(actions.refresh).toHaveBeenCalledTimes(1);
			});
		});

		describe('url textbox', () => {
			it('invokes Go', () => {
				// Note that calling submit() does NOT trigger onsubmit handler,
				// so we need to construct an event object to dispatch.
				const submitEvent = new Event('submit');
				urlInput.form.dispatchEvent(submitEvent);
				expect(actions.go).toHaveBeenCalledTimes(1);
			});
		});

		describe('auto reload button', () => {
			it('invokes Toggle Auto Reload', () => {
				autoReloadButton.click();
				expect(actions.toggleAutoReload).toHaveBeenCalledTimes(1);
			});

			it('is selected when auto reloading', async () => {
				await toolbar.update({isAutoReloading: true});
				expect(autoReloadButton).toHaveClass('selected');
			});

			it('is not selected when not auto reloading', async () => {
				await toolbar.update({isAutoReloading: false});
				expect(autoReloadButton).not.toHaveClass('selected');
			});
		});

		describe('dev tools button', () => {
			it('invokes Toggle Dev Tools', () => {
				devToolsButton.click();
				expect(actions.toggleDevTools).toHaveBeenCalledTimes(1);
			});

			it('is selected when dev tools are open', async () => {
				await toolbar.update({isDevToolsOpened: true});
				expect(devToolsButton).toHaveClass('selected');
			});

			it('is not selected when dev tools are closed', async () => {
				await toolbar.update({isDevToolsOpened: false});
				expect(devToolsButton).not.toHaveClass('selected');
			});
		});
	});
});
