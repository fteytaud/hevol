import sys
import json
import torch
import numpy as np
import matplotlib.pyplot as plt
import torchvision

class EvolGan():
    ''' EvolGAN
    '''

    def __init__(self, mu=5, llambda=25, bound=512, model='celeba', z=None, outdir='out', **_):
        self.mu = mu
        self.llambda = llambda
        self.bound = 1 / bound
        self.gan = torch.hub.load(
            'facebookresearch/pytorch_GAN_zoo:hub',
            'PGAN',
            model_name=model,
            pretrained=True,
            useGPU=False,
        )
        self.z = torch.load(z) if z else torch.randn((1, 512))
        self.outdir = outdir

    def generateZis(self):
        zis = torch.cat(self.llambda * [self.z])
        for i in range(zis.shape[0]):
            for j in range(zis.shape[1]):
                rnd = np.random.random()
                if rnd < self.bound:
                    zis[i, j] = torch.randn((1, 1))
        return zis

    def generateImages(self):
        zis = self.generateZis()
        with torch.no_grad():
            generated_images = self.gan.test(zis)
        return zis, generated_images

    def saveImages(self, generated_images):
        for n, img in enumerate(generated_images):
            torchvision.utils.save_image(img, f'{self.outdir}/out_img_{n}.png')

    def updateZ(self, zis, indices):
        self.z = torch.mean(zis[indices], 0, True)

    def saveZ(self):
        torch.save(self.z, f'{self.outdir}/out_z.pt')

def main():
    # args
    args = json.loads(sys.argv[1])

    # evolgan
    evolgan = EvolGan(**args)
    zis, images = evolgan.generateImages()
    evolgan.saveImages(images)
    evolgan.updateZ(zis, args['select'])
    evolgan.saveZ()

if __name__ == '__main__':
    main()
