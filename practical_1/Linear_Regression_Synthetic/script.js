async function run() {

  // 1. Create Synthetic Data (y = 2x + 1)
  const xs = tf.tensor2d([1, 2, 3, 4, 5], [5, 1]);
  const ys = tf.tensor2d([3, 5, 7, 9, 11], [5, 1]);

  // 2. Build Model
  const model = tf.sequential();
  model.add(tf.layers.dense({
    units: 1,
    inputShape: [1]
  }));

  // 3. Compile Model
  model.compile({
    optimizer: tf.train.sgd(0.1),
    loss: 'meanSquaredError'
  });

  // 4. Train Model
  await model.fit(xs, ys, {
    epochs: 200,
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(`Epoch ${epoch}: Loss = ${logs.loss}`);
      }
    }
  });

  // 5. Predict
  const output = model.predict(tf.tensor2d([6], [1, 1]));
  output.print(); // Expected close to 13
}

// Run the regression
run();
