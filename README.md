# atom-webview-pane2

Pane item for displaying webpages within Atom, with web development in mind.

## Overview

It is just a Chromium `<webview>` element that can browse the Internet and your
file system, as an Atom pane item. It has as few bells and whistles as possible
in its UI, and has configuration options that are designed to be useful for
side-by-side code/webview workflow, rather than for general browsing.


## Package settings

+	**`urlTemplate`:** Set this value if you want webviews launched from a file
	or directory (e.g. text editor, tree view) to navigate to a URL based on the
	file path. Leave blank to disable URL mapping and always open the homepage.

	This is the only setting for this package that can be [language-scoped](1).
	You may find language-scoping useful if, for example, you want the defaults
	for webviews launched from HTML files to be different from JavaScript files,
	etc.

	You can use relative path segments `..` and `.` in your URL template, and
	the template variables listed below. Otherwise, the URL template is expected
	to be a well-formed URL that the Chromium webview will try to parse as-is.
	If there are special characters in your URL and you aren't using
	the `file://` URL schema, you may need to [percent-encode](2) them.

	Available variables inside the template string:
	
	+ `{full_path}`: The absolute filesystem path of the parent directory.
		(This is probably only useful if you're using the `file://` schema.)
		+ Example usage: `file://{full_path}/../public`
	+ `{name_with_ext}`: File or directory name, including file extension.
		+ Example usage: `http://localhost:8000/resources/{name_with_ext}`
	+ `{name_no_ext}`: File or directory name without extension.
		+ Example usage: `https://user@myserver.com/index.php#{name_no_ext}`
	
+	**`homepage`:** URL that new webviews will navigate to upon opening when no
	URL mapping applies, or if URL mapping is disabled.
+	**`autoReload`:** Whether to open new webviews with auto-refresh on.
+	**`autoReloadWait`:** How many milliseconds to wait in between save and
	auto-refreshing. This can be useful if you have a file watcher utility that
	compiles your project, and you want to allow it some time to complete before
	any auto-refreshing webviews reload themselves.
+	**`hideToolbar`:** Whether to open new webviews with the toolbar hidden by
	default.
+	**`showDevTools`:** Whether to open developer tools by default when opening
	new webviews.


## Command reference

This command activates the package, and can be triggered from anywhere in the
Atom workspace:
+	`webview-pane2:open` - Open a new webview pane to a URL determined by the
	package settings

These commands can only be triggered from within a webview pane:
+	`webview-pane2:toggle-auto-reload` - Auto-refresh this pane when any editor
	is saved
+	`webview-pane2:toggle-toolbar` - Show or hide the toolbar
+	`webview-pane2:devtools` Open this pane's developer tools
+	`webview-pane2:go` - Navigate to the address in this pane's URL bar
+	`webview-pane2:back` - Navigate backward
+	`webview-pane2:forward` - Navigate forward
+	`webview-pane2:refresh` - Refresh the page
+	`webview-pane2:stop` - Stop loading the page

## Known issues

The URL templating for `file://` URLs relies on the third-party Node module
`file-url` to properly translate filepaths to URLs. NodeJS provides this
functionality natively in v10.12.0, but as of the time of writing, Atom is still
using Electron 2.0.9, which runs on Node v8.9.3.

[1]: https://flight-manual.atom.io/using-atom/sections/basic-customization/#global-configuration-settings
[2]: https://en.wikipedia.org/wiki/Percent-encoding
[3]: https://www.npmjs.com/package/file-url
