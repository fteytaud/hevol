socket = io();
    
    newGAN.onclick = function() {
      params = { mu: 5, llambda: 10, bound: 512, model: 'celebAHQ-256' };
      socket.emit('new', params);
    };

    updateGAN.onclick = function() {
      indices = [];
      Array.from(images.querySelectorAll('img')).forEach((img, n)  => {
        if (img.classList.contains('active')) {
          indices.push(n);
        }
      });
      params = { mu: 5, llambda: 10, bound: 512, model: 'celebAHQ-256', indices: indices };
      socket.emit('update', params);
    }

    socket.on('generate', function(data) {
      t = new Date().getTime();
      res = '';
      for (let img=0; img<data.llambda; ++img) {
        res += `<img src="/out/${socket.id}/out_img_${img}.png?t=${t}" />`;
      }
      images.innerHTML = res;
      Array.from(images.querySelectorAll('img')).forEach(img => {
        img.onclick = function(e) {
          e.target.classList.toggle('active');
        }
      });
    });