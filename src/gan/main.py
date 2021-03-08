import torch
import numpy as np
import matplotlib.pyplot as plt
import torchvision


class EvolGan():
    """ EvolGAN
    """

    def __init__(self):
        self.mu = 5
        self.llambda = 10
        self.gan = torch.hub.load(
            "facebookresearch/pytorch_GAN_zoo:hub",
            "PGAN",
            model_name="celebAHQ-512",
            #model_name="celeba",
            #model_name="DTD",
            pretrained=True,
            useGPU=False,
        )
        self.z = torch.randn((1, 512))

    def generateZis(self):
        zis = torch.cat(self.llambda * [self.z])
        bound = 1 / 512
        for i in range(zis.shape[0]):
            for j in range(zis.shape[1]):
                rnd = np.random.random()
                if rnd < bound:
                    zis[i, j] = torch.randn((1, 1))
        return zis

    def generateImages(self):
        zis = self.generateZis()
        #zis, _ = self.gan.buildNoiseData(10)
        #print(zis.mean())
        #print(torch.randn((10, 512)).mean())
        with torch.no_grad():
            generated_images = self.gan.test(zis)
        return zis, generated_images

    def plotImages(self, generated_images):
        grid = torchvision.utils.make_grid(generated_images.clamp(min=-1, max=1), scale_each=True, normalize=True)
        plt.imshow(grid.permute(1, 2, 0).cpu().numpy())
        plt.savefig('test.png')
        plt.show()
        # self.importDataset('tutures/', 'tutures')

    def updateZ(self, zis, indices):
        print(zis[indices].shape)
        self.z = torch.mean(zis[indices], 0, True)


def main():
    evolgan = EvolGan()
    print("generating images ...")
    zis, images = evolgan.generateImages()
    print("images generated, plotting ...")
    evolgan.plotImages(images)
    evolgan.updateZ(zis, [0, 1, 2, 3, 4])
    print("generating images ...")
    zis, images = evolgan.generateImages()
    print("images generated, plotting ...")
    evolgan.plotImages(images)

    # pgan_model = torch.hub.load(
    #     "facebookresearch/pytorch_GAN_zoo:hub",
    #     "PGAN",
    #     model_name="celebAHQ-512",
    #     pretrained=True,
    #     useGPU=False,
    # )
    # num_images = 15
    # noise, _ = pgan_model.buildNoiseData(num_images)
    # print(noise)
    # print(noise.shape)
    # with torch.no_grad():
    #     generated_images = pgan_model.test(noise)
    #
    # grid = torchvision.utils.make_grid(generated_images.clamp(min=-1, max=1), scale_each=True, normalize=True)
    # plt.imshow(grid.permute(1, 2, 0).cpu().numpy())
    # plt.show()


if __name__ == '__main__':
    main()
