const webcam = document.getElementById('webcam');
const output = document.getElementById('output');

let net;
let classifier;

// INIT FUNCTION (VERY IMPORTANT)
async function init() {

    // Start webcam
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    webcam.srcObject = stream;

    // Load MobileNet
    net = await mobilenet.load();

    // Create classifier
    classifier = knnClassifier.create();

    output.innerText = "✅ Model Loaded. Add Images!";
}

// Call init
init();

// ADD EXAMPLE
function addExample(label) {
    const img = tf.browser.fromPixels(webcam);

    const activation = net.infer(img, true);

    classifier.addExample(activation, label);

    output.innerText = "Added: " + label;
}

// PREDICT LOOP
async function predict() {

    if (classifier.getNumClasses() === 0) {
        alert("Add training examples first!");
        return;
    }

    while (true) {
        const img = tf.browser.fromPixels(webcam);
        const activation = net.infer(img, true);

        const result = await classifier.predictClass(activation);

        output.innerText =
            `Prediction: ${result.label} 
Confidence: ${(result.confidences[result.label] * 100).toFixed(2)}%`;

        await tf.nextFrame(); // prevents freeze
    }
}