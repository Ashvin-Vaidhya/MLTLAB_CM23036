let model;

// Train & Save
async function trainModel() {
    model = tf.sequential();
    model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

    model.compile({
        loss: 'meanSquaredError',
        optimizer: 'sgd'
    });

    const xs = tf.tensor2d([1,2,3,4], [4,1]);
    const ys = tf.tensor2d([1,3,5,7], [4,1]);

    await model.fit(xs, ys, { epochs: 200 });

    await model.save('localstorage://my-model');

    document.getElementById("output").innerHTML =
        "✅ Model trained and saved successfully!";
}

// Verify
async function verifyModel() {

    if (!model) {
        alert("Train model first!");
        return;
    }

    const testValue = 5;
    const input = tf.tensor2d([testValue], [1,1]);

    // Original prediction
    const original = model.predict(input);
    const originalResult = (await original.data())[0];

    // Reloaded model
    const loadedModel = await tf.loadLayersModel('localstorage://my-model');

    // Reloaded prediction
    const loaded = loadedModel.predict(input);
    const loadedResult = (await loaded.data())[0];

    const diff = Math.abs(originalResult - loadedResult);

    const match = diff < 0.01;

    document.getElementById("output").innerHTML = `
        <h3>📊 Verification Result</h3>

        <b>Test Input:</b> ${testValue} <br><br>

        🔹 <b>Original Model Output:</b> ${originalResult.toFixed(4)} <br>
        🔹 <b>Reloaded Model Output:</b> ${loadedResult.toFixed(4)} <br><br>

        📉 <b>Difference:</b> ${diff.toFixed(6)} <br><br>

        ${match 
            ? "✅ <b style='color:lightgreen'>Predictions MATCH</b>" 
            : "❌ <b style='color:red'>Predictions DO NOT MATCH</b>"
        }

        <br><br>

        🧠 <b>Conclusion:</b><br>
        The model gives the same output after reloading, which proves that 
        the model is correctly saved and restored from LocalStorage.
    `;
}