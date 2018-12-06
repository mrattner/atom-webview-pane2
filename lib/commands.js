'use babel';

import {ATOM_URI_PREFIX} from './webpane-component';
import treeView from './treeview';
import {handlers as focusHandlers} from './focus-handlers';

/**
 * Handler for the Open command.
 * @param {Event} event The DOM event triggered by the command
 * @return {void}
 */
function openCommand(event) {
	event.stopPropagation();
	const target = event.currentTarget;
	let path;

	if (target.classList.contains('directory') ||
			target.classList.contains('file')) {
		const paths = treeView.selectedPaths();
		path = paths.length > 0 ? paths[0] : '';
	} else if (target.tagName.toLowerCase() === 'atom-text-editor') {
		const textEditor = atom.workspace.getActiveTextEditor();
		path = textEditor ? textEditor.getPath() : '';
	} else {
		path = '';
	}

    atom.workspace.open(ATOM_URI_PREFIX + path, {split: 'right'});
}

/**
 * Pick out the webpane on which the command is supposed to act.
 * @param {Event} event The DOM event triggered by the command
 * @return {Object} Command list of the targeted webpane
 */
function getWebviewCommands(event) {
	event.stopPropagation();
	return event.target.model.commands;
}

const sharedCommands = {
	'webview-pane2:open': {
		displayName: 'Open Web View',
		didDispatch: openCommand
	}
};

const webviewCommands = {
	'webview-pane2:toggle-auto-reload': {
		displayName: 'Toggle Auto Reload',
		didDispatch: (event) => getWebviewCommands(event).toggleAutoReload
	},
	'webview-pane2:toggle-toolbar': {
		displayName: 'Toggle Toolbar',
		didDispatch: (event) => getWebviewCommands(event).toggleToolbar
	},
	'webview-pane2:toggle-devtools': {
		displayName: 'Toggle Developer Tools',
		didDispatch: (event) => getWebviewCommands(event).toggleDevTools
	},
	'webview-pane2:refresh': {
		displayName: 'Reload Page',
		didDispatch: (event) => getWebviewCommands(event).refresh
	},
	'webview-pane2:stop': {
		displayName: 'Stop Loading Page',
		didDispatch: (event) => getWebviewCommands(event).stop
	},
	'webview-pane2:go': {
		displayName: 'Navigate',
		didDispatch: (event) => getWebviewCommands(event).go
	},
	'webview-pane2:back': {
		displayName: 'Go Back',
		didDispatch: (event) => getWebviewCommands(event).back
	},
	'webview-pane2:forward': {
		displayName: 'Go Forward',
		didDispatch: (event) => getWebviewCommands(event).forward
	}
};

export default {
	'atom-workspace': sharedCommands,
	'atom-text-editor': sharedCommands,
	'.tree-view .directory': sharedCommands,
	'.tree-view .file': sharedCommands,
    '.webview-pane2': webviewCommands,
	'.webview-pane2 nav': focusHandlers
};
