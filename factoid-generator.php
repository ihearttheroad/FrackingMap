<?php

$template = '<div id="factoid--state-[[STATE-ID]]" data-frack-status="">' . "\n" .
           '  <h2 class="factoid--title">[[STATE-TITLE]]</h2>' . "\n" .
           '  <div class="factoid--content">'  . "\n" .
           '' . "\n" .
           '  </div>' . "\n" .
           '</div>' . "\n";

$document = '';

$states_raw = file_get_contents('json/us-states.geojson');
$states = json_decode($states_raw);

foreach($states->features as $state) {
  $snippet = str_replace('[[STATE-ID]]', $state->properties->postal, $template);
  $snippet = str_replace('[[STATE-TITLE]]', $state->properties->name, $snippet);

  $document .= $snippet;
}

echo $document;