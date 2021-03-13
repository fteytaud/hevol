importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs");

async function generate(model, zis) {
  // Load model
  const gan =  await tf.loadGraphModel(`/models/${model}/model.json`);
  // Generate images (1 by 1)
  for (const [i, z] of tf.tensor(zis).unstack().entries()) {
    // Predict
    const y = gan.predict(z.expandDims(0));
    // From: https://pytorch.org/vision/stable/_modules/torchvision/utils.html#save_image
    const image = await tf.browser.toPixels(
      y.squeeze().mul(255).add(0.5).clipByValue(0, 255).transpose([1, 2, 0])
       .cast('int32')
    );
    // Notify main thread
    postMessage({ i, image });
  }
}

onmessage = async function(message) {
  generate(message.data.model, message.data.zis);
}