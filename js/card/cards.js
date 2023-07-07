function spellLevel(card) {
  return card.level == 'Заговор' ? 0 : +card.level.substr(0, 1)
}

function sortSpells(spells) {
  spells.sort((a, b) => {
    const l1 = spellLevel(a), l2 = spellLevel(b);
    if (l1 != l2) return l1 - l2;
    return a.name < b.name ? -1 : 1;
  });
}

function checkMissing(classSpells, data) {
  (classSpells || []).filter(name => !data.cards.find(element => element.name == name) ? console.log(name) : '');
}

function playerCards(player, data) {
  const klass = data.abilities.classes[player.class];
  const subclass = klass.subclasses[player.subclass] || { abilities: [], spells: [] };
  const abilities = []
    .concat(data.abilities.backgrounds[player.background])
    .concat(data.abilities.races[player.race])
    .concat(klass.abilities)
    .concat(subclass.abilities);

  checkMissing(klass.spells, data);
  checkMissing(subclass.spells, data);

  const classSpells = data.cards.filter((card) => klass.spells.includes(card.name));
  const subclassSpells = data.cards.filter((card) => subclass.spells.includes(card.name));
  const spells = classSpells.concat(subclassSpells);
  sortSpells(spells);

  return abilities.concat(spells);
}

function loadData(url, cb) {
  fetch(url + '?ts=' + Date.now())
    .then(x => x.json())
    .then(cb)
    .catch(error => console.error(error));
}

function Selector({ players, selected, onSelect }) {
  return (
    <div className="selector">
      <select value={selected} onChange={onSelect}>
        {Object.keys(players).map(name => (<option key={name} value={name}>{name}</option>))}
      </select>
    </div>
  )
}

class Cards extends React.Component {
  handlePlayer(event) {
    this.setState({ ...this.state, player: event.target.value });
  }

  componentDidMount() {
    loadData(this.props.url, data => this.setState({ data: data, player: Object.keys(data.players)[0] }));
  }

  render() {
    if (!this.state) return (<div>Loading...</div>);

    const player = this.state.data.players[this.state.player];
    const nextID = document.genID('card-' + this.state.player);
    return (
      <div>
        <Selector players={this.state.data.players} selected={this.state.player} onSelect={this.handlePlayer.bind(this)} />

        <div className="cards" >
          {
            playerCards(player, this.state.data).map((card) => (
              <document.Card
                key={nextID()}
                data={card}
                textAutoSize={this.props.textAutoSize}
                customClass={player.styles}
              />))
          }
        </div>
      </div>
    );
  }
}

document.Cards = Cards;
