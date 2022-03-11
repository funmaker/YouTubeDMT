
export default class Tracer {
  constructor(pos) {
    this.pos = pos;
    this.min = 0;
    this.max = 0;
    this.var = 0;
  }
  
  update(buf, decay) {
    const val = buf[Math.floor(buf.length * this.pos)];
    this.var = 0;
    
    if(val > this.max) {
      this.var += (val - this.max) / (this.max - this.min);
      this.max = val;
    } else this.max += (val - this.max) / decay;
    
    if(val < this.min) {
      this.var += (this.min - val) / (this.max - this.min);
      this.min = val;
    } else this.min += (val - this.min) / decay;
    
    this.value = (val - this.min) / (this.max - this.min);
    if(Number.isNaN(this.value)) this.value = 0.5;
    
    if(Number.isNaN(this.var)) this.var = 0;
    
    return this.value;
  }
}

