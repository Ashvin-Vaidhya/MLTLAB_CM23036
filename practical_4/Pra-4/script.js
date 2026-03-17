let model;

// Load MobileNet when page starts
async function loadModel() {
  document.getElementById('result').innerText = "Loading MobileNet model...";
  model = await mobilenet.load();
  document.getElementById('result').innerText = "Model loaded. Click 'Classify Image'.";
}

// Classify image
async function classifyImage() {
  if (!model) {
    document.getElementById('result').innerText = "Model not loaded yet!";
    return;
  }

  const image = document.getElementById('myImage');
  const predictions = await model.classify(image);

  // Format output
  let output = predictions.map(p =>
    `${p.className} - ${(p.probability * 100).toFixed(2)}%`
  ).join('<br>');

  document.getElementById('result').innerHTML = output;
}

// Run on page load
loadModel();