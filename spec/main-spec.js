'use babel';

import {WebPaneComponent, ATOM_URI_PREFIX} from '../lib/webpane-component';
import treeView from '../lib/treeview';
/**
 * Tests the package's commands, config, and interaction with Atom environment.
 */
describe('main', () => {
    let workspaceElement, activationPromise;
    const OPEN_COMMAND = 'webview-pane2:open';

    function openWebviewItems() {
        const paneItems = atom.workspace.getPaneItems();
        return paneItems.filter(item => {
            return item instanceof WebPaneComponent;
        });
    }

    function getOnlyExpectedWebView() {
        const [webview, ...rest] = openWebviewItems();
        expect(rest.length).toBe(0);
        expect(webview).toBeDefined();
        return webview;
    }

    beforeEach(() => {
        workspaceElement = atom.views.getView(atom.workspace);
        jasmine.attachToDOM(workspaceElement);
        activationPromise = atom.packages.activatePackage('webview-pane2');
        expect(openWebviewItems().length).toBe(0);
    });

    describe('when open command is triggered on workspace element', () => {
        it('opens a webview in a new pane with default URI', async () => {
            atom.commands.dispatch(workspaceElement, OPEN_COMMAND);
            await activationPromise;
            expect(openWebviewItems().length).toBe(1);
            const pane = atom.workspace.paneForURI(ATOM_URI_PREFIX);
            expect(pane.isActive()).toBe(true);
        });
    });

    describe('when open command is triggered on editor element', () => {
        const EDITOR_PATH = '/home/test/editor.html';

        it('sets pane URI to editor file path', async () => {
            const editor = await atom.workspace.open();
            spyOn(editor, 'getPath').and.returnValue(EDITOR_PATH);
            const editorElement = atom.views.getView(editor);
            atom.commands.dispatch(editorElement, 'webview-pane2:open');
            await activationPromise;

            const webview = getOnlyExpectedWebView();
            expect(webview.getURI()).toEqual(`${ATOM_URI_PREFIX}${EDITOR_PATH}`);
        });
    });

    describe('when open command is triggered on treeview element', () => {
        let treefileElement;
        const TREEFILE_PATH = '/home/test/treefile.elm';

        async function getTreeFileElement() {
            await atom.packages.activatePackage('tree-view');
            await atom.commands.dispatch(workspaceElement, 'tree-view:show');
            const treePane = atom.workspace.paneForURI('atom://tree-view');
            const treePaneItem = treePane.getActiveItem();
            const treeviewElement = atom.views.getView(treePaneItem);
            const fakeFileElement = document.createElement('div');
            fakeFileElement.classList.add('file');
            treeviewElement.appendChild(fakeFileElement);
            return fakeFileElement;
        }

        it('sets pane URI to treeview file path', async () => {
            spyOn(treeView, 'selectedPaths').and.returnValue([TREEFILE_PATH]);
            treefileElement = await getTreeFileElement();
            await atom.commands.dispatch(treefileElement, OPEN_COMMAND);
            await activationPromise;

            const webview = getOnlyExpectedWebView();
            expect(webview.getURI()).toEqual(`${ATOM_URI_PREFIX}${TREEFILE_PATH}`);
        });
    });

    describe('when config changes', () => {
        function setWebviewConfig(config) {
            Object.keys(config).forEach((key) => {
                atom.config.set(`webview-pane2.${key}`, config[key]);
            });
        }

        it('sets the initial properties of newly opened webviews', async () => {
            const properties = {
                autoReloadWait: 500,
                hideToolbar: true,
                showDevTools: true,
                autoReload: true
            };
            const configuration = {
                ...properties,
                homepage: 'https://www.github.com/',
                urlTemplate: ''
            };
            setWebviewConfig(configuration);
            atom.commands.dispatch(workspaceElement, OPEN_COMMAND);
            await activationPromise;

            let webview = getOnlyExpectedWebView();
            expect(webview.state).toEqual(jasmine.objectContaining(properties));

            setWebviewConfig({
                homepage: 'about:blank',
                urlTemplate: '',
                autoReloadWait: 40,
                hideToolbar: false,
                showDevTools: false,
                autoReload: false
            });

            webview = getOnlyExpectedWebView();
            expect(webview.state).toEqual(jasmine.objectContaining(properties));
        });

        it('changes autoReloadWait property on existing webviews');
    });
});
