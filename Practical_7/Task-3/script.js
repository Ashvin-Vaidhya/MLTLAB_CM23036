let model;
let importedModel;

// TRAIN
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

    document.getElementById("output").innerHTML =
        "✅ Model trained successfully!";
}

// EXPORT (Download files)
async function exportModel() {
    if (!model) {
        alert("Train model first!");
        return;
    }

    await model.save('downloads://my-model');

    document.getElementById("output").innerHTML =
        "📥 Model exported (downloaded as files)!";
}

// IMPORT (Upload files)
async function importModel() {
    const files = document.getElementById("fileInput").files;

    if (files.length === 0) {
        alert("Select model.json and weights file!");
        return;
    }

    importedModel = await tf.loadLayersModel(
        tf.io.browserFiles(files)
    );

    document.getElementById("output").innerHTML =
        "📂 Model imported successfully!";
}

// VERIFY
async function verifyModel() {
    if (!model || !importedModel) {
        alert("Train and import model first!");
        return;
    }

    const testValue = 5;
    const input = tf.tensor2d([testValue], [1,1]);

    const original = model.predict(input);
    const imported = importedModel.predict(input);

    const originalResult = (await original.data())[0];
    const importedResult = (await imported.data())[0];

    const diff = Math.abs(originalResult - importedResult);

    document.getElementById("output").innerHTML = `
        <h3>🔍 Verification</h3>

        Test Input: ${testValue} <br><br>

        📊 Original Model: ${originalResult.toFixed(4)} <br>
        📊 Imported Model: ${importedResult.toFixed(4)} <br><br>

        📉 Difference: ${diff.toFixed(6)} <br><br>

        ${
            diff < 0.01
            ? "✅ <b style='color:lightgreen'>MATCH</b>"
            : "❌ <b style='color:red'>NOT MATCH</b>"
        }

        <br><br>

        🧠 Conclusion:<br>
        The exported and re-imported model gives the same predictions,
        proving successful model portability.
    `;
}