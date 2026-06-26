KityMinder Editor
==========

## Introduction

KityMinder Editor is a powerful, clean, and pleasant mind map editor. It is suitable for editing tree, graph, network, and similar structured data.

The editor was built by Baidu [FEX](https://github.com/fex-team) on top of [kityminder-core](https://github.com/fex-team/kityminder-core), and is used by [Baidu Mind Map](http://naotu.baidu.com).

Their relationship is:

![KityMinder relationship](relations.png "KityMinder relationship")

- [kityminder-core](https://github.com/fex-team/kityminder-core) is the core of kityminder. It is based on [kity](https://github.com/fex-team/kity), a vector graphics library developed by Baidu [FEX](https://github.com/fex-team). It provides visualization, simple editing, and the lower-level support for mind map data.
- [kityminder-editor](https://github.com/fex-team/kityminder-editor) is built on kityminder-core. It depends on AngularJS and includes UI, [hotbox](https://github.com/fex-team/hotbox), and other input helpers. In short, it is an editor.
- [Baidu Mind Map](http://naotu.baidu.com) is built on kityminder-editor and adds business logic such as third-party import/export formats (FreeMind, XMind, MindManager), file storage, user authentication, file sharing, and history versions.

## Features

- Basic operations: text editing, node folding, insertion, deletion, sorting, summaries, copy, cut, paste, and more.
- Style controls: font, bold, italic, color, copy style, paste style, and more.
- Icons: priority, progress, and more.
- History: undo and redo.
- Tags: paste multiple tags.
- Notes: Markdown note support.
- Images: insert local, remote, or searched images.
- Hyperlinks: insert HTTP, HTTPS, mail, and FTP links.
- Layouts: switch between multiple layouts.
- Themes: switch between multiple themes.
- Import/export: import multiple formats and export multiple formats, including images.
- Thumbnail: thumbnail viewing and navigation.

## Development

The root `index.html` is for development. The `index.html` under `dist` uses bundled code and is intended for production.

1. Install [nodejs](http://nodejs.org) and [npm](https://docs.npmjs.com/getting-started/installing-node).
2. Initialize the project by running `npm run init` from the kityminder-editor root.
3. Start the project by running `grunt dev` from the kityminder-editor root.
4. Develop against the root `index.html`, or inspect the production `index.html` under `dist`.

kityminder-editor also provides a bower package for direct use. In a project that needs kityminder-editor, run `bower install kityminder-editor`, then manually include the required CSS and JS files. See `dist/index.html` for the exact files. The npm package [wireDep](https://www.npmjs.com/package/wiredep) is recommended for automatic inclusion; see `Gruntfile.js`.

## Build

Run `grunt build`. After it completes, `dist` contains a runnable kityminder-editor build. Open `index.html` to run the example.

## Configuration

Configure `kityminder-editor` as needed:

```
angular.module('kityminderDemo', ['kityminderEditor'])
    .config(function (configProvider) {
        configProvider.set('imageUpload', 'path/to/image/upload/handler');
    });

```

## Data Import And Export

kityminder-editor is built on kityminder-core, and kityminder-core includes import/export support for five common formats. After creating an editor instance, use the following four APIs for data import and export.

* `editor.minder.exportJson()` - Export mind map data as a JSON object.
* `editor.minder.importJson(json)` - Import a JSON object as the current mind map data.
* `editor.minder.exportData(protocol, option)` - Export mind map data to the specified data format and return a Promise whose value is the export result.
* `editor.minder.importData(protocol, data, option)` - Import data in the specified format as mind map data and return a Promise whose value is the converted mind map JSON data.

Supported formats:

* `json` - JSON string, supports import and export.
* `text` - Plain text, supports import and export.
* `markdown` - Markdown, supports import and export.
* `svg` - SVG vector format, export only.
* `png` - PNG bitmap format, export only.

For more formats, load [kityminder-protocol](https://github.com/fex-team/kityminder-protocol) to add third-party format support.

For details about data formats, see the [kityminder-core wiki](https://github.com/fex-team/kityminder-core/wiki).

## Contact

Issues and suggestions:

[Github issues](https://github.com/fex-team/kityminder-editor/issues)

Mailing list: kity@baidu.com

QQ discussion group: 475962105
