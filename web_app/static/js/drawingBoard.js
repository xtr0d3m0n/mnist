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
    function matrixify(array, n, m)
    {
        let result = [];
        for (let i = 0; i < n; i++) {
            result[i] = array.splice(0, m);
        }
        return result;
    }
    function arrayfy(matrix, n, m)
    {
        let result = [];
        for(let i = 0; i < n; i++)
        {
            for(let j = 0; j < m; j++)
            {
                result.push(matrix[i][j]);
            }
        }
        return result;
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
            $("#submitButton").click(() =>{
                let pixelData = context.getImageData(0, 0, digitCanvas.width, digitCanvas.height);
                //Extract alpha channels
                let digitData = [];
                for(let i = 0; i < 160000; i++)
                {
                    digitData[i] = pixelData.data[(i * 4) + 3];
                }
                /*let arr = [1,2,3,4,5,6,7,8,9];
                console.log(arr);
                let mat = matrixify(arr,3,3)
                console.log(mat);
                console.log(arrayfy(mat,3,3));*/
                // Get the digit min and max x and y and calculate the width and height
                /*let minX = Math.min.apply(null, rowArray);
                let maxX = Math.max.apply(null, rowArray);
                let minY = Math.min.apply(null, columnArray);
                let maxY = Math.max.apply(null, columnArray);
                let digitWidth = maxX - minX;
                let digitHeight = maxY - minY;*/
                
                let minX = 399;
                let maxX = 0;
                let minY = 399;
                let maxY = 0;
                //Extract digit from canvas
                digitData = matrixify(digitData, 400, 400);
                let x = 0;
                let y = 0;
                for(y = 0; y < 400; y++)
                {
                    for(x = 0; x < 400; x++)
                    {
                        if(digitData[y][x] == 255)
                        {
                            if(x < minX)
                            {
                                minX = x;
                            }
                            if((399 - x) < (399 - maxX))
                            {
                                maxX = x;
                            }

                            if(y < minY)
                            {
                                minY =  y;
                            }
                            if((399 - y) < (399 - maxY))
                            {
                                maxY = y;
                            }
                        }
                    }
                }
                let digitWidth = maxX - minX;
                let digitHeight = maxY - minY;
                console.log(digitWidth);
                console.log(digitHeight);
            });
            $("#clearButton").click(() =>{
                context.clearRect(0, 0, digitCanvas.width, digitCanvas.height);
            });
        }
    }
    initialize();
});