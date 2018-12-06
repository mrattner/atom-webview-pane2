'use babel';

export default {
	/**
	 * Enables or disables the selectedPaths function.
	 * @param {TreeViewService} treeViewInstance The tree-view service provider,
	 * or null to remove reliance on a service provider
	 */
	set instance(treeViewInstance) {
		this.selectedPaths = treeViewInstance
			? () => { return treeViewInstance.selectedPaths(); }
			: () => { return []; };
	},

	selectedPaths: () => { return []; }
};
