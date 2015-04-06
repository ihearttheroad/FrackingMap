var width = 690,
  height = 346,
  zoomed = false,
  active = d3.select(null);

var stateColors = {
  "default": "#DDD",
  "frack-rules-expected": "#e3ac1e",
  "frack-with-rules": [
    "#315c85",
    "#3b6e9e",
    "#4480b8"
  ],
  "no-frack-rules-expected": undefined,
  "no-frack-with-rules": undefined
};

var svg = d3.select("#frack-map").append("svg")
  .attr("width", width)
  .attr("height", height);

var noFrackWithRulesTexture = textures.lines().thicker().stroke(stateColors["frack-with-rules"][1]).background(stateColors.default);
var noFrackRulesExpectedTexture = textures.lines().thicker().stroke(stateColors["frack-rules-expected"]).background(stateColors.default);

svg.call(noFrackWithRulesTexture);
svg.call(noFrackRulesExpectedTexture);

stateColors["no-frack-rules-expected"] = noFrackRulesExpectedTexture.url();
stateColors["no-frack-with-rules"] = noFrackWithRulesTexture.url();


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

$('#map-legend-colors').show();
$('#map-legend-detail').hide();

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

        //return texture.url();

        if (frackData && frackData == "frack-with-rules") {
          //return stateColors.frack-with-rules[Math.floor(Math.random() * 3)];
          return stateColors["frack-with-rules"][1];
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

  g.selectAll('.map--state-label')
    .data(states.features)
    .enter().append("text")
    .attr({
      class: "map--state-label",
      x: function(d) {return labelPlacement(d)[0];},
      y: function(d) {return labelPlacement(d)[1];}
    })
    .style({
      "font-size": "9px"
    })
    .text(function(d) { return d.properties.postal; });

}

function labelPlacement(d) {
  var centroid = path.centroid(d);

  switch (d.properties.postal) {
    case "MI":
      centroid[0] += 5;
      centroid[1] += 15;
      break;
    case "FL":
      centroid[0] += 8;
      break;
    case "LA":
      centroid[0] -= 6;
      break;
    case "DC":
      centroid[1] += 5;
      break;
    case "MD":
      centroid[1] -= 3;
      break;
    case "DE":
      centroid[0] += 4;
      break;
    case "VT":
      centroid[1] -= 3;
      break;
    case "NH":
      centroid[1] += 4;
      break;
    case "RI":
      centroid[0] += 5;
      centroid[1] += 3;
  }

  return centroid;
}

function showFactoid(state) {
  var $factoid = $('#factoid--state-' + state);
  if ($factoid.length) {
    $('#map-legend-colors').hide();
    $('#map-legend-detail').show();
    $('#frack-overlay').addClass('active');
    $('.frack-overlay--title').html($factoid.find('.factoid--title').html());
    $('.frack-overlay--content').html($factoid.find('.factoid--content').html());
  } else {
    hideFactoid();
  }
}

function hideFactoid() {
  $('#map-legend-colors').show();
  $('#map-legend-detail').hide();
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
    translate = [(width / 2 - scale * x) + 175, height / 2 - scale * y];

  g.transition()
    .duration(750)
    .style("stroke-width", 2 / scale + "px")
    .attr("transform", "translate(" + translate + ")scale(" + scale + ")");

  g.selectAll('.map--state-label')
    .transition()
    .duration(750)
    .style("font-size", function() {return (scale > 3) ? "3px" : "5px";});
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

  g.selectAll('.map--state-label')
    .transition()
    .duration(750)
    .style("font-size", "9px");
}