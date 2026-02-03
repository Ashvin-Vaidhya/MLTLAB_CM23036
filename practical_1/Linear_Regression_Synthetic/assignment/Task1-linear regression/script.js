async function run() {

  // -------- Synthetic Data (y = 2x + 1) --------
  const xData = [1, 2, 3, 4, 5, 6, 7, 8];
  const yData = xData.map(x => 2 * x + 1);

  const xs = tf.tensor2d(xData, [xData.length, 1], 'float32');
  const ys = tf.tensor2d(yData, [yData.length, 1], 'float32');

  // -------- Model --------
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({
    optimizer: tf.train.sgd(0.01),
    loss: 'meanSquaredError'
  });

  // -------- Train --------
  await model.fit(xs, ys, {
    epochs: 200,
    callbacks: {
      onEpochEnd: (e, l) => console.log(`Epoch ${e}: Loss ${l.loss}`)
    }
  });

  // -------- Predict --------
  const predsTensor = model.predict(xs);
  const preds = Array.from(predsTensor.dataSync());

  // -------- Plot --------
  const ctx = document.getElementById('myChart').getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: xData,
      datasets: [
        {
          label: 'Actual',
          data: yData,
          borderWidth: 2,
          fill: false
        },
        {
          label: 'Predicted',
          data: preds,
          borderWidth: 2,
          fill: false
        }
      ]
    },
    options: {
      responsive: false,
      scales: {
        x: { title: { display: true, text: 'X Values' } },
        y: { title: { display: true, text: 'Y Values' } }
      }
    }
  });
}

run();
