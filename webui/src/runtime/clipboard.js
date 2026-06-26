/**
 * @Desc: Handle editor clipboard events. Works only when ClipboardEvent is supported and the browser is not Firefox.
 * @Editor: Naixor
 * @Date: 2015.9.21
 */
define(function(require, exports, module) {

	function ClipboardRuntime () {
		var minder = this.minder;
		var Data = window.kityminder.data;

		if (!minder.supportClipboardEvent || kity.Browser.gecko) {
			return;
		};

		var fsm = this.fsm;
		var receiver = this.receiver;
		var MimeType = this.MimeType;
		
		var kmencode = MimeType.getMimeTypeProtocol('application/km'),
			decode = Data.getRegisterProtocol('json').decode;
		var _selectedNodes = [];

		/*
		 * Add support for copying and pasting multiple nodes.
		 */
		function encode (nodes) {
			var _nodes = [];
			for (var i = 0, l = nodes.length; i < l; i++) {
				_nodes.push(minder.exportNode(nodes[i]));
			}
			return kmencode(Data.getRegisterProtocol('json').encode(_nodes));
		}

		var beforeCopy = function (e) {
			if (document.activeElement == receiver.element) {
				var clipBoardEvent = e;
				var state = fsm.state();

				switch (state) {
					case 'input': {
						break;
					}
					case 'normal': {
						var nodes = [].concat(minder.getSelectedNodes());
						if (nodes.length) {
							// Copied nodes may share the same id information, so this algorithm filters them.
							// Using node.getParent() or node.parent can render unselected nodes as selected, so use isAncestorOf instead of walking the tree manually.
							if (nodes.length > 1) {
								var targetLevel;
								nodes.sort(function(a, b) {
									return a.getLevel() - b.getLevel();
								});
								targetLevel = nodes[0].getLevel();
								if (targetLevel !== nodes[nodes.length-1].getLevel()) {
									var plevel, pnode,
										idx = 0, l = nodes.length, pidx = l-1;
									
									pnode = nodes[pidx];

									while (pnode.getLevel() !== targetLevel) {
										idx = 0;
										while (idx < l && nodes[idx].getLevel() === targetLevel) {
											if (nodes[idx].isAncestorOf(pnode)) {
												nodes.splice(pidx, 1);
												break;
											}
											idx++;
										}
										pidx--;
										pnode = nodes[pidx];
									}
								};
							};
							var str = encode(nodes);
				            clipBoardEvent.clipboardData.setData('text/plain', str);
				        }
	            		e.preventDefault();			
						break;
					}
				}
			}
		}

		var beforeCut = function (e) {
			if (document.activeElement == receiver.element) {
				if (minder.getStatus() !== 'normal') {
	            	e.preventDefault();			
					return;
				};

				var clipBoardEvent = e;
				var state = fsm.state();

				switch (state) {
					case 'input': {
						break;
					}
					case 'normal': {
						var nodes = minder.getSelectedNodes();
						if (nodes.length) {
				            clipBoardEvent.clipboardData.setData('text/plain', encode(nodes));
				            minder.execCommand('removenode');
				        }
	            		e.preventDefault();			
						break;
					}
				}
			};
		}

		var beforePaste = function(e) {
			if (document.activeElement == receiver.element) {
				if (minder.getStatus() !== 'normal') {
	            	e.preventDefault();			
					return;
				};

				var clipBoardEvent = e;
				var state = fsm.state();
				var textData = clipBoardEvent.clipboardData.getData('text/plain');

				switch (state) {
					case 'input': {
						// In input state, do not paste application/km data.
						if (!MimeType.isPureText(textData)) {
							e.preventDefault();
							return;
						};
						break;
					}
					case 'normal': {
						/*
						 * In normal state, handle pasting child-node text into selected nodes separately.
						 */
						var sNodes = minder.getSelectedNodes();
						
						if (MimeType.whichMimeType(textData) === 'application/km') {
							var nodes = decode(MimeType.getPureText(textData));
							var _node; 
							sNodes.forEach(function(node) {
								// Iterate backward because paste logic reorders child nodes while filtering.
								for (var i = nodes.length-1; i >= 0; i--) {
									_node = minder.createNode(null, node);
									minder.importNode(_node, nodes[i]);
									_selectedNodes.push(_node);
									node.appendChild(_node);
								}
							});
							minder.select(_selectedNodes, true);
							_selectedNodes = [];

							minder.refresh();
						}
                        else if (clipBoardEvent.clipboardData && clipBoardEvent.clipboardData.items[0].type.indexOf('image') > -1) {
                            var imageFile = clipBoardEvent.clipboardData.items[0].getAsFile();
                            var serverService = angular.element(document.body).injector().get('server');

                            return serverService.uploadImage(imageFile).then(function (json) {
                                    var resp = json.data;
                                    if (resp.errno === 0) {
                                        minder.execCommand('image', resp.data.url);
                                    }
                                });
                        }
                        else {
							sNodes.forEach(function(node) {
								minder.Text2Children(node, textData);						
							});
						}
	            		e.preventDefault();			
						break;
					}
				}
			}
		}
		/**
		 * The editor receiver handles all events, including clipboard events.
		 * @Editor: Naixor
		 * @Date: 2015.9.24
		 */
		document.addEventListener('copy', beforeCopy);
        document.addEventListener('cut', beforeCut);
        document.addEventListener('paste', beforePaste);	
	}

	return module.exports = ClipboardRuntime;
});
