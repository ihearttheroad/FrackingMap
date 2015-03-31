var width = 690,
  height = 346,
  zoomed = false,
  active = d3.select(null);

var stateColors = {
  "default": "#DDD",
  "proposed": "#e3ac1e",
  "exist": [
    "#315c85",
    "#3b6e9e",
    "#4480b8"
  ]
};

var svg = d3.select("#frack-map").append("svg")
  .attr("width", width)
  .attr("height", height);

var g = svg.append("g");

var projection = d3.geo.albersUsa().scale(690).translate([width / 2, height / 2]);
var path = d3.geo.path().projection(projection);

d3.json("json/us-states.geojson", function(error, geoData) {
  drawStates(geoData);
});

$(".frack-overlay--close").click(function() {
  hideFactoid();
  zoomOut();
});

function drawStates(states) {
  g.selectAll(".map--state")
    .data(states.features)
    .enter().append("path")
    .attr({
      "class": function(d) {return "map--state map--state-" + d.properties.postal;},
      "d": path,
      "stroke": "#FFF",
      "stroke-width": 1.5,
      "fill": function(d, i) {
        var frackData = $('#factoid--state-' + d.properties.postal).data('frackStatus');

        if (frackData && frackData == 'exist') {
          //return stateColors.exist[Math.floor(Math.random() * 3)];
          return stateColors.exist[1];
        }
        if (frackData) {
          return stateColors[frackData];
        } else {
          return stateColors.default;
        }
      }
    })
    .on("click", function(d) {
      if (active.node() !== this) {
        zoomIn(d, this);
        showFactoid(d.properties.postal);
      } else {
        zoomOut();
        hideFactoid();
      }
    });
}

function showFactoid(state) {
  var $factoid = $('#factoid--state-' + state);
  if ($factoid.length) {
    $('#frack-overlay').addClass('active');
    $('.frack-overlay--content').html($factoid.html());
  } else {
    hideFactoid();
  }
}

function hideFactoid() {
  $('#frack-overlay').removeClass('active');
  $('.frack-overlay--content').empty();
}

function zoomIn(d, svgElement) {
  zoomed = true;
  d3.select('.map--state.active').classed("active", false);
  active = d3.select(svgElement);
  active.classed("active", true);

  var bounds = path.bounds(d),
    dx = bounds[1][0] - bounds[0][0],
    dy = bounds[1][1] - bounds[0][1],
    x = (bounds[0][0] + bounds[1][0]) / 2,
    y = (bounds[0][1] + bounds[1][1]) / 2,
    scale = 0.8 / Math.max(dx / width, dy / height),
    translate = [(width / 2 - scale * x) + 80, height / 2 - scale * y];

  g.transition()
    .duration(750)
    .style("stroke-width", 2 / scale + "px")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
}

function zoomOut() {
  zoomed = false;
  active.classed("active", false);
  active = d3.select(null);

  d3.selectAll('svg .active').classed("active", false);

  g.transition()
    .duration(750)
    .style("stroke-width", "1px")
    .attr("transform", "");
}