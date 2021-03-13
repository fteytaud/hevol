import sys
import torch

def main():
    model = sys.argv[1]
    gan = torch.hub.load(
        'facebookresearch/pytorch_GAN_zoo:hub',
        'PGAN',
        model_name=model,
        pretrained=True,
        useGPU=False
    )
    gan.netG.eval()
    dummy_input = torch.zeros(1, 512)
    torch.onnx.export(gan.netG, dummy_input, f'{model}.onnx', verbose=True)

if __name__ == '__main__':
    main()