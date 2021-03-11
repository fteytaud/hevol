import torch

def main():
    gan = torch.hub.load(
        'facebookresearch/pytorch_GAN_zoo:hub',
        'PGAN',
        model_name='celebAHQ-256',
        pretrained=True,
        useGPU=False
    )
    gan.netG.eval()
    dummy_input = torch.zeros(1, 512)
    torch.onnx.export(gan.netG, dummy_input, 'onnx_evolgan_netG.onnx', verbose=True)

if __name__ == '__main__':
    main()