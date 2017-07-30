"use strict";

var Board = function Board(props) {
  return React.createElement(
    "table",
    null,
    React.createElement(
      "tbody",
      null,
      React.createElement(
        "tr",
        { className: "" },
        React.createElement(
          "td",
          { id: "00", onClick: props.clickHandler, className: "cell" },
          props.gameState[0][0]
        ),
        React.createElement(
          "td",
          { id: "01", onClick: props.clickHandler, className: "cell" },
          props.gameState[0][1]
        ),
        React.createElement(
          "td",
          { id: "02", onClick: props.clickHandler, className: "cell" },
          props.gameState[0][2]
        )
      ),
      React.createElement(
        "tr",
        { className: "" },
        React.createElement(
          "td",
          { id: "10", onClick: props.clickHandler, className: "cell" },
          props.gameState[1][0]
        ),
        React.createElement(
          "td",
          { id: "11", onClick: props.clickHandler, className: "cell" },
          props.gameState[1][1]
        ),
        React.createElement(
          "td",
          { id: "12", onClick: props.clickHandler, className: "cell" },
          props.gameState[1][2]
        )
      ),
      React.createElement(
        "tr",
        { className: "" },
        React.createElement(
          "td",
          { id: "20", onClick: props.clickHandler, className: "cell" },
          props.gameState[2][0]
        ),
        React.createElement(
          "td",
          { id: "21", onClick: props.clickHandler, className: "cell" },
          props.gameState[2][1]
        ),
        React.createElement(
          "td",
          { id: "22", onClick: props.clickHandler, className: "cell" },
          props.gameState[2][2]
        )
      )
    )
  );
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ib2FyZC5qc3giXSwibmFtZXMiOlsiQm9hcmQiLCJwcm9wcyIsImNsaWNrSGFuZGxlciIsImdhbWVTdGF0ZSJdLCJtYXBwaW5ncyI6Ijs7QUFDQSxJQUFJQSxRQUFRLFNBQVJBLEtBQVEsQ0FBQ0MsS0FBRCxFQUFXO0FBQ3JCLFNBQ0k7QUFBQTtBQUFBO0FBQ0U7QUFBQTtBQUFBO0FBQ0U7QUFBQTtBQUFBLFVBQUksV0FBVSxFQUFkO0FBQ0U7QUFBQTtBQUFBLFlBQUksSUFBRyxJQUFQLEVBQVksU0FBU0EsTUFBTUMsWUFBM0IsRUFBeUMsV0FBVSxNQUFuRDtBQUEyREQsZ0JBQU1FLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7QUFBM0QsU0FERjtBQUVFO0FBQUE7QUFBQSxZQUFJLElBQUcsSUFBUCxFQUFZLFNBQVNGLE1BQU1DLFlBQTNCLEVBQXlDLFdBQVUsTUFBbkQ7QUFBMkRELGdCQUFNRSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0FBQTNELFNBRkY7QUFHRTtBQUFBO0FBQUEsWUFBSSxJQUFHLElBQVAsRUFBWSxTQUFTRixNQUFNQyxZQUEzQixFQUF5QyxXQUFVLE1BQW5EO0FBQTJERCxnQkFBTUUsU0FBTixDQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUEzRDtBQUhGLE9BREY7QUFNRTtBQUFBO0FBQUEsVUFBSSxXQUFVLEVBQWQ7QUFDRTtBQUFBO0FBQUEsWUFBSSxJQUFHLElBQVAsRUFBWSxTQUFTRixNQUFNQyxZQUEzQixFQUF5QyxXQUFVLE1BQW5EO0FBQTJERCxnQkFBTUUsU0FBTixDQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUEzRCxTQURGO0FBRUU7QUFBQTtBQUFBLFlBQUksSUFBRyxJQUFQLEVBQVksU0FBU0YsTUFBTUMsWUFBM0IsRUFBeUMsV0FBVSxNQUFuRDtBQUEyREQsZ0JBQU1FLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7QUFBM0QsU0FGRjtBQUdFO0FBQUE7QUFBQSxZQUFJLElBQUcsSUFBUCxFQUFZLFNBQVNGLE1BQU1DLFlBQTNCLEVBQXlDLFdBQVUsTUFBbkQ7QUFBMkRELGdCQUFNRSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0FBQTNEO0FBSEYsT0FORjtBQVdFO0FBQUE7QUFBQSxVQUFJLFdBQVUsRUFBZDtBQUNFO0FBQUE7QUFBQSxZQUFJLElBQUcsSUFBUCxFQUFZLFNBQVNGLE1BQU1DLFlBQTNCLEVBQXlDLFdBQVUsTUFBbkQ7QUFBMkRELGdCQUFNRSxTQUFOLENBQWdCLENBQWhCLEVBQW1CLENBQW5CO0FBQTNELFNBREY7QUFFRTtBQUFBO0FBQUEsWUFBSSxJQUFHLElBQVAsRUFBWSxTQUFTRixNQUFNQyxZQUEzQixFQUF5QyxXQUFVLE1BQW5EO0FBQTJERCxnQkFBTUUsU0FBTixDQUFnQixDQUFoQixFQUFtQixDQUFuQjtBQUEzRCxTQUZGO0FBR0U7QUFBQTtBQUFBLFlBQUksSUFBRyxJQUFQLEVBQVksU0FBU0YsTUFBTUMsWUFBM0IsRUFBeUMsV0FBVSxNQUFuRDtBQUEyREQsZ0JBQU1FLFNBQU4sQ0FBZ0IsQ0FBaEIsRUFBbUIsQ0FBbkI7QUFBM0Q7QUFIRjtBQVhGO0FBREYsR0FESjtBQXFCRCxDQXRCRCIsImZpbGUiOiJib2FyZC5qcyIsInNvdXJjZXNDb250ZW50IjpbIlxubGV0IEJvYXJkID0gKHByb3BzKSA9PiB7XG4gIHJldHVybiAoXG4gICAgICA8dGFibGU+XG4gICAgICAgIDx0Ym9keT5cbiAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwiXCI+XG4gICAgICAgICAgICA8dGQgaWQ9JzAwJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzBdWzBdfTwvdGQ+XG4gICAgICAgICAgICA8dGQgaWQ9JzAxJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzBdWzFdfTwvdGQ+XG4gICAgICAgICAgICA8dGQgaWQ9JzAyJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzBdWzJdfTwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwiXCI+XG4gICAgICAgICAgICA8dGQgaWQ9JzEwJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzFdWzBdfTwvdGQ+XG4gICAgICAgICAgICA8dGQgaWQ9JzExJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzFdWzFdfTwvdGQ+XG4gICAgICAgICAgICA8dGQgaWQ9JzEyJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzFdWzJdfTwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgICA8dHIgY2xhc3NOYW1lPVwiXCI+XG4gICAgICAgICAgICA8dGQgaWQ9JzIwJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzJdWzBdfTwvdGQ+XG4gICAgICAgICAgICA8dGQgaWQ9JzIxJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzJdWzFdfTwvdGQ+XG4gICAgICAgICAgICA8dGQgaWQ9JzIyJyBvbkNsaWNrPXtwcm9wcy5jbGlja0hhbmRsZXJ9IGNsYXNzTmFtZT1cImNlbGxcIj57cHJvcHMuZ2FtZVN0YXRlWzJdWzJdfTwvdGQ+XG4gICAgICAgICAgPC90cj5cbiAgICAgICAgPC90Ym9keT5cbiAgICAgIDwvdGFibGU+XG4gICk7XG59XG4iXX0=