'use strict';

/** Spinner *******************************************************************/
function EvolGanSpinner(props) {
  return (
    <div className="d-flex justify-content-center">
      <div className={`spinner-border text-${props.color}`} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>
  );
}

/** Loading button ************************************************************/
function EvolGanButton(props) {
  return (
    <a
        href="#play"
        className={
          'btn btn-primary'
          + (props.lg ? ' btn-lg' : '')
          + (props.isComputing ? ' disabled' : '')
        }
        onClick={props.onClick}>
      {props.isComputing ? (
        <EvolGanSpinner color="white" />
      ) : (
        <span>{props.label}</span>
      )}
    </a>
  );
}

/** Welcome *******************************************************************/
function EvolGanWelcome(props) {
  return (
    <div className="row h-100">
      <div className="col align-self-center text-center">
        <h1 className="mb-3">EvolGAN</h1>
        <EvolGanButton
            onClick={props.onConnect}
            label="Start"
            lg={true}
            isComputing={props.isComputing} />
      </div>
    </div>
  );
}

/** Image *********************************************************************/
class EvolGanImage extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onImage(this.props.indice);
  }

  render() {
    return (
      <span>
        <img 
            src={this.props.path}
            className={`img-fluid ${this.props.isSelected ? 'selected' : ''}`}
            onClick={this.handleClick} />
      </span>
    );
  }
}

/** Select ********************************************************************/
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
      <select
          className="form-select"
          value={this.state.value}
          onChange={this.handleChange}>
        <option value="celeba">Celeba (128x128)</option>
        <option value="celebAHQ-256">Celeba (256x256)</option>
        <option value="celebAHQ-512">Celeba (512x512)</option>
      </select>
    );
  }
}

/** Range *********************************************************************/
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
        <input
            type="range"
            id={this.props.identifier}
            className="form-range"
            min={this.props.min}
            max={this.props.max}
            value={this.state.value}
            onChange={this.handleChange} />
      </div>
    );
  }
}

/** Settings ******************************************************************/
function EvolGanSettings(props) {
  return (
    <div className="col-3 p-3">
      <div className="bg-body p-3 shadow">
        <h4>EvolGAN</h4>
        <hr />
        <h5>Model</h5>
        <EvolGanSelect 
            identifier="model"
            init={props.model}
            onChange={props.onChange} />
        <h5 className="mt-3">Settings</h5>
        <EvolGanRange
            identifier="llambda"
            label="Images"
            min="5"
            max="25"
            init={props.llambda}
            onChange={props.onChange} />
        <EvolGanRange
            identifier="bound"
            label="Variation ⅟"
            min="1"
            max="512"
            init={props.bound}
            onChange={props.onChange} />
        <hr />
        {props.isComputing ? (
          <div>
            <EvolGanSpinner color="primary" />
          </div>
        ) : (
          <div className="d-grid gap-2">
            <EvolGanButton
                onClick={props.onNew}
                label="New"
                lg={false}
                isComputing={props.isComputing} />
            <EvolGanButton
                onClick={props.onUpdate}
                label="Update"
                lg={false}
                isComputing={props.isComputing} />
          </div>
        )}
      </div>
    </div>
  );
}

/** Images ********************************************************************/
function EvolGanImages(props) {
  return (
    <div className="col-9 p-3 h-100 text-center position-relative">
      <div id="overlay" className={props.isComputing ? 'active' : ''}></div>
      <div id="images" className="h-100 overflow-auto">
        {props.images.map((image, n) => (
          <EvolGanImage
              key={`img_${n}`}
              indice={n}
              path={image}
              isSelected={
                Object.keys(props.indices).map(key => parseInt(key)).includes(n)
              }
              onImage={props.onImage} />
        ))}
      </div>
    </div>
  );
}

/** App ***********************************************************************/
function EvolGanApp(props) {
  return (
    <div className="row h-100">
      <EvolGanSettings
          onChange={props.onChange}
          onNew={props.onNew}
          onUpdate={props.onUpdate}
          isComputing={props.isComputing}
          model={props.model}
          llambda={props.llambda}
          bound={props.bound} />
      <EvolGanImages 
          onImage={props.onImage}
          isComputing={props.isComputing}
          images={props.images}
          indices={props.indices} />
    </div>
  );
}

/** EvolGan *******************************************************************/
class EvolGan extends React.Component {
  constructor(props) {
    super(props);
    // Socket
    this.socket = undefined;
    // State
    this.state = {
      isComputing: false,
      isConnected: false,
      model: 'celebAHQ-256',
      llambda: 16,
      bound: 64,
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
      this.setState({ isComputing: false, images: data.images, indices: {} });
    });
    this.socket.on('unlock', () => {
      console.log('Unlock!');
      this.setState({ isComputing: false });
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
    this.setState({ isComputing: true }, () => {
      let data = this.prepare();
      this.socket.emit('new', data);
    });
  }

  handleUpdate() {
    this.setState({ isComputing: true }, () => {
      let data = this.prepare();
      this.socket.emit('update', data);
    });
  }

  prepare() {
    return ({
      model: this.state.model,
      llambda: parseInt(this.state.llambda),
      bound: parseInt(this.state.bound),
      indices: Object.keys(this.state.indices).map(i => parseInt(i))
    });
  }

  render() {
    return (this.state.isConnected ? (
      <EvolGanApp
          onChange={this.handleChange}
          onNew={this.handleNew}
          onUpdate={this.handleUpdate}
          onImage={this.handleImage}
          isComputing={this.state.isComputing}
          images={this.state.images}
          indices={this.state.indices}
          model={this.state.model}
          llambda={this.state.llambda}
          bound={this.state.bound} />
    ) : (
      <EvolGanWelcome
          onConnect={this.handleConnect}
          isComputing={this.state.isComputing} />
    ));
  }
}

const domContainer = document.querySelector('#evolgan_app');
ReactDOM.render(<EvolGan />, domContainer);