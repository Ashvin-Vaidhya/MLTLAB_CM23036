
let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");
let model;
let draw = false;

ctx.lineWidth = 20;
ctx.lineCap = "round";
ctx.strokeStyle = "black";

canvas.onmousedown = () => draw = true;
canvas.onmouseup = () => draw = false;
canvas.onmousemove = e => {
  if (!draw) return;
  ctx.lineTo(e.offsetX, e.offsetY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(e.offsetX, e.offsetY);
};

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  document.getElementById("output").innerText = "Prediction: -";
}

/* ===== MODEL ===== */

async function loadModel() {
  model = tf.sequential();

  model.add(tf.layers.conv2d({
    inputShape: [28, 28, 1],
    filters: 8,
    kernelSize: 3,
    activation: 'relu'
  }));

  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));
  model.add(tf.layers.flatten());

  model.add(tf.layers.dense({
    units: 10,
    activation: 'softmax'
  }));

  model.compile({
    optimizer: 'adam',
    loss: 'categoricalCrossentropy'
  });

  const xs = tf.randomUniform([500, 28, 28, 1]);
  const labels = tf.randomUniform([500], 0, 10, 'int32');
  const ys = tf.oneHot(labels, 10);

  await model.fit(xs, ys, { epochs: 5 });
}

function preprocess() {
  let img = tf.browser.fromPixels(canvas, 1)
    .resizeNearestNeighbor([28, 28])
    .toFloat()
    .div(255)
    .expandDims(0);

  return tf.sub(1, img);
}

function predict() {
  if (!model) {
    alert("Model not ready");
    return;
  }
  const img = preprocess();
  const pred = model.predict(img);
  const digit = pred.argMax(1).dataSync()[0];

  document.getElementById("output").innerText =
    "Prediction: " + digit;
}

loadModel();
