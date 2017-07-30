
let Scoreboard = (props) => {
  var winners = [];
  for(var player in props.winners){
    winners.push(<li key={player}>{player+' : '}{props.winners[player]}</li>);
  }



  return (
    <div>
      <span
        style={{
          textDecoration: 'underline',
          padding: '20px 20px 20px 40px'
        }}
      >Winner Record:</span>
      <button>Add Player!</button>
      <ul style={{listStyleType: 'none'}}>
        {winners}
      </ul>
    </div>
  );
}
