const positiveWords = [
"good","great","amazing","excellent","love","beautiful","nice",
"awesome","fantastic","perfect","happy","wonderful","best"
];

const negativeWords = [
"bad","terrible","awful","hate","sad","boring",
"worst","horrible","disappointing","ugly"
];

function analyze(){

let text = document.getElementById("textInput").value.toLowerCase();

text = text.replace(/[^\w\s]/g,"");

let words = text.split(/\s+/);

let pos = 0;
let neg = 0;

words.forEach(word => {

if(positiveWords.includes(word)) pos++;

if(negativeWords.includes(word)) neg++;

});

let sentiment;
let confidence;

let total = pos + neg;

if(total === 0){

sentiment = "Neutral 😐";
confidence = 0;

}

else if(pos > neg){

sentiment = "Positive 😊";
confidence = (pos / total) * 100;

}

else{

sentiment = "Negative 😞";
confidence = (neg / total) * 100;

}

document.getElementById("sentiment").innerHTML =
"Sentiment: " + sentiment;

document.getElementById("confidenceText").innerHTML =
"Confidence: " + confidence.toFixed(1) + "%";

document.getElementById("confidenceBar").style.width =
confidence + "%";

if(sentiment.includes("Positive"))
document.getElementById("confidenceBar").style.background="#22c55e";

else if(sentiment.includes("Negative"))
document.getElementById("confidenceBar").style.background="#ef4444";

else
document.getElementById("confidenceBar").style.background="#f59e0b";

}