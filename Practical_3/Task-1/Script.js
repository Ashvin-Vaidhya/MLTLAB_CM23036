// Training dataset

const trainingData = [

{ text: "I love this product", label: "positive" },
{ text: "This movie is amazing", label: "positive" },
{ text: "The service was excellent", label: "positive" },
{ text: "I am very happy today", label: "positive" },
{ text: "This food tastes great", label: "positive" },

{ text: "I hate this product", label: "negative" },
{ text: "This movie is terrible", label: "negative" },
{ text: "The service was awful", label: "negative" },
{ text: "I am very disappointed", label: "negative" },
{ text: "This food tastes bad", label: "negative" }

];


// dictionary word lists

const positiveWords = [
"good","great","excellent","amazing","awesome","fantastic",
"wonderful","perfect","nice","beautiful","happy","love"
];

const negativeWords = [
"bad","worst","terrible","awful","horrible",
"hate","sad","angry","boring","disappointing"
];


// frequency objects (for training)

let positiveFreq = {};
let negativeFreq = {};


// training process

trainingData.forEach(item => {

let words = item.text.toLowerCase().split(" ");

if(item.label === "positive"){

words.forEach(word => {

positiveFreq[word] = (positiveFreq[word] || 0) + 1;

});

}

else{

words.forEach(word => {

negativeFreq[word] = (negativeFreq[word] || 0) + 1;

});

}

});


// prediction function

function predictSentiment(sentence){

let words = sentence.toLowerCase().split(" ");

let posScore = 0;
let negScore = 0;

words.forEach(word => {

if(positiveWords.includes(word)) posScore++;

if(negativeWords.includes(word)) negScore++;

if(positiveFreq[word]) posScore += positiveFreq[word];

if(negativeFreq[word]) negScore += negativeFreq[word];

});

if(posScore > negScore) return "Positive 😊";

if(negScore > posScore) return "Negative 😞";

return "Neutral 😐";

}


// button event

document.getElementById("analyzeBtn").addEventListener("click", function(){

let text = document.getElementById("textInput").value;

let sentiment = predictSentiment(text);

document.getElementById("result").innerHTML = "Sentiment: " + sentiment;

});