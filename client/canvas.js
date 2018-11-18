import seedrandom from "seedrandom";

const canvas = document.createElement('canvas'),
      ctx = canvas.getContext("2d");
canvas.width = canvas.height = maxSize;
ctx.imageSmoothingEnabled = false;

let hue, rot, pattern, time, posX, posY, rnd, rng;

export function reset(newSeed = Math.floor(Math.random() * 1000000)) {
  rng = seedrandom(newSeed);
  hue = random() * 360;
  rot = random() * 360;
  pattern = 1;
  time = 0;
  posX = new Array(64).map(() => 0);
  posY = new Array(64).map(() => 0);
  rnd = random() * 360 + 1;
}

export function draw(target) {
  time += 1;
  
  const buf = getFFT();
  const avr = buf.reduce((acc, val, id) => acc + val * id / buf.length) / buf.length / 2;
  const loud = Math.log10(avr);
  
  tracers.forEach(tracer => tracer.update(buf));
  const ts = tracers.map(t => t.value);
  
  if(tracers[3].var > 0.1 && tracers[3].var / 4 > random()) {
    pattern = Math.floor(random() * 5) + 1;
  }
  
  decay(2, 0);
  decay(-128 * ts[0] * maxSize / 2000, Math.PI * 2 / pattern + ts[1] * 0.3 - 0.13 - 6 * (pattern % 2));
  
  if(loud < 0.5) {
    fade((1 - loud / 0.5) * (1 - loud / 0.5));
  }
  
  rot += ts[1] / 10;
  
  posX.shift();
  posX.push(maxSize / 2 + Math.sin(rot) * (maxSize / 1.9 - ts[2] * maxSize / 5));
  posY.shift();
  posY.push(maxSize / 2 + Math.cos(rot) * (maxSize / 1.9 - ts[2] * maxSize / 5));
  
  drawLines();
  
  target.drawImage(canvas, (maxSize - width) / 2, (maxSize - height) / 2, width, height, 0, 0, width, height);
}


