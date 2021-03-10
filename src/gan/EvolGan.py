import torch
import numpy as np
import torchvision

class EvolGan():
    ''' EvolGAN
    '''

    OUT_Z = 'out_z.pt'
    OUT_ZIS = 'out_zis.pt'
    OUT_IMG_PRE = 'out_img_'
    OUT_IMG_EXT = 'png'

    def __init__(self, llambda, bound, model, outdir, z):
        self.llambda = llambda
        self.bound = 1 / bound
        self.gan = torch.hub.load(
            'facebookresearch/pytorch_GAN_zoo:hub',
            'PGAN',
            model_name=model,
            pretrained=True,
            useGPU=False
        )
        self.outdir = outdir
        self.z = torch.load(f'{outdir}/{EvolGan.OUT_Z}') if z else torch.randn((1, 512))

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
            images = self.gan.test(zis)
        return zis, images
        
    def saveImages(self, zis, images):
        for n, img in enumerate(images):
            torchvision.utils.save_image(img, f'{self.outdir}/{EvolGan.OUT_IMG_PRE}{n}.{EvolGan.OUT_IMG_EXT}')
        torch.save(zis, f'{self.outdir}/{EvolGan.OUT_ZIS}')

    def updateZ(self, zis, indices):
        self.z = torch.mean(zis[indices], 0, True)
