# [09:15, 06/03/2021] Olivier Teytaud: Genre premiere population on tire au sort 25 z: z1,z2,...,z25.
# [09:15, 06/03/2021] Olivier Teytaud: Chaque zi est un vecteur gaussien de 256 reels.
# [09:15, 06/03/2021] Olivier Teytaud: Chaque zi donne une image Ii=G(zi).
# [09:16, 06/03/2021] Olivier Teytaud: L'humain choisit les 5 meilleures, disons z2, z3, z7, z11, z20.
# [09:16, 06/03/2021] Olivier Teytaud: on fait z* = moyenne(z2,z3,z7,z11,z20)
# [09:16, 06/03/2021] Olivier Teytaud: On genere a nouveau 25 zi:
# [09:17, 06/03/2021] Olivier Teytaud: z1=mutation(z*), z2=mutation(z*), ..., z25=mutation(z*).
# [09:19, 06/03/2021] Olivier Teytaud: avec "mutation(z*)_i = random if rand<1/256 else z*_i "


import torch
import numpy as np
import matplotlib.pyplot as plt
import torchvision


class EvolGan():
    """ EvolGAN
    """

    def __init__(self):
        self.mu = 5
        self.llambda = 25
        self.gan = torch.hub.load(
            "facebookresearch/pytorch_GAN_zoo:hub",
            "PGAN",
            model_name="celebAHQ-512",
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
        with torch.no_grad():
            generated_images = self.gan.test(zis)
        return zis, generated_images

    def plotImages(self, generated_images):
        grid = torchvision.utils.make_grid(generated_images)#.clamp(min=-1, max=1), scale_each=False, normalize=True)
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
    print('Hello')
    main()
