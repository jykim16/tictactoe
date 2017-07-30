'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var App = function (_React$Component) {
  _inherits(App, _React$Component);

  function App() {
    var _players;

    _classCallCheck(this, App);

    var _this = _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).call(this));

    _this.player1Name = prompt('what is your name, player 1?');
    _this.player2Name = prompt('what is your name, player 2?');
    _this.player1 = "X";
    _this.player2 = "O";
    _this.state = {
      currentTurnPlayer: "X",
      currentPlayer: _this.player1Name,
      players: (_players = {}, _defineProperty(_players, _this.player1Name, 0), _defineProperty(_players, _this.player2Name, 0), _players),
      gameState: [['', '', ''], ['', '', ''], ['', '', '']],
      winner: false
    };
    _this.clickHandler = _this.clickHandler.bind(_this);
    return _this;
  }

  _createClass(App, [{
    key: 'clickHandler',
    value: function clickHandler(e) {
      if (!e.target.innerHTML) {
        var newGameState = this.state.gameState.slice(0);
        newGameState[e.target.id[0]][e.target.id[1]] = this.state.currentTurnPlayer;
        this.setState({
          gameState: newGameState,
          currentPlayer: this.state.currentTurnPlayer === "X" ? this.player2Name : this.player1Name,
          currentTurnPlayer: this.state.currentTurnPlayer === "X" ? this.player2 : this.player1,
          winner: this.hasWinner(e.target.id, this.state.currentTurnPlayer)
        });
      }
    }
  }, {
    key: 'componentDidUpdate',
    value: function componentDidUpdate(prevProps, prevState) {
      if (this.state.winner) {
        alert(prevState.currentPlayer + ' won!');
      }
    }
  }, {
    key: 'hasWinner',
    value: function hasWinner(id, symbol) {
      var horizontal = 0;
      var vertical = 0;
      var diagonalTopLeft = 0;
      var diagonalTopRight = 0;
      var lengthOfBoard = this.state.gameState.length;
      for (var i = 0; i < this.state.gameState.length; i++) {
        if (symbol === this.state.gameState[id[0]][i]) {
          vertical++;
        }
        if (symbol === this.state.gameState[i][id[1]]) {
          horizontal++;
        }
        if (this.state.gameState[i][i] === symbol) {
          diagonalTopLeft++;
        }
        if (this.state.gameState[lengthOfBoard - 1 - i][i] === symbol) {
          diagonalTopRight++;
        }
      }
      if (horizontal === lengthOfBoard || vertical === lengthOfBoard || diagonalTopLeft === lengthOfBoard || diagonalTopRight === lengthOfBoard) {
        console.log('yo');
        this.setState({
          players: _.extend(this.state.players, _defineProperty({}, this.state.currentPlayer, this.state.players[this.state.currentPlayer] + 1))
        });
        return symbol;
      }

      return false;
    }
  }, {
    key: 'render',
    value: function render() {
      return React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'div',
          { className: 'board col-xs-12 col-sm-8 col-md-6' },
          React.createElement(Board, { clickHandler: this.clickHandler, gameState: this.state.gameState })
        ),
        React.createElement(
          'div',
          { className: 'score col-xs-12  col-sm-4 col-md-6' },
          React.createElement(Scoreboard, { winners: this.state.players })
        )
      );
    }
  }]);

  return App;
}(React.Component);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHAuanN4Il0sIm5hbWVzIjpbIkFwcCIsInBsYXllcjFOYW1lIiwicHJvbXB0IiwicGxheWVyMk5hbWUiLCJwbGF5ZXIxIiwicGxheWVyMiIsInN0YXRlIiwiY3VycmVudFR1cm5QbGF5ZXIiLCJjdXJyZW50UGxheWVyIiwicGxheWVycyIsImdhbWVTdGF0ZSIsIndpbm5lciIsImNsaWNrSGFuZGxlciIsImJpbmQiLCJlIiwidGFyZ2V0IiwiaW5uZXJIVE1MIiwibmV3R2FtZVN0YXRlIiwic2xpY2UiLCJpZCIsInNldFN0YXRlIiwiaGFzV2lubmVyIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiYWxlcnQiLCJzeW1ib2wiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJkaWFnb25hbFRvcExlZnQiLCJkaWFnb25hbFRvcFJpZ2h0IiwibGVuZ3RoT2ZCb2FyZCIsImxlbmd0aCIsImkiLCJjb25zb2xlIiwibG9nIiwiXyIsImV4dGVuZCIsIlJlYWN0IiwiQ29tcG9uZW50Il0sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7SUFDTUEsRzs7O0FBRUosaUJBQWE7QUFBQTs7QUFBQTs7QUFBQTs7QUFFWCxVQUFLQyxXQUFMLEdBQW1CQyxPQUFPLDhCQUFQLENBQW5CO0FBQ0EsVUFBS0MsV0FBTCxHQUFtQkQsT0FBTyw4QkFBUCxDQUFuQjtBQUNBLFVBQUtFLE9BQUwsR0FBZ0IsR0FBaEI7QUFDQSxVQUFLQyxPQUFMLEdBQWUsR0FBZjtBQUNBLFVBQUtDLEtBQUwsR0FBYTtBQUNYQyx5QkFBbUIsR0FEUjtBQUVYQyxxQkFBZSxNQUFLUCxXQUZUO0FBR1hRLHlEQUFXLE1BQUtSLFdBQWhCLEVBQThCLENBQTlCLDZCQUFrQyxNQUFLRSxXQUF2QyxFQUFxRCxDQUFyRCxZQUhXO0FBSVhPLGlCQUFXLENBQUMsQ0FBQyxFQUFELEVBQUksRUFBSixFQUFPLEVBQVAsQ0FBRCxFQUFZLENBQUMsRUFBRCxFQUFJLEVBQUosRUFBTyxFQUFQLENBQVosRUFBdUIs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QUFQO0FBQ0Q7Ozs2QkFFUTtBQUNQLGFBQ0U7QUFBQTtBQUFBLFVBQUssV0FBVSxLQUFmO0FBQ0U7QUFBQTtBQUFBLFlBQUssV0FBVSxtQ0FBZjtBQUNFLDhCQUFDLEtBQUQsSUFBTyxjQUFjLEtBQUtiLFlBQTFCLEVBQXdDLFdBQVcsS0FBS04sS0FBTCxDQUFXSSxTQUE5RDtBQURGLFNBREY7QUFJRTtBQUFBO0FBQUEsWUFBSyxXQUFVLG9DQUFmO0FBQ0UsOEJBQUMsVUFBRCxJQUFZLFNBQVMsS0FBS0osS0FBTCxDQUFXRyxPQUFoQztBQURGO0FBSkYsT0FERjtBQVVEOzs7O0VBbEZlNEIsTUFBTUMsUyIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmNsYXNzIEFwcCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG5cbiAgY29uc3RydWN0b3IoKXtcbiAgICBzdXBlcigpO1xuICAgIHRoaXMucGxheWVyMU5hbWUgPSBwcm9tcHQoJ3doYXQgaXMgeW91ciBuYW1lLCBwbGF5ZXIgMT8nKTtcbiAgICB0aGlzLnBsYXllcjJOYW1lID0gcHJvbXB0KCd3aGF0IGlzIHlvdXIgbmFtZSwgcGxheWVyIDI/Jyk7XG4gICAgdGhpcy5wbGF5ZXIxID0gIFwiWFwiO1xuICAgIHRoaXMucGxheWVyMiA9IFwiT1wiO1xuICAgIHRoaXMuc3RhdGUgPSB7XG4gICAgICBjdXJyZW50VHVyblBsYXllcjogXCJYXCIsXG4gICAgICBjdXJyZW50UGxheWVyOiB0aGlzLnBsYXllcjFOYW1lLFxuICAgICAgcGxheWVyczoge1t0aGlzLnBsYXllcjFOYW1lXTogMCwgW3RoaXMucGxheWVyMk5hbWVdOiAwfSxcbiAgICAgIGdhbWVTdGF0ZTogW1snJywnJywnJ10sWycnLCcnLCcnXSxbJycsJycsJyddXSxcbiAgICAgIHdpbm5lcjogZmFsc2VcbiAgICB9O1xuICAgIHRoaXMuY2xpY2tIYW5kbGVyID0gdGhpcy5jbGlja0hhbmRsZXIuYmluZCh0aGlzKTtcbiAgfVxuXG4gIGNsaWNrSGFuZGxlcihlKXtcbiAgICBpZighZS50YXJnZXQuaW5uZXJIVE1MKSB7XG4gICAgICB2YXIgbmV3R2FtZVN0YXRlID0gdGhpcy5zdGF0ZS5nYW1lU3RhdGUuc2xpY2UoMCk7XG4gICAgICBuZXdHYW1lU3RhdGVbZS50YXJnZXQuaWRbMF1dW2UudGFyZ2V0LmlkWzFdXSA9IHRoaXMuc3RhdGUuY3VycmVudFR1cm5QbGF5ZXI7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZ2FtZVN0YXRlIDogbmV3R2FtZVN0YXRlLFxuICAgICAgICBjdXJyZW50UGxheWVyOiB0aGlzLnN0YXRlLmN1cnJlbnRUdXJuUGxheWVyID09PSBcIlhcIiA/IHRoaXMucGxheWVyMk5hbWUgOiB0aGlzLnBsYXllcjFOYW1lLFxuICAgICAgICBjdXJyZW50VHVyblBsYXllciA6IHRoaXMuc3RhdGUuY3VycmVudFR1cm5QbGF5ZXIgPT09IFwiWFwiID8gdGhpcy5wbGF5ZXIyIDogdGhpcy5wbGF5ZXIxLFxuICAgICAgICB3aW5uZXI6IHRoaXMuaGFzV2lubmVyKGUudGFyZ2V0LmlkLCB0aGlzLnN0YXRlLmN1cnJlbnRUdXJuUGxheWVyKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSl7XG4gICAgaWYodGhpcy5zdGF0ZS53aW5uZXIpe1xuICAgICAgYWxlcnQocHJldlN0YXRlLmN1cnJlbnRQbGF5ZXIgKyAnIHdvbiEnKTtcbiAgICB9XG4gIH1cblxuICBoYXNXaW5uZXIoaWQsIHN5bWJvbCl7XG4gICAgdmFyIGhvcml6b250YWwgPSAwO1xuICAgIHZhciB2ZXJ0aWNhbCA9IDA7XG4gICAgdmFyIGRpYWdvbmFsVG9wTGVmdCA9IDA7XG4gICAgdmFyIGRpYWdvbmFsVG9wUmlnaHQgPSAwO1xuICAgIHZhciBsZW5ndGhPZkJvYXJkID0gdGhpcy5zdGF0ZS5nYW1lU3RhdGUubGVuZ3RoO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnN0YXRlLmdhbWVTdGF0ZS5sZW5ndGg7IGkrKyl7XG4gICAgICBpZihzeW1ib2wgPT09IHRoaXMuc3RhdGUuZ2FtZVN0YXRlW2lkWzBdXVtpXSkge1xuICAgICAgICB2ZXJ0aWNhbCsrO1xuICAgICAgfVxuICAgICAgaWYoc3ltYm9sID09PSB0aGlzLnN0YXRlLmdhbWVTdGF0ZVtpXVtpZFsxXV0pIHtcbiAgICAgICAgaG9yaXpvbnRhbCsrO1xuICAgICAgfVxuICAgICAgaWYodGhpcy5zdGF0ZS5nYW1lU3RhdGVbaV1baV0gPT09IHN5bWJvbCkge1xuICAgICAgICBkaWFnb25hbFRvcExlZnQrKztcbiAgICAgIH1cbiAgICAgIGlmKHRoaXMuc3RhdGUuZ2FtZVN0YXRlW2xlbmd0aE9mQm9hcmQgLSAxIC0gaV1baV0gPT09IHN5bWJvbCkge1xuICAgICAgICBkaWFnb25hbFRvcFJpZ2h0Kys7XG4gICAgICB9XG4gICAgfVxuICAgIGlmKGhvcml6b250YWwgPT09IGxlbmd0aE9mQm9hcmQgfHxcbiAgICAgIHZlcnRpY2FsID09PSBsZW5ndGhPZkJvYXJkIHx8XG4gICAgICBkaWFnb25hbFRvcExlZnQgPT09IGxlbmd0aE9mQm9hcmQgfHxcbiAgICAgIGRpYWdvbmFsVG9wUmlnaHQgPT09IGxlbmd0aE9mQm9hcmQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ3lvJylcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgcGxheWVycyA6IF8uZXh0ZW5kKHRoaXMuc3RhdGUucGxheWVycywge1t0aGlzLnN0YXRlLmN1cnJlbnRQbGF5ZXJdOiB0aGlzLnN0YXRlLnBsYXllcnNbdGhpcy5zdGF0ZS5jdXJyZW50UGxheWVyXSArIDF9KVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHN5bWJvbDtcbiAgICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9J3Jvdyc+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwiYm9hcmQgY29sLXhzLTEyIGNvbC1zbS04IGNvbC1tZC02XCI+XG4gICAgICAgICAgPEJvYXJkIGNsaWNrSGFuZGxlcj17dGhpcy5jbGlja0hhbmRsZXJ9IGdhbWVTdGF0ZT17dGhpcy5zdGF0ZS5nYW1lU3RhdGV9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICAgIDxkaXYgY2xhc3NOYW1lPVwic2NvcmUgY29sLXhzLTEyICBjb2wtc20tNCBjb2wtbWQtNlwiPlxuICAgICAgICAgIDxTY29yZWJvYXJkIHdpbm5lcnM9e3RoaXMuc3RhdGUucGxheWVyc30vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==