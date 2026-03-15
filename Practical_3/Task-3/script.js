let denseModel;
let rnnModel;

const dataset = [
["i love this movie",1],
["this product is amazing",1],
["i feel happy today",1],
["this is a great service",1],
["wonderful experience",1],

["i hate this movie",0],
["this product is terrible",0],
["i feel sad today",0],
["this is a bad service",0],
["horrible experience",0]
];

const sentences = dataset.map(d=>d[0]);
const labels = dataset.map(d=>d[1]);

// vocabulary
let vocab = {};
let index = 1;

sentences.forEach(sentence=>{
sentence.split(" ").forEach(word=>{
if(!vocab[word]){
vocab[word] = index++;
}
});
});

// convert sentence to numbers
function encode(sentence){

let words = sentence.split(" ");
let sequence = words.map(word => vocab[word] || 0);

while(sequence.length < 6){
sequence.push(0);
}

return sequence.slice(0,6);
}

const xs = tf.tensor2d(sentences.map(s => encode(s)));
const ys = tf.tensor2d(labels,[labels.length,1]);

async function trainModels(){

// Dense Model
denseModel = tf.sequential();

denseModel.add(tf.layers.flatten({inputShape:[6]}));

denseModel.add(tf.layers.dense({units:16,activation:"relu"}));

denseModel.add(tf.layers.dense({units:1,activation:"sigmoid"}));

denseModel.compile({
optimizer:"adam",
loss:"binaryCrossentropy",
metrics:["accuracy"]
});

await denseModel.fit(xs,ys,{epochs:100});

let denseEval = denseModel.evaluate(xs,ys);
let denseAcc = (await denseEval[1].data())[0];

document.getElementById("denseAcc").innerText =
"Dense Accuracy: "+(denseAcc*100).toFixed(1)+"%";


// RNN Model
rnnModel = tf.sequential();

rnnModel.add(tf.layers.embedding({
inputDim:50,
outputDim:8,
inputLength:6
}));

rnnModel.add(tf.layers.simpleRNN({units:16}));

rnnModel.add(tf.layers.dense({units:1,activation:"sigmoid"}));

rnnModel.compile({
optimizer:"adam",
loss:"binaryCrossentropy",
metrics:["accuracy"]
});

await rnnModel.fit(xs,ys,{epochs:100});

let rnnEval = rnnModel.evaluate(xs,ys);
let rnnAcc = (await rnnEval[1].data())[0];

document.getElementById("rnnAcc").innerText =
"RNN Accuracy: "+(rnnAcc*100).toFixed(1)+"%";
}

async function predict(){

let text = document.getElementById("textInput").value.toLowerCase();

let sequence = encode(text);

let input = tf.tensor2d([sequence]);

let densePred = (await denseModel.predict(input).data())[0];
let rnnPred = (await rnnModel.predict(input).data())[0];

let denseSent = densePred > 0.5 ? "Positive 😊" : "Negative 😞";
let rnnSent = rnnPred > 0.5 ? "Positive 😊" : "Negative 😞";

document.getElementById("result").innerHTML =
`
Dense Prediction: ${denseSent} (${(densePred*100).toFixed(1)}%) <br>
RNN Prediction: ${rnnSent} (${(rnnPred*100).toFixed(1)}%)
`;
}