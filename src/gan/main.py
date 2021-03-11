# python main.py "generate" '{\"llambda\": 10, \"bound\": 512, \"model\": \"celeba\", \"outdir\": \"out\", \"z\": false }'
# python main.py "update" '{\"outdir\": \"out\", \"indices\": [0, 1, 2, 3, 4] }'

import sys
import json
import torch
from torchsummary import summary

from EvolGan import EvolGan

def generate(llambda, bound, model, outdir, z, **_):
    evolgan = EvolGan(llambda, bound, model, outdir, z)
    evolgan.generateImages()

def update(outdir, indices, **_):
    zis = torch.load(f'{outdir}/{EvolGan.OUT_ZIS}')
    z = torch.mean(zis[indices], 0, True)
    torch.save(z, f'{outdir}/{EvolGan.OUT_Z}')

def save(llambda, bound, model, outdir, z, **_):
    evolgan = EvolGan(llambda, bound, model, outdir, z)
    torch.save(evolgan.gan.netG.state_dict(), 'evolgan_netG.pt')

def main():
    # kwargs
    action = sys.argv[1]
    kwargs = json.loads(sys.argv[2])
    # run
    if action == 'generate': return generate(**kwargs)
    if action == 'update': return update(**kwargs)
    if action == 'save': return test(**kwargs)

if __name__ == '__main__':
    main()
