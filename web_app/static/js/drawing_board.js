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
        // Use hidden canvas to put indiviual digit
        let canvasIndImage = document.getElementById("hiddenCanvas");      
        let contextIndImg = canvasIndImage.getContext("2d");
        contextIndImg.clearRect(0, 0, canvasIndImage.width, canvasIndImage.height);

        let canvasDisplay = document.getElementById("dispalyCanvas");      
        let contextDisplay = canvasDisplay.getContext("2d");

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
                let minX = 399;
                let maxX = 0;
                let minY = 399;
                let maxY = 0;
                //Extract digit from canvas
                let digitMat = matrixify(digitData, 400, 400);
                let x = 0;
                let y = 0;
                for(y = 0; y < 400; y++)
                {
                    for(x = 0; x < 400; x++)
                    {
                        if(digitMat[y][x] == 255)
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
                // Get the Hight and the Width of the input digit
                let digitWidth = maxX - minX;
                let digitHeight = maxY - minY;
                // Calculate the scale factor
                let scale;
                if (digitHeight > digitWidth)
                {
                    scale = digitHeight/18;
                }
                else
                {
                    scale = digitWidth/18;
                }
                //calculate new width and height
                let newWidth = digitWidth/scale;
                let newHeight = digitHeight/scale;
                let newX = (28 - newWidth) / 2;
                let newY = (28 - newHeight) / 2;

                 // Draw the scaled and centered image to a new canvas  
                let canvasHidden = document.createElement("canvas");
                canvasHidden.width = 28;
                canvasHidden.heigth = 28;
                let contextHidden = canvasHidden.getContext("2d");
                contextHidden.clearRect(0, 0, canvasHidden.width, canvasHidden.height);
                //put pixel data into temp context     
                contextIndImg.putImageData(pixelData, 0, 0);
                contextHidden.drawImage(canvasIndImage, minX, minY, digitWidth, digitHeight, newX, newY, newWidth, newHeight);

                let scaledCenteredDigit = contextHidden.getImageData(0, 0, 28,28);
                let processedImage = [];
                for (var i = 0; i<784; i++)
                {
                    processedImage[i] = parseFloat((scaledCenteredDigit.data[(i*4)+3]/255).toFixed(10));
                }
                let answer = nueralNetwork(processedImage);
                console.log(answer);

                contextDisplay.clearRect(minX, minY, digitWidth, digitHeight);            
                contextDisplay.font = digitHeight + "pt Times New Roman";
                contextDisplay.fillStyle  = "#00b3ff";
                contextDisplay.fillText(answer,minX,maxY); 
            });
            $("#clearButton").click(() =>{
                context.clearRect(0, 0, digitCanvas.width, digitCanvas.height);
                contextDisplay.clearRect(0, 0, canvasDisplay.width, canvasDisplay.height);
            });
        }
    }
    initialize();
});