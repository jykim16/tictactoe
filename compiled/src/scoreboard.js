'use strict';

var Scoreboard = function Scoreboard(props) {
  var winners = [];
  for (var player in props.winners) {
    winners.push(React.createElement(
      'li',
      { key: player },
      player + ' : ',
      props.winners[player]
    ));
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      'h1',
      {
        style: {
          textDecoration: 'underline',
          padding: '20px 20px 20px 40px'
        }
      },
      'Winner Record:'
    ),
    React.createElement(
      'h2',
      null,
      props.turn,
      '\'s Turn'
    ),
    React.createElement(
      'button',
      { onClick: props.newGame },
      'New Game!'
    ),
    React.createElement(
      'ul',
      { style: { listStyleType: 'none' } },
      winners
    )
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY29yZWJvYXJkLmpzeCJdLCJuYW1lcyI6WyJTY29yZWJvYXJkIiwicHJvcHMiLCJ3aW5uZXJzIiwicGxheWVyIiwicHVzaCIsInRleHREZWNvcmF0aW9uIiwicGFkZGluZyIsInR1cm4iLCJuZXdHYW1lIiwibGlzdFN0eWxlVHlwZSJdLCJtYXBwaW5ncyI6Ijs7QUFDQSxJQUFJQSxhQUFhLFNBQWJBLFVBQWEsQ0FBQ0MsS0FBRCxFQUFXO0FBQzFCLE1BQUlDLFVBQVUsRUFBZDtBQUNBLE9BQUksSUFBSUMsTUFBUixJQUFrQkYsTUFBTUMsT0FBeEIsRUFBZ0M7QUFDOUJBLFlBQVFFLElBQVIsQ0FBYTtBQUFBO0FBQUEsUUFBSSxLQUFLRCxNQUFUO0FBQWtCQSxlQUFPLEtBQXpCO0FBQWdDRixZQUFNQyxPQUFOLENBQWNDLE1BQWQ7QUFBaEMsS0FBYjtBQUNEOztBQUlELFNBQ0U7QUFBQTtBQUFBO0FBQ0U7QUFBQTtBQUFBO0FBQ0UsZUFBTztBQUNMRSwwQkFBZ0IsV0FEWDtBQUVMQyxtQkFBUztBQUZKO0FBRFQ7QUFBQTtBQUFBLEtBREY7QUFNc0I7QUFBQTtBQUFBO0FBQUtMLFlBQU1NLElBQVg7QUFBQTtBQUFBLEtBTnRCO0FBT0E7QUFBQTtBQUFBLFFBQVEsU0FBU04sTUFBTU8sT0FBdkI7QUFBQTtBQUFBLEtBUEE7QUFRRTtBQUFBO0FBQUEsUUFBSSxPQUFPLEVBQUNDLGVBQWUsTUFBaEIsRUFBWDtBQUNHUDtBQURIO0FBUkYsR0FERjtBQWNELENBdEJEIiwiZmlsZSI6InNjb3JlYm9hcmQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJcbmxldCBTY29yZWJvYXJkID0gKHByb3BzKSA9PiB7XG4gIHZhciB3aW5uZXJzID0gW107XG4gIGZvcih2YXIgcGxheWVyIGluIHByb3BzLndpbm5lcnMpe1xuICAgIHdpbm5lcnMucHVzaCg8bGkga2V5PXtwbGF5ZXJ9PntwbGF5ZXIrJyA6ICd9e3Byb3BzLndpbm5lcnNbcGxheWVyXX08L2xpPik7XG4gIH1cblxuXG5cbiAgcmV0dXJuIChcbiAgICA8ZGl2PlxuICAgICAgPGgxXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgdGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnLFxuICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDIwcHggMjBweCA0MHB4J1xuICAgICAgICB9fVxuICAgICAgPldpbm5lciBSZWNvcmQ6PC9oMT48aDI+e3Byb3BzLnR1cm59JiMzOTtzIFR1cm48L2gyPlxuICAgIDxidXR0b24gb25DbGljaz17cHJvcHMubmV3R2FtZX0+TmV3IEdhbWUhPC9idXR0b24+XG4gICAgICA8dWwgc3R5bGU9e3tsaXN0U3R5bGVUeXBlOiAnbm9uZSd9fT5cbiAgICAgICAge3dpbm5lcnN9XG4gICAgICA8L3VsPlxuICAgIDwvZGl2PlxuICApO1xufVxuIl19
