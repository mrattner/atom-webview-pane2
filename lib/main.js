'use babel';

import {Disposable, CompositeDisposable} from 'atom';
import {WebPaneComponent, ATOM_URI_PREFIX} from './webpane-component';
import configSchema from './config';
import commands from './commands';

export default {
    config: configSchema,
    subscriptions: null,

    /**
     * An Opener that can be added to the workspace.
     * @param {string} uri The URI of the item being opened
     * @return {WebPane} a webview to open, or null if the given URI is not for
     * a webview
     */
    webpaneOpener(uri) {
        if (uri.startsWith(ATOM_URI_PREFIX)) {
            return new WebPaneComponent({uri});
        }
        return null;
    },

    /**
     * Registered as a service consumer in package.json.
     * @param {TreeViewService} treeView Consumable service for tree-view
     * @return {Disposable} Subscription for a cleanup function that Atom will
     * invoke when the tree-view service stops
     */
    consumeTreeView(treeView) {
        treeView.instance = treeView;
        return new Disposable(() => {
            treeView.instance = null;
        });
    },

    /**
     * Setup for the package: invoked when an activation command is triggered.
     * @return {void}
     */
    activate() {
        this.subscriptions = new CompositeDisposable();
        this.subscriptions.add(atom.workspace.addOpener(this.webpaneOpener));

        // Keep references to the command subscriptions to dispose of them later
        Object.keys(commands).forEach(target => {
            this.subscriptions.add(
                atom.commands.add(target, commands[target])
            );
        });
    },

    /**
     * Teardown for the package: invoked when Atom is shut down or the package
     * is otherwise deactivated.
     * @return {void}
     */
    deactivate() {
        atom.workspace.getPaneItems().forEach(item => {
            if (item instanceof WebPaneComponent) {
                item.destroy();
            }
        });

        this.subscriptions.dispose();
    },

    /**
     * Registered as a view provider for WebPane objects in package.json.
     * @param {Object} model The object for which to provide a view
     * @return {HTMLElement} The view for the given model, or null if the given
     * model is not a WebPane
     */
    provideWebPaneView(model) {
        if (model instanceof WebPaneComponent) {
            return model.element;
        }
        return null;
    },

    /**
     * Registered as a deserializer for WebPaneComponents in package.json.
     * @param {Object} serializedState Serialized state of a WebPaneComponent
     * @return {WebPaneComponent} A new webpane restored to the given state
     */
    deserializeWebPane(serializedState) {
        return new WebPaneComponent(serializedState);
    }
};
