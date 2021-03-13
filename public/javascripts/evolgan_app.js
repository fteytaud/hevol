'use strict';

class EvolGanSettingsModel extends React.Component {
  constructor(props) {
    super(props);
    // State
    this.state = { value: props.value }; 
    // Bind this
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.onChangeModel(event.target.value);
  }

  render() {
    return (

      <select
          className="form-select mb-3"
          value={this.state.value}
          onChange={this.handleChange}>
        <option value="celeba">Celeba (128x128)</option>
        <option value="celebAHQ-256">Celeba (256x256)</option>
        <option value="celebAHQ-512">Celeba (512x512)</option>
      </select>
    );
  }
}

class EvolGanSettingsRange extends React.Component {
  constructor(props) {
    super(props);
    // State
    this.state = { value: props.value }; 
    // Bind this
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    this.setState({ value: event.target.value });
    this.props.onChangeSettings(this.props.settings, event.target.value);
  }

  render() {
    return (
      <div>
        <label htmlFor={this.props.settings} className="form-label me-auto">
          {this.props.label}
        </label>
        <code className="px-1">
          {this.state.value}
        </code>
        <input
            type="range"
            id={this.props.settings}
            className="form-range"
            min={this.props.min}
            max={this.props.max}
            value={this.state.value}
            onChange={this.handleChange} />
      </div>
    );
  }
}

class EvolGanSettingsSubmit extends React.Component {
  render() {
    return (
      <div className="d-grid gap-2">
        <a
            href="#play"
            className="btn btn-primary"
            onClick={this.props.onClickNew}>
          New
        </a>
        <a 
            href="#play"
            className={`
              btn btn-primary ${this.props.canUpdate ? '' : 'disabled' }
            `}
            onClick={this.props.onClickUpdate}>
          Update
        </a>
      </div>
    );
  }
}

class EvolGanSettingsProgress extends React.Component {
  render() {
    const progress = Math.round((this.props.progress / this.props.todo) * 100);
    return (
      <div>
        <p>
          Generated <code>{this.props.progress}</code> of <code>{this.props.todo}</code> images
        </p>
        <div className="progress">
          <div
              className="progress-bar"
              role="progressbar"
              style={{ width: progress + '%'}}
              aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100">
          </div>
        </div>
      </div>
    );
  }
}

class EvolGanSettings extends React.Component {
  render() {
    return (
      <div className="col-3 p-3">
        <div className="p-3 bg-body shadow">
          <h4>EvolGAN</h4>
          <hr />
          <h5>Model</h5>
          <EvolGanSettingsModel
              value={this.props.model}
              onChangeModel={this.props.onChangeModel} />
          <h5>Settings</h5>
          <EvolGanSettingsRange
              settings="lambda"
              label="Images"
              value={this.props.lambda}
              min="1"
              max="20"
              onChangeSettings={this.props.onChangeSettings} />
          <EvolGanSettingsRange
              settings="bound"
              label="Variations ⅟"
              value={this.props.bound}
              min="1"
              max="512"
              onChangeSettings={this.props.onChangeSettings} />
          <hr />
          {this.props.progress === false ? (
            <EvolGanSettingsSubmit
                canUpdate={this.props.canUpdate}
                onClickNew={this.props.onClickNew}
                onClickUpdate={this.props.onClickUpdate} />
          ) : (
            <EvolGanSettingsProgress
                todo={this.props.todo}
                progress={this.props.progress} />
          )}
        </div>
      </div>
    );
  }
}

class EvolGanCanvas extends React.Component {
  constructor(props) {
    super(props);
    // Bind this
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    this.props.onClickCanvas(this.props.index);
  }

  componentDidMount() {
    const ctx = this.refs.canvas.getContext('2d');
    const image = new ImageData(
      this.props.image,
      this.props.datasize,
      this.props.datasize);
    ctx.putImageData(image, 0, 0);
  }

  componentDidUpdate() {
    this.componentDidMount();
  }

  render() {
    return (
      <canvas
          ref="canvas"
          width={this.props.datasize}
          height={this.props.datasize}
          className={`
            ${this.props.ready ? 'ready' : 'not-ready'}
            ${this.props.select ? 'selected' : 'not-selected'}
          `}
          onClick={this.handleClick}>
      </canvas>
    );
  }
}

class EvolGanImages extends React.Component {
  render() {
    return (
      <div id="images" className="col-9 py-2 h-100 overflow-auto">
        {Object.values(this.props.images).map((image, i) => (
          <EvolGanCanvas
              key={`canvas_${i}`}
              index={i}
              image={image}
              ready={this.props.ready[i]}
              datasize={this.props.datasize}
              select={this.props.indices.includes(i)}
              onClickCanvas={this.props.onClickCanvas} />
        ))}
      </div>
    );
  }
}

class EvolGanApp extends React.Component {
  constructor(props) {
    super(props);
    // Const
    this.datasizes = { 'celeba': 128, 'celeba-256': 256, 'celeba-512': 512 };
    // Evolgan
    this.evolgan = new EvolGan();
    this.handleMessages();
    // State
    this.state = {
      datasize: 256,
      model: 'celebAHQ-256',
      lambda: 10,
      bound: 64,
      indices: [],
      images: [],
      ready: [],
      todo: false,
      progress: false
    };
    // Bind this
    this.handleChangeModel = this.handleChangeModel.bind(this);
    this.handleChangeSettings = this.handleChangeSettings.bind(this);
    this.handleClickNew = this.handleClickNew.bind(this);
    this.handleClickUpdate = this.handleClickUpdate.bind(this);
    this.handleClickCanvas = this.handleClickCanvas.bind(this);
  }

  handleMessages() {
    this.evolgan.worker.onmessage = ({ data: { i, image }}) => {
      this.setState((state) => {
        let { images, ready, progress, todo } = state;
        images[i] = image;
        ready[i] = true;
        progress = (i + 1) === todo ? false : (i + 1);
        return ({ images, ready, progress });
      });
    };
  }

  handleChangeModel(model) {
    this.setState({ model: model, datasize: this.datasizes[model] });
  }

  handleChangeSettings(settings, value) {
    this.setState({ [settings]: value });
  }

  handleClickNew() {
    this.setState((state) => {
      const lambda = parseInt(state.lambda);
      this.evolgan.reset(state.model, lambda);
      return ({
        indices: [],
        images: state.images.slice(0, lambda),
        ready: new Array(lambda).fill(false),
        todo: lambda,
        progress: 0
      });
    });    
  }

  handleClickUpdate() {
    this.setState((state) => {
      const lambda = parseInt(state.lambda);
      const bound = parseInt(state.bound);
      this.evolgan.update(state.model, lambda, bound, state.indices);
      return ({
        indices: [],
        images: state.images.slice(0, lambda),
        ready: new Array(lambda).fill(false),
        todo: lambda,
        progress: 0
      });
    });    
  }

  handleClickCanvas(index) {
    this.setState((state) => {
      const { indices } = state;
      const i = indices.indexOf(index);
      if (i === -1)
        indices.push(index);
      else
        indices.splice(i, 1);
      return ({ indices });
    });
  }

  render() {
    return (
      <div className="row h-100">
        <EvolGanSettings
            model={this.state.model}
            lambda={this.state.lambda}
            bound={this.state.bound}
            todo={this.state.todo}
            progress={this.state.progress}
            canUpdate={this.state.images.length && this.state.indices.length}
            onChangeModel={this.handleChangeModel}
            onChangeSettings={this.handleChangeSettings}
            onClickNew={this.handleClickNew}
            onClickUpdate={this.handleClickUpdate} />
        <EvolGanImages
            datasize={this.state.datasize}
            indices={this.state.indices}
            images={this.state.images}
            ready={this.state.ready}
            onClickCanvas={this.handleClickCanvas} />
      </div>
    );
  }
}

const domContainer = document.querySelector('#play');
ReactDOM.render(<EvolGanApp />, domContainer);