let model = null;

// Load model
async function loadModel() {
    try {
        document.getElementById("status").innerText = "⏳ Loading Model...";

        model = await tf.loadLayersModel('./model/model.json');

        document.getElementById("status").innerText = "✅ Model Loaded";

    } catch (error) {
        console.error("LOAD ERROR:", error);

        document.getElementById("status").innerText =
            "❌ Model not found / path error";
    }
}

loadModel();

// Predict
async function predict() {

    if (!model) {
        alert("❌ Model not loaded!");
        return;
    }

    let x = document.getElementById("inputX").value;

    if (x === "") {
        document.getElementById("result").innerText = "⚠️ Enter value!";
        return;
    }

    let input = tf.tensor2d([parseFloat(x)], [1, 1]);

    let output = model.predict(input);
    let result = await output.data();

    document.getElementById("result").innerText =
        "📊 Prediction: " + result[0].toFixed(2);

    tf.dispose([input, output]);
}