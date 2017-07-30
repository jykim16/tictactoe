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
      'span',
      {
        style: {
          textDecoration: 'underline',
          padding: '20px 20px 20px 40px'
        }
      },
      'Winner Record:'
    ),
    React.createElement(
      'button',
      null,
      'Add Player!'
    ),
    React.createElement(
      'ul',
      { style: { listStyleType: 'none' } },
      winners
    )
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zY29yZWJvYXJkLmpzeCJdLCJuYW1lcyI6WyJTY29yZWJvYXJkIiwicHJvcHMiLCJ3aW5uZXJzIiwicGxheWVyIiwicHVzaCIsInRleHREZWNvcmF0aW9uIiwicGFkZGluZyIsImxpc3RTdHlsZVR5cGUiXSwibWFwcGluZ3MiOiI7O0FBQ0EsSUFBSUEsYUFBYSxTQUFiQSxVQUFhLENBQUNDLEtBQUQsRUFBVztBQUMxQixNQUFJQyxVQUFVLEVBQWQ7QUFDQSxPQUFJLElBQUlDLE1BQVIsSUFBa0JGLE1BQU1DLE9BQXhCLEVBQWdDO0FBQzlCQSxZQUFRRSxJQUFSLENBQWE7QUFBQTtBQUFBLFFBQUksS0FBS0QsTUFBVDtBQUFrQkEsZUFBTyxLQUF6QjtBQUFnQ0YsWUFBTUMsT0FBTixDQUFjQyxNQUFkO0FBQWhDLEtBQWI7QUFDRDs7QUFJRCxTQUNFO0FBQUE7QUFBQTtBQUNFO0FBQUE7QUFBQTtBQUNFLGVBQU87QUFDTEUsMEJBQWdCLFdBRFg7QUFFTEMsbUJBQVM7QUFGSjtBQURUO0FBQUE7QUFBQSxLQURGO0FBT0U7QUFBQTtBQUFBO0FBQUE7QUFBQSxLQVBGO0FBUUU7QUFBQTtBQUFBLFFBQUksT0FBTyxFQUFDQyxlQUFlLE1BQWhCLEVBQVg7QUFDR0w7QUFESDtBQVJGLEdBREY7QUFjRCxDQXRCRCIsImZpbGUiOiJzY29yZWJvYXJkLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5sZXQgU2NvcmVib2FyZCA9IChwcm9wcykgPT4ge1xuICB2YXIgd2lubmVycyA9IFtdO1xuICBmb3IodmFyIHBsYXllciBpbiBwcm9wcy53aW5uZXJzKXtcbiAgICB3aW5uZXJzLnB1c2goPGxpIGtleT17cGxheWVyfT57cGxheWVyKycgOiAnfXtwcm9wcy53aW5uZXJzW3BsYXllcl19PC9saT4pO1xuICB9XG5cblxuXG4gIHJldHVybiAoXG4gICAgPGRpdj5cbiAgICAgIDxzcGFuXG4gICAgICAgIHN0eWxlPXt7XG4gICAgICAgICAgdGV4dERlY29yYXRpb246ICd1bmRlcmxpbmUnLFxuICAgICAgICAgIHBhZGRpbmc6ICcyMHB4IDIwcHggMjBweCA0MHB4J1xuICAgICAgICB9fVxuICAgICAgPldpbm5lciBSZWNvcmQ6PC9zcGFuPlxuICAgICAgPGJ1dHRvbj5BZGQgUGxheWVyITwvYnV0dG9uPlxuICAgICAgPHVsIHN0eWxlPXt7bGlzdFN0eWxlVHlwZTogJ25vbmUnfX0+XG4gICAgICAgIHt3aW5uZXJzfVxuICAgICAgPC91bD5cbiAgICA8L2Rpdj5cbiAgKTtcbn1cbiJdfQ==