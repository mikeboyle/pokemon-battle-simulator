class Pokemon {
  constructor(data) {
    this.name = data.name;
    this.moves = this.sampleMoves(data.moves);
    this.image = data.sprites.front_default;
  }

  sampleMoves(moves) {
    return moves.slice(0, 4).map(m => m.move);
  }

  render() {
    const container = document.createElement('div');
    container.classList.add('pokemon');

    const name = document.createElement('h2');
    name.innerText = this.name;
    container.appendChild(name);

    const image = document.createElement('img');
    image.src = this.image;
    container.appendChild(image);

    const moveList = document.createElement('ul');
    this.moves.forEach( move => {
      let moveListItem = document.createElement('li');
      moveListItem.innerText = move.name;
      moveList.appendChild(moveListItem);
    });
    container.appendChild(moveList);

    return container;
  }
}

class PokemonList {
  constructor(rootNode) {
    this.root = rootNode;
  }

  render(pokemons) {
    // clear old views
    this.root.innerHTML = "";

    // create new views from the pokemon
    pokemons.forEach(pokemon => {
      this.root.append(pokemon.render());
    })
  }
}

class BattleButton {
  constructor(rootNode, callback) {
    this.root = rootNode;
    this.callback = callback;
  }

  render(pokemons) {
    this.root.innerHTML = "";

    // Show the battle button only if there are 2 pokemon ready to battle
    if (pokemons.length === 2) {
      const button = document.createElement('button')
      button.innerText = 'Battle!';
      this.root.appendChild(button);

      button.addEventListener('click', () => {
        this.callback();
      });
    }
  }
}

class BattleResultsList {
  constructor(rootNode) {
    this.root = rootNode;
  }

  render(battleResults) {
    // Do nothing if battleResults didn't change
    const currentNumResults = this.root.children.length;
    if (currentNumResults === battleResults.length) return;

    // Append additional results to the list
    for (let i = currentNumResults; i < battleResults.length; i++) {
      let resultText = battleResults[i];
      let resultItem = document.createElement('li');
      resultItem.innerText = resultText;
      this.root.appendChild(resultItem);
    }
  }
}

class PokemonBattleApp {
  constructor(rootNode) {
    this.data =  {
      pokemons: [],
      battleResults: [],
    }

    this.constants = {
      API_BASE: 'https://pokeapi.co/api/v2/pokemon',
      MAX_POKEMON: 807,
    }

    this.root = rootNode;
    this.initialize();
  }

  initialize() {
    this.setupTitle();
    this.setupGetPokemonButton();
    this.pokemonList = this.setupPokemonList();
    this.battleButton = this.setupBattleButton();
    this.battleResultsList = this.setupBattleResultsList();
    this.getPokemons();
  }

  setupTitle() {
    const title = document.createElement('h1');
    title.innerText = 'Pokemon Battle Simulator';
    this.root.appendChild(title);
  }

  setupGetPokemonButton() {
    const button = document.createElement('button')
    button.innerText = 'Get Pokemon';
    this.root.appendChild(button);

    button.addEventListener('click', () => {
      this.getPokemons();
    });
  }

  setupPokemonList() {
    const listNode = document.createElement('div');
    this.root.appendChild(listNode);
    return new PokemonList(listNode);
  }

  setupBattleButton() {
    const { pokemon } = this.data;

    const buttonNode = document.createElement('div');
    this.root.appendChild(buttonNode);
    const onClick = () => { this.battle(); }
    return new BattleButton(buttonNode, onClick);
  }

  setupBattleResultsList() {
    const h1 = document.createElement('h1');
    h1.innerText = 'Battle Results';
    const ul = document.createElement('ul');
    this.root.appendChild(h1);
    this.root.appendChild(ul);
    return new BattleResultsList(ul);
  }

  battle() {
    const { battleResults, pokemons } = this.data;
    if (pokemons.length < 2) return;

    const winnerIndex = Math.floor(Math.random() * pokemons.length);
    const loserIndex = (winnerIndex + 1) % pokemons.length;

    const result = (`${pokemons[winnerIndex].name} defeated ${pokemons[loserIndex].name}!`);
    this.updateData({
      battleResults: [ ...battleResults, result]
    });
  }

  async fetchRandomPokemon() {
    const { API_BASE, MAX_POKEMON } = this.constants;
    const randomId = Math.ceil(Math.random() * MAX_POKEMON);
    const url = `${API_BASE}/${randomId}`;
    const response = await fetch(url);
    const data = await response.json();
    return new Pokemon(data);
  }

  async getPokemons () {
    // clear old data
    this.updateData({ pokemons: [] });

    // fetch new data
    for (let i = 0; i < 2; i++) {
      const pokemon = await this.fetchRandomPokemon();
      this.updateData({
        pokemons: [...this.data.pokemons, pokemon]
      })
    }
  }

  updateData(payload) {
    // update data
    const newData = { ...this.data, ...payload };
    this.data = newData;

    // rerender after data changes
    this.render();
  }

  render() {
    const { battleResults, pokemons } = this.data;
    this.pokemonList.render(pokemons);
    this.battleButton.render(pokemons);
    this.battleResultsList.render(battleResults);
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  const app = new PokemonBattleApp(document.getElementById('root'));
});
