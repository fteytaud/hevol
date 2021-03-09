'use strict';

function EvolGanSpinner(props) {
  return (
    <div className="d-flex justify-content-center">
      <div className={`spinner-border text-${props.color}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

function EvolGanButton(props) {
  return (
    <a href="#play" className={`btn btn-primary ${props.lg ? 'btn-lg' : ''} ${props.isComputing ? 'disabled' : ''}`} onClick={props.onClick}>
      {props.isComputing ? (
        <EvolGanSpinner color="white" />
      ) : (
        <span>{props.label}</span>
      )}
    </a>
  );
}

function EvolGanWelcome(props) {
  return (
    <div className="row h-100">
      <div className="col align-self-center text-center">
        <h1 className="mb-3">EvolGAN</h1>
        <EvolGanButton onClick={props.onConnect} label="Start" lg={true} isComputing={props.isComputing} />
      </div>
    </div>
  );
}

class EvolGanImage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { isSelected: false };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.setState((state) => ({ isSelected: !state.isSelected }));
    this.props.onClick(this.props.indice);
  }

  render() {
    return (
      <span>
        <img src={this.props.path} className={`img-fluid ${this.state.isSelected ? 'selected' : ''}`} onClick={this.handleClick} />
      </span>
    );
  }
}

class EvolGanSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.init }; 
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.onChange(this.props.identifier, event.target.value);
  }

  render() {
    return (
      <select className="form-select" onChange={this.handleChange}>
        <option value="celeba">Celeba (128x128)</option>
        <option value="celebAHQ-256">Celeba (256x256)</option>
        <option value="celebAHQ-512">Celeba (512x512)</option>
      </select>
    );
  }
}

class EvolGanRange extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: props.init }; 
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.onChange(this.props.identifier, event.target.value);
  }

  render() {
    return (
      <div>
        <label htmlFor={this.props.identifier} className="form-label me-auto">
          {this.props.label}
        </label>
        <code className="px-2">
          {this.state.value}
        </code>
        <input type="range" className="form-range" min={this.props.min} max={this.props.max} id={this.props.identifier} value={this.state.value} onChange={this.handleChange} />
      </div>
    );
  }
}

class EvolGanApp extends React.Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(identifier, value) {
    this.props.onChange(identifier, value);
  }

  render() {
    return (
      <div className="row h-100">
        <div className="col-3 p-3">
          <div className="bg-body p-3 shadow">
            <h4>EvolGAN</h4>
            <hr />
            <h5>Model</h5>
            <EvolGanSelect identifier="model" init={this.props.model} onChange={this.handleChange} />
            <h5 className="mt-3">Settings</h5>
            <EvolGanRange identifier="mu" label="Mu" min="0" max="20" init={this.props.mu} onChange={this.handleChange} />
            <EvolGanRange identifier="llambda" label="Images" min="5" max="25" init={this.props.llambda} onChange={this.handleChange} />
            <EvolGanRange identifier="bound" label="Variation (⅟ )" min="1" max="512" init={this.props.bound} onChange={this.handleChange} />
            <hr />
            {this.props.isComputing ? (
              <div>
                <EvolGanSpinner color="primary" />
              </div>
            ) : (
              <div className="d-grid gap-2">
                <EvolGanButton onClick={this.props.onNew} label="New" lg={false} isComputing={this.props.isComputing} />
                <EvolGanButton onClick={this.props.onUpdate} label="Update" lg={false} isComputing={this.props.isComputing} />
              </div>
            )}
          </div>
        </div>
        <div id="images" className={`col-9 p-3 h-100 text-center ${this.props.isComputing ? 'overflow-hidden' : 'overflow-auto' }`}>
          <div id="overlay" className={this.props.isComputing ? 'active' : ''}></div>
          {this.props.images.map((image, n) => (
            <EvolGanImage key={`img${n}`} indice={n} path={image} onClick={this.props.onImage} />
          ))}
        </div>
      </div>
    );
  }
}

class EvolGan extends React.Component {
  constructor(props) {
    super(props);
    // Socket
    this.socket = undefined;
    // State
    this.state = {
      isComputing: false,
      isConnected: false,
      model: 'celeba',
      mu: 10,
      llambda: 20,
      bound: 512,
      indices: {},
      images: []
    };
    // Bind this
    this.handleConnect = this.handleConnect.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleNew = this.handleNew.bind(this);
    this.handleUpdate = this.handleUpdate.bind(this);
    this.handleImage = this.handleImage.bind(this);
  }

  initializeSocket() {
    this.socket = io();
    this.socket.on('isConnected', () => {
      console.log(`Socket ${this.socket.id} is connected`);
      this.setState({ isComputing: false, isConnected: true });
    });
    this.socket.on('imagesGenerated', (data) => {
      console.log(`Images generated!`);
      this.setState({ isComputing: false, images: data.images });
    });
  }

  handleConnect() {
    this.setState({ isComputing: true }, () => {
      this.initializeSocket();
    });
  }

  handleChange(identifier, value) {
    this.setState({ [identifier]: value });
  }

  handleImage(indice) {
    this.setState((state) => {
      if (state.indices[indice]) {
        delete state.indices[indice];
      }
      else {
        state.indices[indice] = true;
      }
      return state;
    });
  }

  handleNew() {
    this.setState({ isComputing: true, indices: {} }, () => {
      let params = {
        model: this.state.model,
        mu: parseInt(this.state.mu),
        llambda: parseInt(this.state.llambda),
        bound: parseInt(this.state.bound),
        indices: Object.keys(this.state.indices).map(i => parseInt(i))
      };
      this.socket.emit('new', params);
    });
  }

  handleUpdate() {
    this.setState({ isComputing: true }, () => {
      this.socket.emit('update');
    });
  }

  render() {
    return (this.state.isConnected ? (
      <EvolGanApp onChange={this.handleChange} onNew={this.handleNew} onUpdate={this.handleUpdate} onImage={this.handleImage} isComputing={this.state.isComputing} images={this.state.images} model={this.state.model} mu={this.state.mu} llambda={this.state.llambda} bound={this.state.bound} />
    ) : (
      <EvolGanWelcome onConnect={this.handleConnect} isComputing={this.state.isComputing} />
    ));
  }
}

const domContainer = document.querySelector('#evolgan_app');
ReactDOM.render(<EvolGan />, domContainer);