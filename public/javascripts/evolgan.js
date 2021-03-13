'use strict';

class EvolGan {
  constructor() {
    this.zis = undefined;
    this.worker = new Worker('/javascripts/evolgan_worker.js');
  }

  mean(indices) {
    const zis = this.zis.arraySync();
    this.zis = tf.tensor(indices.map(index => zis[index])).mean(0, true);
  }
  
  replicate(lambda) {
    this.zis = this.zis.tile([lambda, 1]);
  }
  
  mutate(bound) {
    const b = 1 / bound;
    const zis = this.zis.arraySync();
    // TODO: More efficient way to do this mutate loop ?
    for (const [i, z] of zis.entries()) {
      for (const [j, _] of z.entries()) {
        if (Math.random() < b) {
          zis[i][j] = tf.randomNormal([1]).dataSync()[0];
        }
      }
    }
    this.zis = tf.tensor(zis);
  }

  work(model) {
    this.worker.postMessage({
      model: model,
      zis: this.zis.arraySync()
    });
  }

  reset(model, lambda) {
    this.zis = tf.randomNormal([lambda, 512]);
    this.work(model);
  }

  update(model, lambda, bound, indices) {
    this.mean(indices);
    this.replicate(lambda);
    this.mutate(bound);
    this.work(model);
  }
}
