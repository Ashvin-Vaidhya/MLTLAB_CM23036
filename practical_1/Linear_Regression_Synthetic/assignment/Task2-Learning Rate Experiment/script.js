function generateData() {
  let x = [];
  let y = [];

  for (let i = 1; i <= 20; i++) {
    x.push(i);
    // y = 2x + 1 + noise
    y.push(2 * i + 1 + (Math.random() * 4 - 2));
  }
  return { x, y };
}

async function trainModel(lr, xData, yData) {

  const xs = tf.tensor2d(xData, [xData.length, 1], 'float32');
  const ys = tf.tensor2d(yData, [yData.length, 1], 'float32');

  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({
    optimizer: tf.train.adam(lr),
    loss: 'meanSquaredError'
  });

  let losses = [];

  await model.fit(xs, ys, {
    epochs: 80,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        losses.push(logs.loss);
      }
    }
  });

  // Print learned weight
  const weight = model.getWeights()[0].dataSync()[0];
  console.log(`Learning Rate ${lr} Final Weight: ${weight}`);

  return losses;
}

async function run() {

  const { x, y } = generateData();

  const lrSmall = await trainModel(0.0005, x, y);
  const lrMedium = await trainModel(0.005, x, y);
  const lrLarge = await trainModel(0.05, x, y);

  const ctx = document.getElementById('lossChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 80 }, (_, i) => i + 1),
      datasets: [
        { label: 'LR 0.0005', data: lrSmall, fill: false },
        { label: 'LR 0.005', data: lrMedium, fill: false },
        { label: 'LR 0.05', data: lrLarge, fill: false }
      ]
    },
    options: {
      responsive: false,
      scales: {
        x: { title: { display: true, text: 'Epochs' } },
        y: { title: { display: true, text: 'Loss' } }
      }
    }
  });
}

run();
