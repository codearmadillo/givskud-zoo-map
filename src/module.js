class InteractiveMap {
    constructor(parent, map, config = null) {
        this.Viewport = {
            Width: parent.clientWidth,
            Height: parent.clientHeight
        }

        this.DragForce = 0.09;

        this.ZoomIncrease = 0.5;
        this.ZoomMinimum = 0.5;
        this.ZoomMaximum = 4;
        this.Zoom = config && config.Zoom && config.Zoom >= this.ZoomMinimum && config.Zoom <= this.ZoomMaximum ? config.Zoom : 1;

        this.Position = {
            x: config && config.Position ? config.Position.x : 0,
            y: config && config.Position ? config.Position.y : 0
        };

        this.Map = map;
        this.Map.AspectRatio = (this.Map.Height / this.Map.Width).toFixed(3);

        this.Elements = {};
        this.Elements.Parent = parent;
        this.Elements.Loader = this.loader();

        this.render();
    }
    loader() {
        var loaderElement = document.createElement('span');
            loaderElement.className = 'iamap-loader';
            loaderElement.textContent = 'Loading resources';

            this.Elements.Parent.appendChild(loaderElement);

            return loaderElement;
    }
    render() {
        if(!this.Elements.Map) {
            this.Elements.Parent.removeChild(this.Elements.Loader);

            var M = document.createElement('div');
                M.className = 'iamap-maplayer';
                M.style.position = 'relative';

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

            this.createControllers();   
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
        }
    }
    createControllers() {
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
    MapControlZoom(ZoomIncrease){
        if(ZoomIncrease > 0) {
            this.Zoom = this.Zoom < this.ZoomMaximum ? this.Zoom + this.ZoomIncrease : this.Zoom;
        } else {
            this.Zoom = this.Zoom > this.ZoomMinimum ? this.Zoom - this.ZoomIncrease : this.Zoom;
        }

        this.Position.x = this.Position.x * this.Zoom;
        this.Position.y = this.Position.y * this.Zoom;
        
        return this.render();
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
}

var MapResource = {
    Width: 980,
    Height: 795,
    Source: "http://mapsvg.com/maps/geo-calibrated/denmark.svg"
}
var Config = {
    Position: {
        x: 0,
        y: 0
    },
    Zoom: 1
}
var Map = new InteractiveMap(document.getElementById('map-element'), MapResource, Config);

/*
var Interval = setInterval(function(){
    Map.render();
    Map1.render();
    Map2.render();
}, 1000 / 30);
*/