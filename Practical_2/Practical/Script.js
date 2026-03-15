console.log("Loading MNIST data...");

const IMAGE_SIZE = 784;
const NUM_CLASSES = 10;
const NUM_DATASET_ELEMENTS = 65000;

const MNIST_IMAGES_SPRITE =
  "https://storage.googleapis.com/learnjs-data/model-builder/mnist_images.png";
const MNIST_LABELS =
  "https://storage.googleapis.com/learnjs-data/model-builder/mnist_labels_uint8";

let datasetImages;
let datasetLabels;
let cnnModel;

async function loadMNIST() {
  const img = new Image();
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const imgRequest = new Promise((resolve) => {
    img.crossOrigin = "";
    img.onload = () => resolve();
    img.src = MNIST_IMAGES_SPRITE;
  });

  const labelsRequest = fetch(MNIST_LABELS).then(r => r.arrayBuffer());

  const [, labelsBuffer] = await Promise.all([imgRequest, labelsRequest]);
  datasetLabels = new Uint8Array(labelsBuffer);

  const { width, height } = img;
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  datasetImages = new Float32Array(NUM_DATASET_ELEMENTS * IMAGE_SIZE);

  let pixelIndex = 0;
  for (let i = 0; i < imageData.data.length; i += 4) {
    datasetImages[pixelIndex++] = imageData.data[i] / 255;
  }

  console.log("MNIST data loaded successfully");
}

function createCNNModel() {
  const model = tf.sequential();

  model.add(tf.layers.reshape({
    inputShape: [784],
    targetShape: [28, 28, 1]
  }));

  model.add(tf.layers.conv2d({ filters: 16, kernelSize: 3, activation: "relu" }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(tf.layers.conv2d({ filters: 32, kernelSize: 3, activation: "relu" }));
  model.add(tf.layers.maxPooling2d({ poolSize: 2 }));

  model.add(tf.layers.flatten());
  model.add(tf.layers.dense({ units: 128, activation: "relu" }));
  model.add(tf.layers.dense({ units: 10, activation: "softmax" }));

  model.compile({
    optimizer: "adam",
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
  });

  return model;
}

function getTrainTestData() {
  const TRAIN_SIZE = 55000;
  const TEST_SIZE = 10000;

  const trainImages = datasetImages.slice(0, TRAIN_SIZE * IMAGE_SIZE);
  const testImages = datasetImages.slice(TRAIN_SIZE * IMAGE_SIZE);

  const trainLabels = datasetLabels.slice(0, TRAIN_SIZE * NUM_CLASSES);
  const testLabels = datasetLabels.slice(TRAIN_SIZE * NUM_CLASSES);

  const xsTrain = tf.tensor2d(trainImages, [TRAIN_SIZE, IMAGE_SIZE]);
  const xsTest = tf.tensor2d(testImages, [TEST_SIZE, IMAGE_SIZE]);

  const ysTrain = tf.tensor2d(trainLabels, [TRAIN_SIZE, NUM_CLASSES]);
  const ysTest = tf.tensor2d(testLabels, [TEST_SIZE, NUM_CLASSES]);

  return { xsTrain, ysTrain, xsTest, ysTest };
}

async function trainCNN() {
  const { xsTrain, ysTrain, xsTest, ysTest } = getTrainTestData();

  console.log("Training started...");

  await cnnModel.fit(xsTrain, ysTrain, {
    epochs: 5,
    batchSize: 128,
    validationData: [xsTest, ysTest],
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        console.log(
          `Epoch ${epoch + 1}: Accuracy = ${(logs.acc * 100).toFixed(2)}%`
        );
      }
    }
  });

  const evalResult = cnnModel.evaluate(xsTest, ysTest);
  evalResult[1].print();

  console.log("Training completed");
}

async function run() {
  await loadMNIST();
  cnnModel = createCNNModel();
  cnnModel.summary();
  await trainCNN();
}

run();