'use babel';
/** @jsx Etch.dom */

import Etch from 'etch';
import Path from 'path';
import urlFromFile from 'file-url';
// ToolbarComponent is being used as a JSX tag name.
// eslint-disable-next-line no-unused-vars
import {ToolbarComponent} from './toolbar-component';
import {WebviewComponent} from './webview-component';

const ATOM_URI_PREFIX = 'atom://webview-pane2/';

/**
 * Given a file or directory location, determine the corresponding web URL
 * to open.
 * @param {string} filePath An absolute filepath
 * @return {string} URL for the filePath according to the package settings
 */
function locationFromFilepath(filePath) {
    const template = atom.config.get('webview-pane2.urlTemplate').trim();

    if (filePath === '' || template === '') {
        const homepage = atom.config.get('webview-pane2.homepage').trim();
        return homepage !== '' ? homepage : 'about:blank';
    }

    const pathComponents = Path.parse(filePath);
    const templateVars = {
        '{full_path}': pathComponents.dir,
        '{name_with_ext}': pathComponents.base,
        '{name_no_ext}': pathComponents.name
    };
    const regex = new RegExp(Object.keys(templateVars).join('|'), 'g');
    const mappedUrl = template.replace(regex, (match) => {
        return templateVars[match];
    });

    return mappedUrl.startsWith('file://')
        ? urlFromFile(Path.normalize(mappedUrl.replace('file://', '')))
            .toString()
        : mappedUrl;
}

/**
 * Pane item for displaying a webview at a certain location.
 */
class WebPaneComponent {
    defaultDock: 'center';

    /**
     * Available commands that can be dispatched to the component.
     */
    get commands() {
        return {
            // TODO Implement auto-reloading
            toggleAutoReload: () => {
                this.update({autoReload: !this.state.autoReload});
            },
            toggleToolbar: () => {
                this.update({hideToolbar: !this.state.hideToolbar});
            },
            toggleDevTools: () => {
                this.update({showDevTools: !this.state.showDevTools});
            },
            go: () => {
                const {urlInput} = this.refs.toolbar;
                if (urlInput.value === this.state.location) {
                    this.webview.reload();
                } else if (urlInput.form.reportValidity()) {
                    this.update({location: urlInput.value});
                } else {
                    urlInput.select();
                }
            },
            refresh: () => {
                this.update();
                this.webview.reload();
            },
            stop: this.webview.stopNavigation,
            back: this.webview.navigateBack,
            forward: this.webview.navigateForward
        };
    }

    /**
     * @param {string} uri Atom URI of this pane item
     * @param {string} title Title of the pane item
     * @param {string} location URL to load in the webview
     * @param {boolean} autoReload Whether to auto-refresh this webview
     * @param {boolean} hideToolbar Whether to hide the webview controls
     * @param {boolean} showDevTools Whether to show the webview developer tools
     * @param {int} autoReloadWait How many milliseconds to delay before refresh
     */
    constructor({
        uri = ATOM_URI_PREFIX,
        title = 'Webview',
        location = locationFromFilepath(uri.replace(ATOM_URI_PREFIX, '')),
        autoReload = atom.config.get('webview-pane2.autoReload'),
        hideToolbar = atom.config.get('webview-pane2.hideToolbar'),
        showDevTools = atom.config.get('webview-pane2.showDevTools'),
        autoReloadWait = atom.config.get('webview-pane2.autoReloadWait')
    }) {
        Object.assign(this, {
            state: {
                title,
                location,
                autoReload,
                hideToolbar,
                showDevTools,
                autoReloadWait
            },
            uri,
            webview: new WebviewComponent({
                location,
                showDevTools
            })
        });
        Etch.initialize(this);
    }

    /**
     * Only save certain properties of this object during serialization.
     * @return {WebPane} Serialized representation of the WebPane
     */
    serialize() {
        return this.state;
    }

    /**
     * Required for this object to be a Pane Item.
     * @return {string} Title of this pane item
     */
    getTitle() {
		return this.state.title;
	}

    /**
     * Required to make this object Openable.
     * @return {string} URI of this pane item
     */
	getURI() {
		return this.uri;
	}

    /**
     * Optional: specify the dock of the pane item if the user hasn't moved
     * it to a different dock.
     * @return {string} Valid values are "left", "right", "bottom", or "center"
     */
    getDefaultLocation() {
        return this.defaultDock;
    }

    /**
     * Renders the Etch component.
     * @returns {HTMLElement} A virtual DOM tree
     */
    render() {
    	return (
            <div class="webview-pane2 native-key-bindings"
                    on={{
                        'did-finish-load': this.update,
                        'did-fail-load': this.update,
                        'did-navigate'(navigationEvent) {
                            this.update({location: navigationEvent.url});
                        },
                        'page-title-updated'(titleUpdateEvent) {
                            this.state.title = titleUpdateEvent.explicitSet
                                ? titleUpdateEvent.title
                                : 'Web View';
                        }
                    }}>
                <ToolbarComponent
                    style={`visibility: ${this.state.hideToolbar ? 'hidden'
                        : 'visible'}`}
                    ref="toolbar"
                    urlText={this.state.location}
                    canGoBack={this.webview.hasPreviousPage}
                    canGoForward={this.webview.hasNextPage}
                    isLoading={this.webview.loading}
                    isDevToolsOpened={this.webview.hasDevToolsOpen}
                    actions={this.commands}
                />
                {this.webview /*TODO: Does webview update itself or do we
                    need to explicitly invoke webview.update(new state)? */}
            </div>
        );
	}

	/**
     * Call this async method whenever the state changes in a way that will
     * affect the results of the render() method.
     * @param {Object} newState Updated state
     * @return {Promise} Resolved when this component has re-rendered
     */
	update(newState) {
        Object.assign(this.state, newState);
		return Etch.update(this);
	}

    /**
     * Destroy this pane item; invoked when closing its tab.
     * @return {void}
     */
	async destroy() {
        await Etch.destroy(this);
	}
}

export default {
    ATOM_URI_PREFIX,
    locationFromFilepath,
    WebPaneComponent
};
