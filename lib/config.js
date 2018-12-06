'use babel';

export default {
	homepage: {
		order: 1,
		title: 'Homepage',
		description: `The address that a new webview pane will load if no URL
			mapping applies, or if URL mapping is disabled.`,
		type: 'string',
		default: 'about:blank'
	},

	urlTemplate: {
		order: 2,
		title: 'File-to-URL Mapping Template',
		description: `The URL that a new webview pane will load if opened from a
			file or directory in the Atom workspace. (See the package README for
			examples.) Leave blank to disable URL mapping.`,
		type: 'string',
		default: `file://{full_path}/{name_with_ext}`
	},

	autoReloadWait: {
		order: 3,
		title: 'Auto Reload Delay',
		description: `How many milliseconds to wait in between save and
			auto-refreshing the webview, when auto-reload is turned on.`,
		type: `integer`,
		default: 0,
		minimum: 0,
		maximum: 2000
	},

	hideToolbar: {
		order: 4,
		title: 'Open New Panes with Address/Toolbar Hidden',
		type: 'boolean',
		default: false
	},

	showDevTools: {
		order: 5,
		title: 'Open New Panes with Developer Tools Shown',
		type: 'boolean',
		default: false
	},

	autoReload: {
		order: 6,
		title: 'Open New Panes with Auto-Refresh On',
		type: 'boolean',
		default: false
	}
};
