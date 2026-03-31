let model;

function showLoader(show) {
    document.getElementById("loader").style.display = show ? "block" : "none";
}

// TRAIN MODEL
async function trainModel() {
    showLoader(true);
    document.getElementById("status").innerText = "Training model...";

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

    showLoader(false);
    document.getElementById("status").innerText = "✅ Model trained & saved!";
}

// LOAD MODEL
async function loadModel() {
    showLoader(true);
    document.getElementById("status").innerText = "Loading model...";

    model = await tf.loadLayersModel('localstorage://my-model');

    showLoader(false);
    document.getElementById("status").innerText = "✅ Model loaded!";
}

// PREDICT
async function predict() {
    const value = document.getElementById("inputValue").value;

    if (!model) {
        alert("Train or load model first!");
        return;
    }

    if (value === "") {
        alert("Enter a value!");
        return;
    }

    showLoader(true);
    document.getElementById("status").innerText = "Predicting...";

    const input = tf.tensor2d([Number(value)], [1,1]);
    const output = model.predict(input);
    const result = await output.data();

    showLoader(false);

    const predicted = result[0].toFixed(2);

    document.getElementById("output").innerHTML = `
        📌 Input Value (x): <b>${value}</b><br>
        📊 Predicted Output (y): <b>${predicted}</b><br><br>
        
        🧠 Basis of Prediction:<br>
        Model learned relationship → <b>y = 2x - 1</b><br>
        
        🔍 Explanation:<br>
        For x = ${value},<br>
        y ≈ 2 × ${value} - 1 = ${2 * value - 1}
    `;
}