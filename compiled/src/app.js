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

    _this.player1Name = prompt('what is your name, player X?');
    _this.player2Name = prompt('what is your name, player O?');
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
      if (this.state.winner) {
        return;
      }
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
    key: 'newGameCondition',
    value: function newGameCondition(e) {
      this.setState({
        winner: false,
        gameState: [['', '', ''], ['', '', ''], ['', '', '']]
      });
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
          React.createElement(Scoreboard, { turn: this.state.currentTurnPlayer, winners: this.state.players, newGame: this.newGameCondition.bind(this) })
        )
      );
    }
  }]);

  return App;
}(React.Component);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9hcHAuanN4Il0sIm5hbWVzIjpbIkFwcCIsInBsYXllcjFOYW1lIiwicHJvbXB0IiwicGxheWVyMk5hbWUiLCJwbGF5ZXIxIiwicGxheWVyMiIsInN0YXRlIiwiY3VycmVudFR1cm5QbGF5ZXIiLCJjdXJyZW50UGxheWVyIiwicGxheWVycyIsImdhbWVTdGF0ZSIsIndpbm5lciIsImNsaWNrSGFuZGxlciIsImJpbmQiLCJlIiwidGFyZ2V0IiwiaW5uZXJIVE1MIiwibmV3R2FtZVN0YXRlIiwic2xpY2UiLCJpZCIsInNldFN0YXRlIiwiaGFzV2lubmVyIiwicHJldlByb3BzIiwicHJldlN0YXRlIiwiYWxlcnQiLCJzeW1ib2wiLCJob3Jpem9udGFsIiwidmVydGljYWwiLCJkaWFnb25hbFRvcExlZnQiLCJkaWFnb25hbFRvcFJpZ2h0IiwibGVuZ3RoT2ZCb2FyZCIsImxlbmd0aCIsImkiLCJjb25zb2xlIiwibG9nIiwiXyIsImV4dGVuZCIsIm5ld0dhbWVDb25kaXRpb24iLCJSZWFjdCIsIkNvbXBvbmVudCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0lBQ01BLEc7OztBQUVKLGlCQUFhO0FBQUE7O0FBQUE7O0FBQUE7O0FBRVgsVUFBS0MsV0FBTCxHQUFtQkMsT0FBTyw4QkFBUCxDQUFuQjtBQUNBLFVBQUtDLFdBQUwsR0FBbUJELE9BQU8sOEJBQVAsQ0FBbkI7QUFDQSxVQUFLRSxPQUFMLEdBQWdCLEdBQWhCO0FBQ0EsVUFBS0MsT0FBTCxHQUFlLEdBQWY7QUFDQSxVQUFLQyxLQUFMLEdBQWE7QUFDWEMseUJBQW1CLEdBRFI7QUFFWEMscUJBQWUsTUFBS1AsV0FGVDtBQUdYUSx5REFBVyxNQUFLUixXQUFoQixFQUE4QixDQUE5Qiw2QkFBa0MsTUFBS0UsV0FBdkMsRUFBcUQsQ0FBckQsWUFIVztBQUlYTyxpQkFBVyxDQUFDLENBQUMsRUFBRCxFQUFJLEVBQUosRUFBTyxFQUFQLENBQUQsRUFBWSxDQUFDLEVBQUQsRUFBSSxFQUFKLEVB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SUFHREQscUJBQXFCQyxhQUh2QixFQUdzQztBQUNsQ0csZ0JBQVFDLEdBQVIsQ0FBWSxJQUFaO0FBQ0EsYUFBS2QsUUFBTCxDQUFjO0FBQ1pYLG1CQUFVMEIsRUFBRUMsTUFBRixDQUFTLEtBQUs5QixLQUFMLENBQVdHLE9BQXBCLHNCQUErQixLQUFLSCxLQUFMLENBQVdFLGFBQTFDLEVBQTBELEtBQUtGLEtBQUwsQ0FBV0csT0FBWCxDQUFtQixLQUFLSCxLQUFMLENBQVdFLGFBQTlCLElBQStDLENBQXpHO0FBREUsU0FBZDtBQUdBLGVBQU9pQixNQUFQO0FBQ0Q7O0FBRUgsYUFBTyxLQUFQO0FBQ0Q7Ozs2QkFFUTtBQUNQLGFBQ0U7QUFBQTtBQUFBLFVBQUssV0FBVSxLQUFmO0FBQ0U7QUFBQTtBQUFBLFlBQUssV0FBVSxtQ0FBZjtBQUNFLDhCQUFDLEtBQUQsSUFBTyxjQUFjLEtBQUtiLFlBQTFCLEVBQXdDLFdBQVcsS0FBS04sS0FBTCxDQUFXSSxTQUE5RDtBQURGLFNBREY7QUFJRTtBQUFBO0FBQUEsWUFBSyxXQUFVLG9DQUFmO0FBQ0UsOEJBQUMsVUFBRCxJQUFZLE1BQU0sS0FBS0osS0FBTCxDQUFXQyxpQkFBN0IsRUFBZ0QsU0FBUyxLQUFLRCxLQUFMLENBQVdHLE9BQXBFLEVBQTZFLFNBQVMsS0FBSzRCLGdCQUFMLENBQXNCeEIsSUFBdEIsQ0FBMkIsSUFBM0IsQ0FBdEY7QUFERjtBQUpGLE9BREY7QUFVRDs7OztFQTFGZXlCLE1BQU1DLFMiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5jbGFzcyBBcHAgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuXG4gIGNvbnN0cnVjdG9yKCl7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLnBsYXllcjFOYW1lID0gcHJvbXB0KCd3aGF0IGlzIHlvdXIgbmFtZSwgcGxheWVyIFg/Jyk7XG4gICAgdGhpcy5wbGF5ZXIyTmFtZSA9IHByb21wdCgnd2hhdCBpcyB5b3VyIG5hbWUsIHBsYXllciBPPycpO1xuICAgIHRoaXMucGxheWVyMSA9ICBcIlhcIjtcbiAgICB0aGlzLnBsYXllcjIgPSBcIk9cIjtcbiAgICB0aGlzLnN0YXRlID0ge1xuICAgICAgY3VycmVudFR1cm5QbGF5ZXI6IFwiWFwiLFxuICAgICAgY3VycmVudFBsYXllcjogdGhpcy5wbGF5ZXIxTmFtZSxcbiAgICAgIHBsYXllcnM6IHtbdGhpcy5wbGF5ZXIxTmFtZV06IDAsIFt0aGlzLnBsYXllcjJOYW1lXTogMH0sXG4gICAgICBnYW1lU3RhdGU6IFtbJycsJycsJyddLFsnJywnJywnJ10sWycnLCcnLCcnXV0sXG4gICAgICB3aW5uZXI6IGZhbHNlXG4gICAgfTtcbiAgICB0aGlzLmNsaWNrSGFuZGxlciA9IHRoaXMuY2xpY2tIYW5kbGVyLmJpbmQodGhpcyk7XG4gIH1cblxuICBjbGlja0hhbmRsZXIoZSl7XG4gICAgaWYodGhpcy5zdGF0ZS53aW5uZXIpe3JldHVybn1cbiAgICBpZighZS50YXJnZXQuaW5uZXJIVE1MKSB7XG4gICAgICB2YXIgbmV3R2FtZVN0YXRlID0gdGhpcy5zdGF0ZS5nYW1lU3RhdGUuc2xpY2UoMCk7XG4gICAgICBuZXdHYW1lU3RhdGVbZS50YXJnZXQuaWRbMF1dW2UudGFyZ2V0LmlkWzFdXSA9IHRoaXMuc3RhdGUuY3VycmVudFR1cm5QbGF5ZXI7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgZ2FtZVN0YXRlIDogbmV3R2FtZVN0YXRlLFxuICAgICAgICBjdXJyZW50UGxheWVyOiB0aGlzLnN0YXRlLmN1cnJlbnRUdXJuUGxheWVyID09PSBcIlhcIiA/IHRoaXMucGxheWVyMk5hbWUgOiB0aGlzLnBsYXllcjFOYW1lLFxuICAgICAgICBjdXJyZW50VHVyblBsYXllciA6IHRoaXMuc3RhdGUuY3VycmVudFR1cm5QbGF5ZXIgPT09IFwiWFwiID8gdGhpcy5wbGF5ZXIyIDogdGhpcy5wbGF5ZXIxLFxuICAgICAgICB3aW5uZXI6IHRoaXMuaGFzV2lubmVyKGUudGFyZ2V0LmlkLCB0aGlzLnN0YXRlLmN1cnJlbnRUdXJuUGxheWVyKSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGNvbXBvbmVudERpZFVwZGF0ZShwcmV2UHJvcHMsIHByZXZTdGF0ZSl7XG4gICAgaWYodGhpcy5zdGF0ZS53aW5uZXIpe1xuICAgICAgYWxlcnQocHJldlN0YXRlLmN1cnJlbnRQbGF5ZXIgKyAnIHdvbiEnKTtcbiAgICB9XG4gIH1cblxuICBuZXdHYW1lQ29uZGl0aW9uKGUpIHtcbiAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgIHdpbm5lcjogZmFsc2UsXG4gICAgICBnYW1lU3RhdGU6IFtbJycsJycsJyddLFsnJywnJywnJ10sWycnLCcnLCcnXV1cbiAgICB9KTtcbiAgfVxuXG4gIGhhc1dpbm5lcihpZCwgc3ltYm9sKXtcbiAgICB2YXIgaG9yaXpvbnRhbCA9IDA7XG4gICAgdmFyIHZlcnRpY2FsID0gMDtcbiAgICB2YXIgZGlhZ29uYWxUb3BMZWZ0ID0gMDtcbiAgICB2YXIgZGlhZ29uYWxUb3BSaWdodCA9IDA7XG4gICAgdmFyIGxlbmd0aE9mQm9hcmQgPSB0aGlzLnN0YXRlLmdhbWVTdGF0ZS5sZW5ndGg7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuc3RhdGUuZ2FtZVN0YXRlLmxlbmd0aDsgaSsrKXtcbiAgICAgIGlmKHN5bWJvbCA9PT0gdGhpcy5zdGF0ZS5nYW1lU3RhdGVbaWRbMF1dW2ldKSB7XG4gICAgICAgIHZlcnRpY2FsKys7XG4gICAgICB9XG4gICAgICBpZihzeW1ib2wgPT09IHRoaXMuc3RhdGUuZ2FtZVN0YXRlW2ldW2lkWzFdXSkge1xuICAgICAgICBob3Jpem9udGFsKys7XG4gICAgICB9XG4gICAgICBpZih0aGlzLnN0YXRlLmdhbWVTdGF0ZVtpXVtpXSA9PT0gc3ltYm9sKSB7XG4gICAgICAgIGRpYWdvbmFsVG9wTGVmdCsrO1xuICAgICAgfVxuICAgICAgaWYodGhpcy5zdGF0ZS5nYW1lU3RhdGVbbGVuZ3RoT2ZCb2FyZCAtIDEgLSBpXVtpXSA9PT0gc3ltYm9sKSB7XG4gICAgICAgIGRpYWdvbmFsVG9wUmlnaHQrKztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYoaG9yaXpvbnRhbCA9PT0gbGVuZ3RoT2ZCb2FyZCB8fFxuICAgICAgdmVydGljYWwgPT09IGxlbmd0aE9mQm9hcmQgfHxcbiAgICAgIGRpYWdvbmFsVG9wTGVmdCA9PT0gbGVuZ3RoT2ZCb2FyZCB8fFxuICAgICAgZGlhZ29uYWxUb3BSaWdodCA9PT0gbGVuZ3RoT2ZCb2FyZCkge1xuICAgICAgICBjb25zb2xlLmxvZygneW8nKVxuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICBwbGF5ZXJzIDogXy5leHRlbmQodGhpcy5zdGF0ZS5wbGF5ZXJzLCB7W3RoaXMuc3RhdGUuY3VycmVudFBsYXllcl06IHRoaXMuc3RhdGUucGxheWVyc1t0aGlzLnN0YXRlLmN1cnJlbnRQbGF5ZXJdICsgMX0pXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gc3ltYm9sO1xuICAgICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT0ncm93Jz5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJib2FyZCBjb2wteHMtMTIgY29sLXNtLTggY29sLW1kLTZcIj5cbiAgICAgICAgICA8Qm9hcmQgY2xpY2tIYW5kbGVyPXt0aGlzLmNsaWNrSGFuZGxlcn0gZ2FtZVN0YXRlPXt0aGlzLnN0YXRlLmdhbWVTdGF0ZX0vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgICAgPGRpdiBjbGFzc05hbWU9XCJzY29yZSBjb2wteHMtMTIgIGNvbC1zbS00IGNvbC1tZC02XCI+XG4gICAgICAgICAgPFNjb3JlYm9hcmQgdHVybj17dGhpcy5zdGF0ZS5jdXJyZW50VHVyblBsYXllcn0gd2lubmVycz17dGhpcy5zdGF0ZS5wbGF5ZXJzfSBuZXdHYW1lPXt0aGlzLm5ld0dhbWVDb25kaXRpb24uYmluZCh0aGlzKX0vPlxuICAgICAgICA8L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn1cbiJdfQ==