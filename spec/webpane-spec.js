'use babel';

import {locationFromFilepath} from '../lib/webpane-component';

describe('WebPane', () => {
    describe('locationFromFilepath', () => {
        it('is the homepage when there is no template', () => {
            const homepage = 'about:blank';
            atom.config.set('webview-pane2.urlTemplate', '');
            atom.config.set('webview-pane2.homepage', homepage);
            const url = locationFromFilepath('/home/test/foo');
            expect(url).toBe(homepage);
        });

        it('is the homepage when template does not apply', () => {
            const homepage = 'https://github.com/';
            atom.config.set('webview-pane2.urlTemplate',
                'file://{full_path}/{name_with_ext}');
            atom.config.set('webview-pane2.homepage', homepage);
            const url = locationFromFilepath('');
            expect(url).toBe(homepage);
        });

        it('replaces full path and name of directory', () => {
            atom.config.set('webview-pane2.urlTemplate',
                'file://{full_path}/{name_with_ext}');
            const url = locationFromFilepath('/home/test/foo');
            expect(url).toBe('file:///home/test/foo');
        });

        it('replaces filename without extension', () => {
            atom.config.set('webview-pane2.urlTemplate',
                'localhost:8000/public/{name_no_ext}');
            const url = locationFromFilepath('/home/test/foo/bar.html');
            expect(url).toBe('localhost:8000/public/bar');
        });
    });

    describe('when webview-pane2:toggle-toolbar command is triggered', () => {
        it('sets the toolbar property to shown if it was hidden');
        it('sets the toolbar property to hidden if it was shown');
        it('only affects the pane on which it was triggered');
    });

    describe('when webview-pane2:toggle-auto-reload command is triggered', () => {
        it('sets the autoreload property to true if it was false');
        it('sets the autoreload property to false if it was true');
        it('only affects the pane on which it was triggered');
    });

	describe('when webview-pane2:toggle-devtools command is triggered', () => {
        it('sets the devtools property to true if it was false');
        it('sets the devtools property to false if it was true');
        it('only affects the pane on which it was triggered');
    });

	describe('when webview-pane2:refresh command is triggered', () => {
        it('leaves all properties of the webpane unchanged');
    });

    describe('when webview-pane2:go command is triggered', () => {
        it('sets url to provided value if different');
		it('leaves url unchanged if none provided');
    });

    describe('when webview-pane2:back event is triggered', () => {
        it('changes the pane url to its previous value');
        it('only affects the pane on which it was triggered');
        it('leaves url unchanged if no previous value');
    });

    describe('when webview-pane2:forward event is triggered', () => {
        it('changes the url to its subsequent value');
        it('only affects the pane on which it was triggered');
        it('leaves url unchanged if no next value');
    });
});
