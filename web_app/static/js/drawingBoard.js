window.addEventListener('DOMContentLoaded',function()
{
    function getPosition(mouseEvent, digitCanvas) {
        let x, y;
        if (mouseEvent.pageX != undefined && mouseEvent.pageY != undefined) {
           x = mouseEvent.pageX;
           y = mouseEvent.pageY;
        } else {
           x = mouseEvent.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
           y = mouseEvent.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        return { X: x - digitCanvas.offsetLeft, Y: y - digitCanvas.offsetTop };
    }

     function initialize() {
        let digitCanvas = document.getElementById("board");
        let context = digitCanvas.getContext("2d");
        context.strokeStyle = "#00b3ff";
        let is_touch_device = 'ontouchstart' in document.documentElement;

        if (is_touch_device) {
            let drawer = {
                isDrawing: false,
                touchstart: function (coors) {
                    context.beginPath();
                    context.moveTo(coors.x, coors.y);
                    this.isDrawing = true;
                    },
                touchmove: function (coors) {
                    if (this.isDrawing) {
                        context.lineTo(coors.x, coors.y);
                        context.stroke();
                    }
                },
                touchend: function (coors) {
                    if (this.isDrawing) {
                        this.touchmove(coors);
                        this.isDrawing = false;
                    }
                }
           };
           function draw(event) {
                let coors = {
                    x: event.targetTouches[0].pageX,
                    y: event.targetTouches[0].pageY
                };
                let obj = digitCanvas;

                if (obj.offsetParent) {
                    do {
                        coors.x -= obj.offsetLeft;
                        coors.y -= obj.offsetTop;
                    }
                    while ((obj = obj.offsetParent) != null);
                }
                drawer[event.type](coors);
           }
            digitCanvas.addEventListener('touchstart', draw, false);
            digitCanvas.addEventListener('touchmove', draw, false);
            digitCanvas.addEventListener('touchend', draw, false);
            digitCanvas.addEventListener('touchmove', function (event) {
                event.preventDefault();
            }, false); 
        }
        else {
            $("#board").mousedown(function (mouseEvent) {
                let position = getPosition(mouseEvent, digitCanvas);

                context.moveTo(position.X, position.Y);
                context.beginPath();
                $(this).mousemove(function (mouseEvent) {
                    drawLine(mouseEvent, digitCanvas, context);
                }).mouseup(function (mouseEvent) {
                    finishDrawing(mouseEvent, digitCanvas, context);
                }).mouseout(function (mouseEvent) {
                    finishDrawing(mouseEvent, digitCanvas, context);
                });
            });
            $("#clearButton").click(() =>{
                context.clearRect(0, 0, digitCanvas.width, digitCanvas.height);
            });
            $("#submitButton").click(() =>{
                let pixelData = context.getImageData(0, 0, digitCanvas.width, digitCanvas.height);
                let x , y = 0;
                for(let i = 0; i < pixelData.data.length; i +=4)
                {
                    if((i % (4)) == 0)
                    {
                        x++
                    }
                    if((i % (4 * 560)) == 0)
                    {
                        x = 0;
                        y++
                    }
                    if(pixelData.data[i] == 0 && pixelData.data[i + 1] == 179 && pixelData.data[i + 2] == 255)// find out if the rgb values corrospond #00b3ff
                    {
                        // send data to the nn
                        //console.log(x,y);
                    }
                }
            });
        }
    }
    function drawLine(mouseEvent, digitCanvas, context) {
        let position = getPosition(mouseEvent, digitCanvas);
        context.lineTo(position.X, position.Y);
        context.lineWidth = 20;
        context.stroke();
    }
    function finishDrawing(mouseEvent, digitCanvas, context) {
        drawLine(mouseEvent, digitCanvas, context);
        context.closePath();
        $(digitCanvas).unbind("mousemove")
                    .unbind("mouseup")
                    .unbind("mouseout");
    }
    initialize();
});