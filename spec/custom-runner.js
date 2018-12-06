'use babel';

import {createRunner} from 'atom-jasmine3-test-runner';

// options to customize the runner
const options = {
  htmlTitle: 'Spec Suite: atom-webview-pane2',
  random: true,
  seed: 42,
  specHelper: {
	  attachToDom: true,
      customMatchers: true
  }
};

export default createRunner(options);
