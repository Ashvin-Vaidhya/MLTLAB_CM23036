async function run() {

  // ---------- Training Data ----------
  const xTrain = [1, 2, 3, 4, 5];
  const yTrain = xTrain.map(x => 2 * x + 1); // y = 2x + 1

  const xs = tf.tensor2d(xTrain, [xTrain.length, 1]);
  const ys = tf.tensor2d(yTrain, [yTrain.length, 1]);

  // ---------- Model ----------
  const model = tf.sequential();
  model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

  model.compile({
    optimizer: tf.train.adam(0.05),
    loss: 'meanSquaredError'
  });

  // ---------- Train ----------
  await model.fit(xs, ys, { epochs: 250 });

  // ---------- Unseen Inputs ----------
  const xTest = [6, 7, 8, 9];
  const expected = xTest.map(x => 2 * x + 1);

  const predTensor = model.predict(tf.tensor2d(xTest, [xTest.length, 1]));
  const predicted = Array.from(predTensor.dataSync());

  // ---------- Console Comparison ----------
  console.log("X | Expected | Predicted | Error");
  for (let i = 0; i < xTest.length; i++) {
    let error = Math.abs(expected[i] - predicted[i]);
    console.log(
      `${xTest[i]} | ${expected[i]} | ${predicted[i].toFixed(2)} | ${error.toFixed(3)}`
    );
  }

  // ---------- Chart ----------
  const ctx = document.getElementById("chart").getContext("2d");

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: xTest,
      datasets: [
        {
          label: "Expected",
          data: expected
        },
        {
          label: "Predicted",
          data: predicted
        }
      ]
    },
    options: {
      responsive: false,
      scales: {
        x: { title: { display: true, text: "Unseen X Values" } },
        y: { title: { display: true, text: "Y Values" } }
      }
    }
  });
}

run();
