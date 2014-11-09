var gameOptions = {
  height: window.innerHeight,
  width: window.innerWidth,
  nEnemies: 15,
  r: 15
};

var gameStats = {
  score: 0,
  bestScore: 0,
  collisions: 0
};

var rand  = function(n){ return Math.floor( Math.random() * n ); };
var randX = function(){ return rand(gameOptions.width-gameOptions.r*2); };
var randY = function(){ return rand(gameOptions.height-gameOptions.r*2); };

// Score Tracker

function scoreTracker() {
  gameStats.score += 1;
  gameStats.bestScore = _.max([gameStats.bestScore, gameStats.score]);
  d3.select('.high').text(gameStats.bestScore.toString());
  d3.select(".current").text(gameStats.score.toString());
  d3.select(".collisions").text(gameStats.collisions.toString());
}
setInterval(scoreTracker, 100);

// Main Board

var gameBoard = d3.select('div.container').append('svg:svg').attr({
  width: gameOptions.width,
  height: gameOptions.height
});

// Player
var d = [{ x: gameOptions.width * 0.5, y: gameOptions.height * 0.5}];

var main = d3.select("body").select("svg")
  .data(d).append("g");

var player = main.append('svg:image')
  .attr({
    'xlink:href': 'images/cat.png',
    class: 'player',
    width: 100,
    height: 100,
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

// Create Enemies
function createEnemies() {
  return _.range(0, gameOptions.nEnemies).map(function(i) {
    return {
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100
    };
  });
}

var enemies = gameBoard.selectAll('.enemy')
  .data(createEnemies())
  .enter().append('svg:image')
  .attr({
    'xlink:href': 'images/yarn.png',
    width: 0,
    height: 0,
    class: 'enemy',
    x: randX,
    y: randY
  });
 
// Animate Enemies 
function move(element) {
  element.transition()
    .duration(2000)
    .ease('linear')
    .attr({
      width: 30,
      height: 30,
      x: randX,
      y: randY
    })
    .each('end', function() {
      move( d3.select(this) );
    });
}
// Get moving!
move(enemies);

// Collision handling

var prevCollision = false;

function detectCollisions() {
  var collision = false;

  enemies.each(function() {
    var cx = d3.select(this).attr('x') + gameOptions.r;
    var cy = d3.select(this).attr('y') + gameOptions.r;

    var x = cx - player.attr('cx');
    var y = cy - player.attr('cy');

    if(Math.sqrt(x*x + y*y) < gameOptions.r) {
      collision = true;
    }
  });

  if(collision) {
    gameStats.score = 0;
    if(prevCollision != collision) {
      gameStats.collisions = gameStats.collisions + 1;
    }
  } else {
    player.attr('xlink:href', 'images/cat.png');
  }
  prevCollision = collision;
}

d3.timer(detectCollisions);

