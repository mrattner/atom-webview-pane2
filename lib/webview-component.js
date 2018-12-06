'use babel';

/**
 * Wrapper component for the Electron <webview> element.
 */
class WebviewComponent {
	/**
	 * @param {string} location Initial URL to display in the webview
	 */
	constructor({location}) {
		const element = document.createElement('webview');
		const load = () => {
			element.removeEventListener('dom-ready', load);
			element.src = location;
		};
		element.addEventListener('dom-ready', load);
		this.element = element;
	}

	/**
	 * @return {boolean} True if a page load is currently in progress
	 */
	get loading() {
		if (!this.element.getWebContents()) {
			return true;
		}
		return this.element.isLoading() || this.element.isWaitingForResponse();
	}

	/**
	 * @return {boolean} True if there is at least 1 previous page in history
	 */
	get hasPreviousPage() {
		if (!this.element.getWebContents()) {
			return false;
		}
		return this.element.canGoBack();
	}

	/**
	 * @return {boolean} True if there is at least 1 next page in history
	 */
	get hasNextPage() {
		if (!this.element.getWebContents()) {
			return false;
		}
		return this.element.canGoForward();
	}

	/**
	 * @return {boolean} True if the webview's developer tools are open
	 */
	get hasDevToolsOpen() {
		if (!this.element.getWebContents()) {
			return false;
		}
		return this.element.isDevToolsOpened();
	}

	/**
	 * Refresh the webview.
	 * @return {void}
	 */
	reload() {
		if (!this.element.getWebContents()) {
			return;
		}
		this.element.reloadIgnoringCache();
	}

	/**
	 * Stop loading the webview.
	 * @return {void}
	 */
	stopNavigation() {
		if (!this.element.getWebContents()) {
			return;
		}
		this.element.stop();
	}

	/**
	 * Go backward in history.
	 * @return {void}
	 */
	navigateBack() {
		if (!this.element.getWebContents()) {
			return;
		}
		this.element.goBack();
	}

	/**
	 * Go forward in history.
	 * @return {void}
	 */
	navigateForward() {
		if (!this.element.getWebContents()) {
			return;
		}
		this.element.goForward();
	}

	/**
	 * Invoked by Etch when properties change that affect the way the webview
	 * component should display itself.
	 * @param {string} location URL that the webview should navigate to
	 * @param {boolean} showDevTools Whether the developer tools should be open
	 * @return {void}
	 */
	update({location, showDevTools}) {
		if (location) {
			this.element.loadURL(location);
		}

		if (showDevTools && !this.hasDevToolsOpen) {
			this.element.openDevTools();
		} else if (!showDevTools && this.hasDevToolsOpen) {
			this.element.closeDevTools();
		}
	}

	/**
	 * Cleanup that should happen before Etch removes this component from the
	 * DOM.
	 * @return {void}
	 */
	destroy() {
		this.stopNavigation();
	}
}

export default {
	WebviewComponent
};
