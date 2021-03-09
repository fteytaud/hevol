# python main.py "generate" '{\"mu\": 5, \"llambda\": 10, \"bound\": 512, \"model\": \"celeba\", \"outdir\": \"out\", \"z\": false }'
# python main.py "update" '{\"outdir\": \"out\", \"indices\": [0, 1, 2, 3, 4] }'

import sys
import json
import torch

from EvolGan import EvolGan

def generate(mu, llambda, bound, model, outdir, z):
    evolgan = EvolGan(mu, llambda, bound, model, outdir, z)
    zis, images = evolgan.generateImages()
    evolgan.saveImages(zis, images)

def update(outdir, indices):
    zis = torch.load(f'{outdir}/{EvolGan.OUT_ZIS}')
    z = torch.mean(zis[indices], 0, True)
    torch.save(z, f'{outdir}/{EvolGan.OUT_Z}')

def main():
    # kwargs
    action = sys.argv[1]
    kwargs = json.loads(sys.argv[2])
    # run
    if action == 'generate': return generate(**kwargs)
    if action == 'update': return update(**kwargs)

if __name__ == '__main__':
    main()
