let socket
let color = '#000'
let strokeWidth = 4
let pix2pix, modelReady = false, isTransfering = false,
    statusMsg, clearBtn, canvasSize = 256

var leftsketch = function (p) {
	p.setup = function () {
		p.createCanvas(canvasSize, canvasSize);
		p.background(255, 250, 250)

    // Select 'clear' button html element
    clearBtn = p.select('#clearBtn');
    // Attach a mousePressed event to the 'clear' button
    clearBtn.mousePressed(function () {
      p.background(255, 250, 250);
    });

    outputContainer = p.select('#output');
    statusMsg = p.select('#status');
    statusMsg.html('Loading ... ');

    // Create a pix2pix method with a pre-trained model
    pix2pix = ml5.pix2pix('./edges2pikachu_AtoB.pict', modelLoaded);

		// Start the socket connection
		p.socket = io.connect('http://localhost:3000')

		// Callback function
		p.socket.on('mouse', data => {
			p.stroke(data.color)
			p.strokeWeight(data.strokeWidth)
			p.line(data.x, data.y, data.px, data.py)
		})
	};
	// Sending data to the socket	
	p.sendmouse = function (x, y, pX, pY) {
		const data = {
			x: x,
			y: y,
			px: pX,
			py: pY,
			color: color,
			strokeWidth: strokeWidth,
		}

		p.socket.emit('mouse', data)
	};

	p.mouseDragged = function () {
		// Draw
		p.stroke(color)
		p.strokeWeight(strokeWidth)
		p.line(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY)

		// Send the mouse coordinates
		p.sendmouse(p.mouseX, p.mouseY, p.pmouseX, p.pmouseY)
	};

  p.mouseReleased = function() {
    if (modelReady && !isTransfering) {
        transfer()
    }
  };

  function transfer() {
    // Set isTransfering to true
    isTransfering = true;

    // Update status message
    statusMsg.html('Applying Style Transfer...!');

    // Select canvas DOM element
    const canvasElement = p.select('canvas').elt;

    // Apply pix2pix transformation
    pix2pix.transfer(canvasElement, function (err, result) {
        if (err) {
            console.log(err);
            console.log('damn')
        }
        if (result && result.src) {
            // Set isTransfering back to false
            isTransfering = false;
            // Clear output container
            outputContainer.html('');
            // Create an image based result
            p.createImg(result.src).class('border-box').parent('output');
            // Show 'Done!' message
            statusMsg.html('Done!');
        }
    });
  };

  // A function to be called when the models have loaded
  function modelLoaded() {
    // Show 'Model Loaded!' message
    statusMsg.html('Model Loaded!');
  
    // Set modelReady to true
    modelReady = true;
  
    // Call transfer function after the model is loaded
    transfer();
  };
};

var left = new p5(leftsketch, 'c1');
