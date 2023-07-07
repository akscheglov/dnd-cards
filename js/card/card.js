function resize2fit(container) {
  const space = 10;
  let step = 0.5
  for (let i = 0; i < 30; i++) {
    const max_h = container.clientHeight;
    const h = [...container.children].reduce((acc, el) => acc += el.clientHeight, 0);
    const fontSize = window.getComputedStyle(container.querySelector('.text')).fontSize;
    const diff = max_h - space - h;

    // follow stange cases are broken on chrome print prew, I have no idea why
    const someStrangeCase = (['18px', '14.5px', '11.5px'].includes(fontSize) && diff <= 7);

    if (!someStrangeCase && diff > 0) return;

    const parsedSize = parseFloat(fontSize).toFixed(1);
    if (parsedSize < 12) {
      step = 0.3;
    }
    const newFontSize = (parsedSize - step) + 'px';
    container.querySelectorAll('.text').forEach((node) => node.style.fontSize = newFontSize);
  }

  console.log('cannot resize text');
}

function getTextClass(props) {
  const items = props.text.concat(props.hightlevel || [])
  let len = items.reduce((acc, v) => acc += v.length, 0);
  len += 15 * (items.length - 1)

  if (props.hint) return props.hint;

  let fontSizeClass = '';
  if (len >= 1500) {
    fontSizeClass += 'small4';
  } else if (len >= 1150) {
    fontSizeClass += 'small3';
  } else if (len >= 1000) {
    fontSizeClass += 'small2';
  } else if (len >= 730) {
    fontSizeClass += 'small1';
  } else if (len >= 610) {
    fontSizeClass += 'small0';
  }

  return fontSizeClass
}

function hasProperties(data) {
  return !!data.components
}

function processText(text) {
  const values = ['Материалы:', 'Условие:', 'Длительность:', 'Дистанция:'];
  values.forEach(v => text = text.startsWith(v) ? text.replace(v, '<b>' + v + '</b>') : text);
  return text;
}

function cond(component, condition) {
  return condition ? component : ('');
}

function genID(prefix = '') {
  let id = Math.floor(Math.random() * (2 << 20)) << 10;
  return function () {
    return prefix + (id++).toString();
  }
}

function CardProperties({ data }) {
  return (
    <div className="props">
      <div className="props-row">
        <div className="prop prop-left">
          {data.time}
        </div>
        <div className="prop prop-rigth">
          {data.range}
        </div>
      </div>
      <div className="props-row">
        <div className="prop prop-left">
          {data.components}
        </div>
        <div className="prop prop-rigth">
          {data.duration}
        </div>
      </div>
    </div>
  );
}

function CardText({ customClass, text }) {
  const nextID = genID('card-text');
  return (
    <div className={'text' + ' ' + (customClass || '')}>
      {text.map((v) => (<p key={nextID()} dangerouslySetInnerHTML={{ __html: processText(v) }}></p>))}
    </div>
  );
}

class Card extends React.Component {
  componentDidMount() {
    if (this.props.textAutoSize) resize2fit(ReactDOM.findDOMNode(this.refs.card));
  }

  render() {
    const textClass = this.props.textAutoSize ? '' : getTextClass(data);
    const hasHigherLevels = (this.props.data.hightlevel || []).length > 0;
    return (
      <div ref='card' className={'card ' + (this.props.customClass || '')}>
        <div className="title">{this.props.data.name}</div>
        <div className="level">{this.props.data.level}, {this.props.data.type}</div>
        {cond(<CardProperties data={this.props.data} />, hasProperties(this.props.data))}
        <CardText text={this.props.data.text} customClass={'content ' + textClass} />
        {cond((<div className="level">На более высоком уровне</div>), hasHigherLevels)}
        {cond((<CardText text={this.props.data.hightlevel} customClass={textClass} />), hasHigherLevels)}
      </div>
    );
  }
}

document.genID = genID;
document.Card = Card;