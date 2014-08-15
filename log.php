<?php
  $paragraphNum = $_POST["paragraphNum"];
  $wordNum = $_POST["wordNum"];
  $text = $_POST["text"];
  $comments = $_POST["comments"];

//TODO: make it csv.
  $logText = Date('Y-m-d H:i:s') . " " . $text . ',' . $comments . "\n";

  file_put_contents('reported_Typos.log', $logText, FILE_APPEND);
  echo "Typo recorded. Nice.";

?>