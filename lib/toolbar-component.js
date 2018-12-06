'use babel';
/** @jsx Etch.dom */

import Etch from 'etch';

/**
 * Browser toolbar that allows user to control a webview.
 */
class ToolbarComponent {
	state = {
		urlText: '',
		canGoBack: false,
		canGoForward: false,
		isLoading: true,
		isDevToolsOpened: false,
		isAutoReloading: false
	};

	/**
	 * Contents of the URL text box
	 */
	get urlInput() {
		return this.refs.url;
	}

	/**
	 * @param {string} urlText Initial contents of the URL bar
	 * @param {Object} actions Map of commands that will be assigned to toolbar
	 *	input elements
	 */
	constructor({
		urlText,
		actions
	}) {
		this.actions = actions;
		this.state.urlText = urlText;
		Etch.initialize(this);
	}

	/**
	 * Required for Etch components. Invoke whenever the state of the component
	 * changes in a way that could affect the results of render().
	 * @param {Object} newState Changed properties and their new values
	 * @return {Promise} Resolved when update has completed
	 */
	update(newState) {
		Object.assign(this.state, newState);
		return Etch.update(this);
	}

	/**
	 * Required for Etch components. Invoked by Etch.update and Etch.initialize.
	 * @return {HTMLElement} Virtual DOM tree for the component. This value is
	 *	automatically assigned to the component's 'element' property.
	 */
	render() {
		return (
			<nav>
				<button type="button" class="btn icon icon-arrow-left"
						onclick={this.actions.back}
						disabled={!this.state.canGoBack}>
					Back
				</button>
				<button type="button" class={`btn icon
						${this.state.isLoading ? 'icon-x' : 'icon-sync'}`}
						onclick={this.state.isLoading ? this.actions.stop
							: this.actions.refresh}>
					{this.state.isLoading ? 'Stop' : 'Refresh'}
				</button>
				<button type="button" class="btn icon icon-arrow-right"
						onclick={this.actions.forward}
						disabled={!this.state.canGoForward}>
					Forward
				</button>
				<form class="icon-input" onsubmit={this.actions.go}>
					<i class="icon icon-globe text-subtle"></i>
					<input type="search" value={this.state.urlText} ref="url"
						class="input-search" placeholder="Enter address">
					</input>
				</form>
				<button type="button" class={`btn icon icon-gear
						${this.state.isDevToolsOpened ? 'selected' : ''}`}
						onclick={this.actions.toggleDevTools}>
					Dev Tools
				</button>
				<button type="button" class={`btn icon icon-zap
						${this.state.isAutoReloading ? 'selected' : ''}`}
						onclick={this.actions.toggleAutoReload}>
					Auto Reload
				</button>
			</nav>
		);
	}

	/**
	 * Optional teardown for the component; invoked when the parent component
	 * is destroyed or when this component is removed from the DOM.
	 * @return {void}
	 */
	async destroy() {
		await Etch.destroy(this);
	}
}

export default {
	ToolbarComponent
};
