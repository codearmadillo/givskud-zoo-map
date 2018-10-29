class InteractiveMap {
    constructor(parent, map, config = null) {
        this.Viewport = {
            Width: parent.clientWidth,
            Height: parent.clientHeight
        }
        this.Zoom = {
            Minimum: 1,
            Maximum: 4,
            Increase: 0.5
        }
        this.Zoom.Zoom = config && config.Zoom && config.Zoom >= this.Zoom.Minimum && config.Zoom <= this.Zoom.Maximum ? config.Zoom : 1;

        this.Pan = {
            Force: 0.09,
            IsEnabled: true
        }
        this.Position = {
            x: config && config.Position ? config.Position.x : 0,
            y: config && config.Position ? config.Position.y : 0
        };
        this.Map = {
            Source: map.Source,
            AspectRatio: null,
            Horizontal: null
        }
        this.Elements = {};
        this.Elements.Parent = parent;
        /*
        this.DragForce = 0.09;

        this.ZoomIncrease = 0.5;
        this.ZoomMinimum = 0.5;
        this.ZoomMaximum = 4;
        this.Zoom = config && config.Zoom && config.Zoom >= this.ZoomMinimum && config.Zoom <= this.ZoomMaximum ? config.Zoom : 1;

        this.Map = map;
        this.Map.AspectRatio = (this.Map.Height / this.Map.Width).toFixed(3);

        this.Elements = {};
        this.Elements.Parent = parent;
        this.Elements.Loader = this.Loader();
        */

        this.Load();
    }
    Loader() {
        var loaderElement = document.createElement('span');
            loaderElement.className = 'iamap-loader';
            loaderElement.textContent = 'Loading resources';

            this.Elements.Parent.appendChild(loaderElement);

            return loaderElement;
    }
    Load() {
        var self = this;

        var MapImageElement = new Image();
            MapImageElement.addEventListener('load', function(e){
                if(MapImageElement.width / MapImageElement.height > 1){
                    self.Map.Horizontal = true;
                    self.Map.AspectRatio = MapImageElement.height / MapImageElement.width;
                } else {
                    self.Map.Horizontal = false;
                    self.Map.AspectRatio = MapImageElement.width / MapImageElement.height;
                }

                self.Render();

                window.addEventListener('resize', function(e){
                    self.Render();
                });
            });
            MapImageElement.src = this.Map.Source;
    }
    Render() {
        
        // Refresh window size
        this.Viewport = {
            Width: this.Elements.Parent.clientWidth,
            Height: this.Elements.Parent.clientHeight
        }

        // Initial settings
        if(!this.Elements.Map) {
            var MElement = document.createElement('div');
                MElement.className = 'iamap-maplayer';
                MElement.style.position = 'relative';

                MElement.style.backgroundImage = "url('" + this.Map.Source + "')";
                MElement.style.backgroundRepeat = 'no-repeat';
                MElement.style.backgroundPosition = 'center center';

            this.Elements.Map = MElement;
            this.Elements.Parent.appendChild(this.Elements.Map);

            this.CreateControllers();
        }

        // Recalculate background proportions
        if(this.Viewport.Width >= this.Viewport.Height) {
            this.Elements.Map.style.backgroundSize = '100% auto';
        } else {
            this.Elements.Map.style.backgroundSize = 'auto 100%';
        }
        
        // Manually position map if needed, turn off dragging
        if(this.Viewport.Width <= this.Viewport.Height) {
            this.Elements.Map.style.width = (this.Viewport.Width * this.Zoom.Zoom) + "px";
            this.Elements.Map.style.height = (this.Viewport.Width * this.Map.AspectRatio * this.Zoom.Zoom).toFixed(2) + "px";

            if(parseFloat(this.Elements.Map.style.height) < this.Viewport.Height) {
                let offsetY = (this.Viewport.Height - parseFloat(this.Elements.Map.style.height)).toFixed(2) / 2;
                this.Pan.IsEnabled = false;
                this.Elements.Map.style.left = "0px";
                this.Elements.Map.style.top = offsetY + "px";
            } else {
                this.Pan.IsEnabled = true;
            }
        } else {
            this.Elements.Map.style.height = (this.Viewport.Height * this.Zoom.Zoom) + "px";
            this.Elements.Map.style.width = (this.Viewport.Height / this.Map.AspectRatio  * this.Zoom.Zoom).toFixed(2) + "px";

            if(parseFloat(this.Elements.Map.style.width) < this.Viewport.Width) {
                let offsetX = (this.Viewport.Width - parseFloat(this.Elements.Map.style.width)).toFixed(2) / 2;
                this.Pan.IsEnabled = false;
                this.Elements.Map.style.top = "0px";
                this.Elements.Map.style.left = offsetX + "px";
            } else {
                this.Pan.IsEnabled = true;
            }
        }

        return true;

        // DEPRECATED

        if(!this.Elements.Map) {
            this.Elements.Parent.removeChild(this.Elements.Loader);

            var M = document.createElement('div');
                M.className = 'iamap-maplayer';
                M.style.position = 'relative';

                /*
                if(this.Viewport.Width >= this.Viewport.Height) {
                    M.style.width = (this.Viewport.Width * this.Zoom) + "px";
                    M.style.height = (this.Viewport.Width * this.Map.AspectRatio * this.Zoom).toFixed(2) + "px";
                } else {
                    M.style.height = (this.Viewport.Height * this.Zoom) + "px";
                    M.style.width = (this.Viewport.Height / this.Map.AspectRatio  * this.Zoom).toFixed(2) + "px";
                }

                if(parseFloat(M.style.height) < this.Viewport.Height) {
                    M.style.top = ((this.Viewport.Height - parseFloat(M.style.height)) / 2) + "px";
                }
                if(parseFloat(M.style.width) < this.Viewport.Width) {
                    M.style.left = ((this.Viewport.Width - parseFloat(M.style.width)) / 2) + "px";
                }
                */

                M.style.backgroundImage = "url('"+this.Map.Source+"')";
                M.style.backgroundRepeat = 'no-repeat';
                M.style.backgroundPosition = 'center center';

                if(this.Viewport.Width >= this.Viewport.Height) {
                    M.style.backgroundSize = '100% auto';
                } else {
                    M.style.backgroundSize = 'auto 100%';
                }

            this.Elements.Map = M;
            this.Elements.Parent.appendChild(this.Elements.Map);

            if(parseFloat(this.Elements.Map.style.width).toFixed(2) > this.Viewport.Width) {
                let offX = (parseFloat(this.Elements.Map.style.width).toFixed(2) - this.Viewport.Width) / 2;
                this.Position.x = offX;
                this.Elements.Parent.scrollLeft = offX;
            }
            if(parseFloat(this.Elements.Map.style.height).toFixed(2) > this.Viewport.Height) {
                let offY = (parseFloat(this.Elements.Map.style.height).toFixed(2) - this.Viewport.Height) / 2;
                this.Position.y = offY;
                this.Elements.Parent.scrollTop = offY;
            }

            this.CreateControllers();   
        } else {
            // Rescale map element
            if(this.Viewport.Width >= this.Viewport.Height) {
                this.Elements.Map.style.width = (this.Viewport.Width * this.Zoom) + "px";
                this.Elements.Map.style.height = (this.Viewport.Width * this.Map.AspectRatio * this.Zoom).toFixed(2) + "px";

                /*
                if(parseFloat(this.Elements.Map.style.height) < this.Viewport.Height) {
                    this.Elements.Map.style.top = ((this.Viewport.Height - parseFloat(this.Elements.Map.style.height)) / 2) + "px";
                } else {
                    this.Elements.Map.style.top = "0px";
                }
                */
            } else {
                this.Elements.Map.style.height = (this.Viewport.Height * this.Zoom) + "px";
                this.Elements.Map.style.width = (this.Viewport.Height / this.Map.AspectRatio  * this.Zoom).toFixed(2) + "px";
            }

            if(this.Markers){
                for(let Key in this.Markers) {
                    let Group = this.Markers[Key];
                    let Pins = Group.items;

                    Pins.forEach(function(v){
                        console.log(v);
                    });

                    /*
                    Group['items'].forEach(function(Marker){
                        console.log(Marker);
                    });
                    */

                    /*
                    let Marker = this.Markers[Key];
                    
                    
                    let MarkerElement = document.createElement('span');
                        MarkerElement.style.position = 'absolute';
                        MarkerElement.className = 'iamap-marker';

                        MarkerElement.style.left = Marker.

                    Marker.element = MarkerElement;
                    */
                }
            }
        }
    }
    CreateControllers() {
        var self = this;

        this.Elements.Controllers = {};

        var ControllersElement = document.createElement('div');
            ControllersElement.className = 'iamap-controllerslayer';
            ControllersElement.style.position = 'absolute';
            ControllersElement.style.zIndex = '100';
            ControllersElement.style.top = 0; ControllersElement.style.right = 0; ControllersElement.style.bottom = 0; ControllersElement.style.left = 0;
        this.Elements.Controllers.Parent = ControllersElement;
        this.Elements.Parent.appendChild(this.Elements.Controllers.Parent);

        var ZoomInController = document.createElement('input');
            ZoomInController.type = "button";
            ZoomInController.value = "Zoom in";
            ZoomInController.addEventListener('click', function(e){
                e.preventDefault();
                self.MapControlZoom(true);
            });
        this.Elements.Controllers.ZoomIn = ZoomInController;
        this.Elements.Controllers.Parent.appendChild(this.Elements.Controllers.ZoomIn);

        var ZoomOutController = document.createElement('input');
            ZoomOutController.type = 'button';
            ZoomOutController.value = 'Zoom out';
            ZoomOutController.addEventListener('click', function(e){
                e.preventDefault();
                self.MapControlZoom(false);
            });
        this.Elements.Controllers.ZoomOut = ZoomOutController;
        this.Elements.Controllers.Parent.appendChild(this.Elements.Controllers.ZoomOut);

        return true;

        this.Elements.Controls = {};
        var self = this;

        window.addEventListener('resize', function(e){
            self.render();
        });

        var ZoomInController = document.getElementById('zoomin');
        var ZoomOutController = document.getElementById('zoomout');
            ZoomInController.addEventListener('click', function(e){
                self.MapControlZoom(self.ZoomIncrease);
            });
            ZoomOutController.addEventListener('click', function(e){
                self.MapControlZoom(self.ZoomIncrease * -1);
            });


        this.DragStartX = null;
        this.DragStartY = null;

        this.mouseDrag = false;
        this.touchDrag = false;

        this.Elements.Map.addEventListener('touchstart', function(e){
            self.touchDrag = true;

            self.DragStartX = parseFloat((e.changedTouches[0].clientX - self.Elements.Parent.offsetLeft).toFixed(2));
            self.DragStartY = parseFloat((e.changedTouches[0].clientY - self.Elements.Parent.offsetTop).toFixed(2));
        });
        this.Elements.Map.addEventListener('touchend', function(e){
            self.touchDrag = false;

            self.DragStartX = null;
            self.DragStartY = null;
        });
        this.Elements.Map.addEventListener('touchmove', function(e){
            e.preventDefault();

            if(self.touchDrag) {
                let cursorX = parseFloat((window.event.changedTouches[0].clientX).toFixed(2));
                let cursorY = parseFloat((window.event.changedTouches[0].clientY).toFixed(2));

                self.MapControlPan(cursorX, cursorY);
            }   
        });

        this.Elements.Map.addEventListener('mousedown', function(e){
            self.mouseDrag = true;
            
            self.DragStartX = e.clientX - self.Elements.Parent.offsetLeft;
            self.DragStartY = e.clientY - self.Elements.Parent.offsetTop;
        });
        this.Elements.Map.addEventListener('mouseup', function(e){
            self.mouseDrag = false;

            self.DragStartX = null;
            self.DragStartY = null;
        });
        this.Elements.Map.addEventListener('mousemove', function(e){
            if(self.mouseDrag) {
                let cursorX = window.event.clientX;
                let cursorY = window.event.clientY;

                self.MapControlPan(cursorX, cursorY);
            }
        });
    }
    MapControlZoom(ZoomIn){
        let posX = this.Position.x / this.Zoom.Zoom;
        let posY = this.Position.y / this.Zoom.Zoom;

        if(ZoomIn) {
            this.Zoom.Zoom = this.Zoom.Zoom < this.Zoom.Maximum ? this.Zoom.Zoom + this.Zoom.Increase : this.Zoom.Zoom;
        } else {
            this.Zoom.Zoom = this.Zoom.Zoom > this.Zoom.Minimum ? this.Zoom.Zoom - this.Zoom.Increase : this.Zoom.Zoom;
        }

        this.Position.x = posX * this.Zoom.Zoom;
        this.Position.y = posY * this.Zoom.Zoom;

        return this.Render();

        /*

        DEPRECATED

        if(ZoomIncrease > 0) {
            this.Zoom = this.Zoom < this.ZoomMaximum ? this.Zoom + this.ZoomIncrease : this.Zoom;
        } else {
            this.Zoom = this.Zoom > this.ZoomMinimum ? this.Zoom - this.ZoomIncrease : this.Zoom;
        }

        this.Position.x = this.Position.x * this.Zoom;
        this.Position.y = this.Position.y * this.Zoom;
        
        return this.Render();
        */
    }
    MapControlPan(clientX, clientY){
        let hor = parseFloat((clientX - this.DragStartX).toFixed(2));
        let ver = parseFloat((clientY - this.DragStartY).toFixed(2));

        this.DragStartX = clientX;
        this.DragStartY = clientY;

        let offsetX = this.Elements.Map.offsetLeft ? this.Elements.Map.offsetLeft : 0;
        let offsetY = this.Elements.Map.offsetTop ? this.Elements.Map.offsetTop : 0;

        let parentWidth = this.Elements.Parent.clientWidth;
        let parentHeight = this.Elements.Parent.clientHeight;

        this.Elements.Map.style.left = parseFloat(offsetX + hor) + "px";
        this.Elements.Map.style.top = parseFloat(offsetY + ver) + "px";

        console.log('Height:', this.Elements.Parent.clientHeight * this.Zoom);
        console.log('Offset:', Math.abs(this.Elements.Map.offsetTop));
        // console.log(Math.abs(this.Elements.Map.offsetTop / (this.Elements.Parent.clientHeight * this.Zoom)).toFixed(2));

        /*
        if(Math.abs(offsetX + hor) < parentWidth * 0.65 * this.Zoom) {
            this.Elements.Map.style.left = parseFloat(offsetX + hor) + "px";
        }
        if(Math.abs(offsetY + ver) < parentHeight * 0.65 * this.Zoom) {
            this.Elements.Map.style.top = parseFloat(offsetY + ver) + "px";
        }
        */
    }
    AddMarkers(markers){
        var self = this;

        if(!this.Markers) {
            this.Markers = {};
        }
        markers.forEach(function(val){
            if(!self.Markers[val.group.id]){
                self.Markers[val.group.id] = {
                    id: val.group.id,
                    label: val.group.label,
                    slug: val.group.slug,
                    icon: val.group.icon,
                    items: {}
                };
            }
            if(self.Markers[val.group.id]['items'][val.id]){
                console.log('Warning: Duplicate marker ID');
                return;
            } else {
                self.Markers[val.group.id]['items'][val.id] = new InteractiveMapMarker({
                    id: val.id,
                    group: val.group,
                    label: val.label,
                    position: val.position,
                    desc: val.description ? val.description : null
                });
            }
        });

        var MField = document.createElement('div');
            MField.className = 'iamap-markerslayer';
            MField.style.position = 'absolute';
            MField.style.left = 0; MField.style.top = 0; MField.style.right = 0; MField.style.bottom = 0;
        this.Elements.Markers = MField;
        this.Elements.Map.appendChild(this.Elements.Markers);
        
        this.Render();
    }
}
class InteractiveMapMarker {
    constructor(cfg){
        if(!cfg || !cfg.group || !cfg.id || !cfg.position || !cfg.label){
            console.log('Marker error: The definition of config incorrect');
        } else {
            this.id = cfg.id;
            this.group = cfg.group;
            this.position = cfg.position;
            this.label = cfg.label;
            this.label = cfg.desc ? cfg.desc : "";
        }
    }
    cfgError(field){
        return alert('The field ' + field + ' is missing from configuration');
    }
    getPosition(){
        return this.position;
    }
}

var MapResource = {
    Width: 980,
    Height: 795,
    Source: "http://mapsvg.com/maps/geo-calibrated/denmark.svg"
}
var Config = {
    Position: {
        x: 10,
        y: 10
    },
    Zoom: 1
}
var MarkersData = Array(
    {
        group: {
            id: 0,
            slug: 'animal',
            label: 'Animals',
            icon: null
        },
        id: 1226,
        label: 'Animal 1',
        description: 'Description',
        position: {
            x: 100,
            y: 100
        }
    },
    {
        group: {
            id: 0,
            slug: 'animal',
            label: 'Animals',
            icon: null
        },
        id: 4551,
        label: 'Animal 2',
        description: 'Description',
        position: {
            x: 200,
            y: 200
        }
    },
    {
        group: {
            id: 1,
            slug: 'food-stand',
            label: 'Food stand',
            icon: null
        },
        id: 4551,
        label: 'Animal 2',
        description: 'Description',
        position: {
            x: 200,
            y: 200
        }
    }
);
var Map = new InteractiveMap(document.getElementById('map-element'), MapResource, Config);
var MapPortrait = new InteractiveMap(document.getElementById('map-element-portrait'), MapResource, Config);
    // Map.AddMarkers(MarkersData);