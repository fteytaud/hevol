From: [source](https://medium.com/@pnitsan/exporting-and-running-a-deep-learning-model-in-the-browser-including-lstm-a-straight-forward-574a766ef1d6)

```sh
# convert PyTorch to ONNX
python convert.py celeba
python convert.py celebAHQ-256
python convert.py celebAHQ-512

# convert ONNX to TensorFlow
onnx-tf convert -i celeba.onnx -o celeba.pb
onnx-tf convert -i celebAHQ-256.onnx -o celebAHQ-256.pb
onnx-tf convert -i celebAHQ-512.onnx -o celebAHQ-512.pb

# convert TensorFlow to TensorFlowJS
tensorflowjs_wizard # ~/.local/bin/tensorflowjs_wizard
```