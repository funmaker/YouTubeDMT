
export default class Tracer {
  constructor(pos, decay = 100) {
    this.pos = pos;
    this.decay = decay;
    this.min = 0;
    this.max = 0;
    this.var = 0;
  }
  
  update(buf) {
    const val = buf[Math.floor(buf.length * this.pos)];
    this.var = 0;
    
    if(val > this.max) {
      this.var += (val - this.max) / (this.max - this.min);
      this.max = val;
    } else this.max += (val - this.max) / this.decay;
    
    if(val < this.min) {
      this.var += (this.min - val) / (this.max - this.min);
      this.min = val;
    } else this.min += (val - this.min) / this.decay;
    
    this.value = (val - this.min) / (this.max - this.min);
    if(Number.isNaN(this.value)) this.value = 0.5;
    
    if(Number.isNaN(this.var)) this.var = 0;
    
    return this.value;
  }
}

