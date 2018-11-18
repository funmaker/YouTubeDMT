import React from 'react'
import qs from "qs";
import {fetchInitialData, getInitialData} from "../helpers/initialData";
import Visualizer from "../components/Visualizer";
import Controls from "../components/Controls";

export default class IndexPage extends React.Component {
	constructor() {
		super();
		
		this.state = {
			url: null,
      seed: 39,
			...getInitialData(),
		};
    
    this.getFFT = this.getFFT.bind(this);
    this.updateAudio = this.updateAudio.bind(this);
    this.onCanPlay = this.onCanPlay.bind(this);
    this.onUrlAdd = this.onUrlAdd.bind(this);
	}
	
	async componentDidMount() {
		this.setState({
			...(await fetchInitialData()),
		});
		
		setInterval(() => this.setState({kek: Math.random()}), 1000);
    
    this.audioContext = new(window.AudioContext || window.webkitAudioContext)();
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = 256;
    this.analyserNode.connect(this.audioContext.destination);
    this.dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    if(this.audio) {
    	this.audioNode = this.audioContext.createMediaElementSource(this.audio);
      this.audioNode.connect(this.analyserNode);
    }
	}
  
  async componentWillUnmount() {
		if(this.audioContext) await this.audioContext.close();
	}
  
  componentDidUpdate() {
		const { url, seed } = this.state;
		
		if(url) {
      window.history.replaceState({}, '', `${location.pathname}?${qs.stringify({ url, seed })}`);
		} else {
      window.history.replaceState({}, '', `${location.pathname}`);
		}
  }
  
  getFFT() {
		if(!this.analyserNode) return null;
    this.analyserNode.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }
  
  updateAudio(audio) {
		if(this.audio === audio) return;
		
		if(this.audioNode) {
      this.audioNode.disconnect();
      this.audioNode = null;
		}
		
		if(audio) {
			this.audio = audio;
      if(this.audioContext) {
      	this.audioNode = this.audioContext.createMediaElementSource(audio);
        this.audioNode.connect(this.analyserNode);
      }
		}
	}
  
  onCanPlay(ev) {
    ev.target.play();
    
    this.setState({
      loading: false,
		});
	}
  
  onUrlAdd(url) {
		this.setState({
			url,
			seed: Math.floor(Math.random() * 1000000),
			loading: true,
		});
	}
	
	render() {
		return (
			<div className="IndexPage">
				<Visualizer seed={this.state.seed} loading={this.state.loading} getFFT={this.getFFT} />
				<div className="controls">
					<Controls onAdd={this.onUrlAdd} />
					<audio controls ref={this.updateAudio} onCanPlay={this.onCanPlay}
								 src={this.state.url ? `/api/youtube?url=${encodeURIComponent(this.state.url)}` : undefined} />
				</div>
			</div>
		)
	}
}
