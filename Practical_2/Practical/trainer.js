let model;
let canvas;
let ctx;
let drawing = false;

// ===========================
// INITIALIZE CANVAS
// ===========================
window.onload = async function () {

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    // Fill black background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mouse Events
    canvas.addEventListener("mousedown", () => drawing = true);
    canvas.addEventListener("mouseup", () => drawing = false);
    canvas.addEventListener("mouseleave", () => drawing = false);
    canvas.addEventListener("mousemove", draw);

    // Load Pretrained MNIST Model
    model = await tf.loadLayersModel(
        "https://storage.googleapis.com/tfjs-models/tfjs/mnist/model.json"
    );

    console.log("Model Loaded Successfully");
};

// ===========================
// DRAW FUNCTION
// ===========================
function draw(event) {
    if (!drawing) return;

    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";

    ctx.lineTo(event.offsetX, event.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(event.offsetX, event.offsetY);
}

// ===========================
// CLEAR CANVAS
// ===========================
function clearCanvas() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    document.getElementById("output").innerText = "";
}

// ===========================
// PREDICT DRAWING
// ===========================
async function predictDrawing() {

    let imageData = ctx.getImageData(0, 0, 280, 280);

    let tensor = tf.browser.fromPixels(imageData, 1);
    tensor = tf.image.resizeBilinear(tensor, [28, 28]);
    tensor = tensor.div(255.0);
    tensor = tensor.reshape([1, 28, 28, 1]);

    let prediction = model.predict(tensor);
    let result = prediction.argMax(1).dataSync()[0];

    document.getElementById("output").innerText =
        "Predicted Digit: " + result;
}