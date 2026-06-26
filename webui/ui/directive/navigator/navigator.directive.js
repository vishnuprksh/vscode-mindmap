/**
 * @fileOverview
 *
 * Bottom-left navigator.
 *
 * @author: zhangbobell
 * @email : zhangbobell@163.com
 *
 * @copyright: Baidu FEX, 2015 */
angular.module('kityminderEditor')
    .directive('navigator', ['memory', 'config', function(memory, config) {
        return {
            restrict: 'A',
            templateUrl: 'ui/directive/navigator/navigator.html',
            scope: {
                minder: '='
            },
            link: function(scope) {
                minder.setDefaultOptions({zoom: config.get('zoom')});

                scope.isNavOpen = !memory.get('navigator-hidden');

                scope.getZoomRadio = function(value) {
                    var zoomStack = minder.getOption('zoom');
                    var minValue = zoomStack[0];
                    var maxValue = zoomStack[zoomStack.length - 1];
                    var valueRange = maxValue - minValue;

                    return (1 - (value - minValue) / valueRange);
                };

                scope.getHeight = function(value) {
                    var totalHeight = $('.zoom-pan').height();

                    return scope.getZoomRadio(value) * totalHeight;
                };

                // Initial zoom ratio.
                scope.zoom = 100;

                // When a zoom event occurs.
                minder.on('zoom', function(e) {
                    scope.zoom = e.zoom;
                });

                scope.toggleNavOpen = function() {
                    scope.isNavOpen = !scope.isNavOpen;
                    memory.set('navigator-hidden', !scope.isNavOpen);

                    if (scope.isNavOpen) {
                        bind();
                        updateContentView();
                        updateVisibleView();
                    } else{
                        unbind();
                    }
                };

                setTimeout(function() {
                    if (scope.isNavOpen) {
                        bind();
                        updateContentView();
                        updateVisibleView();
                    } else{
                        unbind();
                    }
                }, 0);



                function bind() {
                    minder.on('layout layoutallfinish', updateContentView);
                    minder.on('viewchange', updateVisibleView);
                }

                function unbind() {
                    minder.off('layout layoutallfinish', updateContentView);
                    minder.off('viewchange', updateVisibleView);
                }


                /** Thumbnail navigator section.
                 * */

                var $previewNavigator = $('.nav-previewer');

                // Canvas used to render thumbnails.
                var paper = new kity.Paper($previewNavigator[0]);

                // Use two paths to draw node and connection thumbnails.
                var nodeThumb = paper.put(new kity.Path());
                var connectionThumb = paper.put(new kity.Path());

                // Rectangle representing the visible area.
                var visibleRect = paper.put(new kity.Rect(100, 100).stroke('red', '1%'));

                var contentView = new kity.Box(), visibleView = new kity.Box();

                /**
                 * Add thumbnail handling for the Tianpan theme.
                 * @Editor: Naixor line 104~129
                 * @Date: 2015.11.3
                 */
                var pathHandler = getPathHandler(minder.getTheme());

                // Theme change event.
                minder.on('themechange', function(e) {
                    pathHandler = getPathHandler(e.theme);
                });

                function getPathHandler(theme) {
                    switch (theme) {
                        case "tianpan":
                        case "tianpan-compact":
                            return function(nodePathData, x, y, width, height) {
                                var r = width >> 1;
                                nodePathData.push('M', x, y + r,
                                    'a', r, r, 0, 1, 1, 0, 0.01,
                                    'z');
                            }
                        default: {
                            return function(nodePathData, x, y, width, height) {
                                nodePathData.push('M', x, y,
                                    'h', width, 'v', height,
                                    'h', -width, 'z');
                            }
                        }
                    }
                }

                navigate();

                function navigate() {

                    function moveView(center, duration) {
                        var box = visibleView;
                        center.x = -center.x;
                        center.y = -center.y;

                        var viewMatrix = minder.getPaper().getViewPortMatrix();
                        box = viewMatrix.transformBox(box);

                        var targetPosition = center.offset(box.width / 2, box.height / 2);

                        minder.getViewDragger().moveTo(targetPosition, duration);
                    }

                    var dragging = false;

                    paper.on('mousedown', function(e) {
                        dragging = true;
                        moveView(e.getPosition('top'), 200);
                        $previewNavigator.addClass('grab');
                    });

                    paper.on('mousemove', function(e) {
                        if (dragging) {
                            moveView(e.getPosition('top'));
                        }
                    });

                    $(window).on('mouseup', function() {
                        dragging = false;
                        $previewNavigator.removeClass('grab');
                    });
                }

                function updateContentView() {

                    var view = minder.getRenderContainer().getBoundaryBox();

                    contentView = view;

                    var padding = 30;

                    paper.setViewBox(
                        view.x - padding - 0.5,
                        view.y - padding - 0.5,
                        view.width + padding * 2 + 1,
                        view.height + padding * 2 + 1);

                    var nodePathData = [];
                    var connectionThumbData = [];

                    minder.getRoot().traverse(function(node) {
                        var box = node.getLayoutBox();
                        pathHandler(nodePathData, box.x, box.y, box.width, box.height);
                        if (node.getConnection() && node.parent && node.parent.isExpanded()) {
                            connectionThumbData.push(node.getConnection().getPathData());
                        }
                    });

                    paper.setStyle('background', minder.getStyle('background'));

                    if (nodePathData.length) {
                        nodeThumb
                            .fill(minder.getStyle('root-background'))
                            .setPathData(nodePathData);
                    } else {
                        nodeThumb.setPathData(null);
                    }

                    if (connectionThumbData.length) {
                        connectionThumb
                            .stroke(minder.getStyle('connect-color'), '0.5%')
                            .setPathData(connectionThumbData);
                    } else {
                        connectionThumb.setPathData(null);
                    }

                    updateVisibleView();
                }

                function updateVisibleView() {
                    visibleView = minder.getViewDragger().getView();
                    visibleRect.setBox(visibleView.intersect(contentView));
                }

            }
        }
    }]);
