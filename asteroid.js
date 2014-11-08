var gameOptions = {
  height: window.innerHeight,
  width: window.innerWidth,
  nEnemies: 30,
  padding: 20
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collisions: 0
};

var axes = {
  x: d3.scale.linear().domain([0, 100]).range([0, gameOptions.width]),
  y: d3.scale.linear().domain([0, 100]).range([0, gameOptions.height])
};

// Main Container

var gameBoard = d3.select('.container').append('svg:svg').attr({
  width: gameOptions.width,
  height: gameOptions.height
});

function updateScore() {
  return d3.select(".current")
    .text(gameStats.score.toString());
}

function updateBestScore() {
  gameStats.bestScore = _.max([gameStats.bestScore, gameStats.score]);
  return d3.select('.high').text(gameStats.bestScore.toString());
}

// Player

var d = [{ x: gameOptions.width * 0.5, y: gameOptions.height * 0.5}];

var main = d3.select("body").select("svg")
  .data(d).append("g");

var player = main.append('svg:path')
  .attr('d', 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z')
  .attr({
    class: 'player',
    fill: 'pink',
    cx: function(d) { return d.x; },
    cy: function(d) { return d.y; },
    r: 10
  })
  .attr("transform", function (d) { return "translate(" + d.x + "," + d.y + ")"; })
  .call(onDragDrop(dragmove, dropHandler));

// Drag Utilities
function onDragDrop(dragHandler, dropHandler) {
  var drag = d3.behavior.drag();

  drag.on("drag", dragHandler)
      .on("dragend", dropHandler);
  
  return drag;
}

function dropHandler(d) {
  //console.log('dropped');
}

function dragmove(d) {
  d.x += d3.event.dx;
  d.y += d3.event.dy;
  d3.select(this)
    .attr("transform", "translate(" + d.x + ","  + d.y + ")")
    .attr('cx', d.x)
    .attr('cy', d.y);
}

// Create Asteroids
function createEnemies() {
  return _.range(0, gameOptions.nEnemies).map(function(i) {
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    };
  });
}

function renderAsteroids(data) {
  var enemies = gameBoard.selectAll('circle')
    .data(data, function(d) { return d.id; });

  // Enter new elements as needed
  enemies.enter().append('svg:circle')
    .attr({
      class: 'enemy',
      cx: function(d) { return axes.x(d.x); },
      cy: function(d) { return axes.y(d.y); },
      r: 0,
      fill: 'lightblue',
      stroke: 'white'
    });
  // Exit
  enemies.exit().remove();

  function checkCollision(enemy, callback) {
    var p = d3.select('.player');

    var radiusSum = parseFloat(enemy.attr('r')) + p.attr('r');
    var xDiff = parseFloat(enemy.attr('cx')) - p.attr('x');
    var yDiff = parseFloat(enemy.attr('cy')) - p.attr('y');
    var seperation = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
    
    console.log("seperation " + seperation);
    console.log("radiusSum " + radiusSum);

    if (seperation < radiusSum) {
      return callback();
    }
  }

  function onCollision() {
    updateBestScore();
    gameStats.score = 0;
    return updateScore();
  }

  function tween(data) {
    var enemy = d3.select(this);
    var startPos = {
      x: parseFloat(enemy.attr('cx')),
      y: parseFloat(enemy.attr('cy'))
    };
    var endPos = {
      x: axes.x(data.x),
      y: axes.y(data.y)
    };

    return function(t) {
      checkCollision(enemy, onCollision);

      var nextPos = {
        x: startPos.x + (endPos.x - startPos.x) * t,
        y: startPos.y + (endPos.y - startPos.y) * t,
      };
      return enemy.attr('cx', nextPos.x).attr('cy', nextPos.y);
    };
  }
  // Return Animated Astroids
  return enemies.transition()
    .duration(2000)
    .attr('r', 7)
      .duration(1500)
      .tween('custom', tween);
}

// Call Initial Enemies Display
function initGame() {
  var newPositions;
  newPositions = createEnemies();
  return renderAsteroids(newPositions);
}

function spamScore() {
  gameStats.score += 1;
  return updateScore();
}

initGame();

//Set Interval
setInterval(initGame, 2000);
setInterval(spamScore, 50);
















