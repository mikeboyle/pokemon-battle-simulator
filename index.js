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

  pokemonsChanged(newPokemons) {
    if (!this.pokemons) return true;
    if (this.pokemons.length !== newPokemons.length) return true;
    if (this.pokemons.legth === 0 && newPokemons.length === 0) return false;

    const mergedPokemonsSet = this.pokemons.map(p => p.name);
    newPokemons.forEach(np => {
      if (!mergedPokemonsSet.includes(np.name)) {
        mergedPokemonsSet.push(np);
      }
    });
    return mergedPokemonsSet.length > this.pokemons.length;
  }

  render(pokemons) {
    if (!this.pokemonsChanged(pokemons)) return;
    // clear old views
    this.root.innerHTML = "";

    // create new views from the pokemon
    pokemons.forEach(pokemon => {
      this.root.append(pokemon.render());
    });
    this.pokemons = pokemons;
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
    this.getPokemons();
  }

  renderTitle() {
    if (document.getElementById('title')) return;

    const title = document.createElement('h1');
    title.id = 'title';
    title.innerText = 'Pokemon Battle Simulator';
    this.root.appendChild(title);
  }

  renderGetPokemonButton() {
    if (document.getElementById('getPokemon')) return;

    const button = document.createElement('button')
    button.id = 'getPokemon';
    button.innerText = 'Get Pokemon';
    this.root.appendChild(button);

    button.addEventListener('click', () => {
      this.getPokemons();
    });
  }

  renderPokemonList() {
    if (!this.pokemonList) {
      const listNode = document.createElement('div');
      listNode.classList.add('pokemonList');
      this.root.appendChild(listNode);

      this.pokemonList = new PokemonList(listNode);
    }

    const { pokemons } = this.data;
    this.pokemonList.render(pokemons);
  }

  renderBattleButton() {
    if (!this.battleButton) {
      const buttonNode = document.createElement('div');
      this.root.appendChild(buttonNode);

      const onClick = () => { this.battle(); }
      this.battleButton = new BattleButton(buttonNode, onClick);
    }

    const { pokemons } = this.data;
    this.battleButton.render(pokemons);
  }

  renderBattleResultsList() {
    if (!this.battleResultsList) {
      const h1 = document.createElement('h1');
      h1.innerText = 'Battle Results';
      const ul = document.createElement('ul');
      this.root.appendChild(h1);
      this.root.appendChild(ul);

      this.battleResultsList = new BattleResultsList(ul);
    }

    const { battleResults } = this.data;
    this.battleResultsList.render(battleResults);
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
    this.renderTitle();
    this.renderGetPokemonButton();
    this.renderPokemonList();
    this.renderBattleButton();
    this.renderBattleResultsList();
  }
}

document.addEventListener('DOMContentLoaded', (event) => {
  const app = new PokemonBattleApp(document.getElementById('root'));
});
