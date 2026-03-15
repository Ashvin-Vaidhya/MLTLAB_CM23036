document.addEventListener("DOMContentLoaded", () => {

const button = document.getElementById("analyzeBtn");
button.addEventListener("click", analyzeSentiment);

});

function analyzeSentiment(){

let text = document.getElementById("textInput").value.toLowerCase();

const positiveWords = ["good","great","excellent","amazing","awesome","fantastic","wonderful","brilliant","perfect","nice",
"beautiful","pretty","smart","intelligent","lovely","attractive","positive","happy","joyful","delightful",
"pleased","satisfied","excited","enthusiastic","cheerful","optimistic","calm","peaceful","kind","friendly",
"helpful","generous","honest","loyal","trustworthy","reliable","strong","confident","creative","talented",
"skillful","successful","victorious","inspiring","motivated","passionate","energetic","vibrant","lively","charming",
"graceful","elegant","stylish","impressive","remarkable","outstanding","spectacular","marvelous","magnificent","superb",
"excellent","fabulous","glorious","legendary","phenomenal","splendid","thrilling","delicious","tasty","fresh",
"sweet","comforting","satisfying","amusing","funny","entertaining","engaging","interesting","fascinating","captivating",
"cool","awesome","epic","adorable","cute","blessed","grateful","hopeful","successful","productive",
"efficient","effective","smooth","clean","safe","secure","stable","bright","radiant","warm",
"loving","caring","supportive","encouraging","respectful","honorable","polite","generous","cooperative","helpful",
"innovative","powerful","dynamic","progressive","excellent","valuable","worthy","lucky","fortunate","pleasant"
];

const negativeWords = ["bad","worst","terrible","awful","horrible","poor","ugly","disappointing","sad","angry",
"hate","annoying","frustrating","boring","dull","stupid","ridiculous","nonsense","useless","worthless",
"weak","lazy","careless","reckless","selfish","rude","arrogant","ignorant","dishonest","untrustworthy",
"unreliable","fake","false","cheating","corrupt","dangerous","harmful","toxic","violent","aggressive",
"hostile","mean","cruel","heartless","cold","gloomy","depressing","stressful","tiring","exhausting",
"messy","dirty","noisy","chaotic","confusing","complicated","broken","damaged","faulty","defective",
"slow","late","delayed","unfair","unjust","negative","pessimistic","hopeless","miserable","painful",
"unpleasant","scary","frightening","terrifying","disgusting","gross","nasty","filthy","pathetic","embarrassing",
"shameful","awkward","clumsy","weak","fragile","unstable","risky","harmful","useless","ineffective",
"inefficient","unproductive","expensive","overpriced","cheap","inferior","mediocre","lousy","terrible","horrendous",
"tragic","disastrous","catastrophic","regretful","unlucky","unfortunate","problematic","troublesome","irritating","annoying"
];

let score = 0;

let words = text.split(" ");

words.forEach(word=>{
if(positiveWords.includes(word)) score++;
if(negativeWords.includes(word)) score--;
});

let result;

if(score > 0)
result = "Positive 😊";
else if(score < 0)
result = "Negative 😞";
else
result = "Neutral 😐";

document.getElementById("result").innerHTML =
"Sentiment: " + result;

}