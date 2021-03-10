function check_num(num, min, max) {
  return Math.min(Math.max(parseInt(num), min), max);
}

function check_model(model) {
  return (config.params.models.includes(model) ?
    model : config.params.models[0]
  );
}

function check_indices(indices, count) {
  return indices.map(indice => check_num(indice, 0, count - 1));
}

const config = {

  out: {
    fulldir: 'public/out',
    dir: 'out',
    z: 'out_z.pt',
    zis: 'out_zis.pt',
    img_pre: 'out_img_',
    img_ext: 'png'
  },

  params: {
    models: ['celeba', 'celebAHQ-256', 'celebAHQ-512'],
    llambda_min: 5,
    llambda_max: 25,
    bound_min: 1,
    bound_max: 512
  },

  py: {
    mode: 'text',
    path: process.env.PYTHON_PATH || 'C:\\Users\\Flo\\anaconda3\\envs\\playwithgan\\python',
    script: 'src/gan/',
    main: 'main.py'
  },

  check: {
    model: check_model,
    num: check_num,
    indices: check_indices
  }
};

module.exports = config;
