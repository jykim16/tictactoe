
class App extends React.Component {

  constructor(){
    super();
    this.player1Name = prompt('what is your name, player 1?');
    this.player2Name = prompt('what is your name, player 2?');
    this.player1 =  "X";
    this.player2 = "O";
    this.state = {
      currentTurnPlayer: "X",
      currentPlayer: this.player1Name,
      players: {[this.player1Name]: 0, [this.player2Name]: 0},
      gameState: [['','',''],['','',''],['','','']],
      winner: false
    };
    this.clickHandler = this.clickHandler.bind(this);
  }

  clickHandler(e){
    if(!e.target.innerHTML) {
      var newGameState = this.state.gameState.slice(0);
      newGameState[e.target.id[0]][e.target.id[1]] = this.state.currentTurnPlayer;
      this.setState({
        gameState : newGameState,
        currentPlayer: this.state.currentTurnPlayer === "X" ? this.player2Name : this.player1Name,
        currentTurnPlayer : this.state.currentTurnPlayer === "X" ? this.player2 : this.player1,
        winner: this.hasWinner(e.target.id, this.state.currentTurnPlayer),
      });
    }
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.winner){
      alert(prevState.currentPlayer + ' won!');
    }
  }

  hasWinner(id, symbol){
    var horizontal = 0;
    var vertical = 0;
    var diagonalTopLeft = 0;
    var diagonalTopRight = 0;
    var lengthOfBoard = this.state.gameState.length;
    for(var i = 0; i < this.state.gameState.length; i++){
      if(symbol === this.state.gameState[id[0]][i]) {
        vertical++;
      }
      if(symbol === this.state.gameState[i][id[1]]) {
        horizontal++;
      }
      if(this.state.gameState[i][i] === symbol) {
        diagonalTopLeft++;
      }
      if(this.state.gameState[lengthOfBoard - 1 - i][i] === symbol) {
        diagonalTopRight++;
      }
    }
    if(horizontal === lengthOfBoard ||
      vertical === lengthOfBoard ||
      diagonalTopLeft === lengthOfBoard ||
      diagonalTopRight === lengthOfBoard) {
        console.log('yo')
        this.setState({
          players : _.extend(this.state.players, {[this.state.currentPlayer]: this.state.players[this.state.currentPlayer] + 1})
        });
        return symbol;
      }

    return false;
  }

  render() {
    return (
      <div className='row'>
        <div className="board col-xs-12 col-sm-8 col-md-6">
          <Board clickHandler={this.clickHandler} gameState={this.state.gameState}/>
        </div>
        <div className="score col-xs-12  col-sm-4 col-md-6">
          <Scoreboard winners={this.state.players}/>
        </div>
      </div>
    );
  }
}
