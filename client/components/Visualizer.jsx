import React from "react";
import seedrandom from "seedrandom";
import Tracer from "../helpers/Tracer";

export default class Visualizer extends React.Component {
  constructor(props) {
    super(props);
    
    this.canvas = null;
    this.ctx = null;
    this.output = null;
    this.width = null;
    this.height = null;
    this.minSize = null;
    this.maxSize = null;
    
    this.draw = this.draw.bind(this);
  }
  
  componentDidUpdate(prevProps) {
    if(prevProps.seed !== this.props.seed && !this.props.loading) {
      this.reset();
    }
  }
  
  componentDidMount() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext("2d");
    
    this.reset();
    this.resizeCanvas();
    
    window.requestAnimationFrame(this.draw);
  }
  
  componentWillUnmount() {
    window.cancelAnimationFrame(this.draw);
  }
  
  reset() { 
    // These are realtime variables, they have nothing to do with DOM so we need no react state
    this.rng = seedrandom(this.props.seed);
    this.hue = this.rng() * 360;
    this.rot = this.rng() * 360;
    this.direction = 1;
    this.pattern = 2;
    this.time = 0;
    this.posX = new Array(64).map(() => 0);
    this.posY = new Array(64).map(() => 0);
    this.rnd = this.rng() * 360 + 1;
    this.tracers = [
      new Tracer(0.15),
      new Tracer(0.2),
      new Tracer(0.3),
      new Tracer(0.25),
    ];
    this.lastDraw = performance.now();
    this.delta = 0;
    this.smoothDelta = 0;
  }
  
  decay(spread, rotate) {
    this.ctx.save();
    this.ctx.translate(this.maxSize / 2, this.maxSize / 2);
    this.ctx.rotate(rotate);
    this.ctx.drawImage(this.canvas, -spread / 2 - this.maxSize / 2, -spread / 2 - this.maxSize / 2, this.maxSize + spread, this.maxSize + spread);
    this.ctx.restore();
  }
  
  fade(alpha) {
    if(!Number.isFinite(alpha) || Number.isNaN(alpha)) alpha = 255;
  
    this.ctx.globalCompositeOperation = "darken";
    this.ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    this.ctx.fillRect(0, 0, this.maxSize, this.maxSize);
  
    this.ctx.globalCompositeOperation = "source-over";
  }
  
  drawLines() {
    const width = this.maxSize * this.smoothDelta / 4;
    this.ctx.lineCap = "round";
    this.ctx.lineWidth = width;
    
    for(let i = 64; i > 0; i--) {
      this.ctx.beginPath();
      this.ctx.moveTo(this.posX[i - 1], this.posY[i - 1]);
      this.ctx.lineTo(this.posX[i], this.posY[i]);
      
      const a = (this.posX[i] - this.posX[i - 1]) || 1;
      const b = (this.posY[i] - this.posY[i - 1]) || 1;
      const hypotenuse = Math.sqrt((a * a) + (b * b || a * a)) / 2;
  
      this.hue = (-this.time * 10) + (i * 2) + (hypotenuse * 2) + this.rnd;
      this.ctx.strokeStyle = `hsla(${this.hue},  100%, 50%, 1)`;
      this.ctx.lineWidth = Math.max(width - (hypotenuse / 6), 2);
      this.ctx.stroke();
    }
  }
  
  resizeCanvas() {
    const outCan = this.output.canvas;
    
    if(outCan.clientWidth !== outCan.width || outCan.clientHeight !== outCan.height || this.maxSize === null) {
      const canvasCopy = document.createElement("canvas"),
            ctxCopy = canvasCopy.getContext('2d'),
            oldMax = Math.max(outCan.width, outCan.height);
      canvasCopy.width = oldMax;
      canvasCopy.height = oldMax;
      ctxCopy.drawImage(this.canvas, 0, 0);
  
      this.width = window.innerWidth;
      this.height = window.innerHeight;
      this.minSize = Math.min(this.width, this.height);
      this.maxSize = Math.max(this.width, this.height);
      this.canvas.width = this.canvas.height = this.maxSize;
      //this.ctx.imageSmoothingEnabled = this.ctx.webkitImageSmoothingEnabled = this.ctx.mozImageSmoothingEnabled = this.ctx.msImageSmoothingEnabled = this.ctx.oImageSmoothingEnabled = false;
      outCan.width = this.width;
      outCan.height = this.height;
  
      this.ctx.drawImage(canvasCopy, 0, 0, oldMax, oldMax, 0, 0, this.maxSize, this.maxSize);
    }
  }
  
  draw() {
    window.requestAnimationFrame(this.draw);
    if(!this.output) return;
    
    this.resizeCanvas();
    
    const buf = this.props.getFFT();
    if(buf === null) return;
    
    const now = performance.now();
    const delta = this.delta = (now - this.lastDraw) / 1000;
    this.smoothDelta += (delta - this.smoothDelta) / 100;
    this.time += delta;
    this.lastDraw = now;
    
    const avr = buf.reduce((acc, val, id) => acc + val * id / buf.length) / buf.length / 2;
    const loud = Math.log10(avr);
  
    this.tracers.forEach(tracer => tracer.update(buf, 10 / delta));
    const ts = this.tracers.map(t => t.value);
    
    if(this.tracers[3].var > 0.1 && this.tracers[3].var / 4 > this.rng()) {
      this.pattern = Math.floor(this.rng() * 4) + 2;
    }
    
    this.decay(60 * delta, 0);
    this.decay(-1 * ts[0] * this.maxSize * delta, Math.PI * 2 / this.pattern + ts[1] * 0.3 - 0.13 - 6 * (this.pattern % 2));
    
    if(loud < 0.5) {
      this.fade((1 - loud / 0.5) * (1 - loud / 0.5) / 4);
    } else {
      const width = this.maxSize / 100;
      this.ctx.lineCap = "round";
      this.ctx.lineWidth = width;
      this.ctx.strokeStyle = `rgba(0, 0, 0, 0.4)`;
      this.ctx.strokeRect(0, 0, this.maxSize, this.maxSize);
    }
    
    this.rot += ts[1] * delta * this.direction;
  
    if(!this.lastLine || this.time - this.lastLine > 1 / 35) {
      this.lastLine = this.time;
      this.posX.shift();
      this.posX.push(this.maxSize / 2 + Math.sin(this.rot) * (this.maxSize / 1.9 - ts[2] * this.maxSize / 5));
      this.posY.shift();
      this.posY.push(this.maxSize / 2 + Math.cos(this.rot) * (this.maxSize / 1.9 - ts[2] * this.maxSize / 5));
    }
    this.drawLines();
    
    this.output.drawImage(this.canvas, (this.maxSize - this.width) / 2, (this.maxSize - this.height) / 2, this.width, this.height, 0, 0, this.width, this.height);
  }
  
  render() {
    return <canvas id="fullscreenTarget" ref={canvas => {this.output = canvas && canvas.getContext("2d")}} />;
  }
}
