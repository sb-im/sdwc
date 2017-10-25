<?php

require('exec.php');

echo $_GET["cmd"];
$cmd = $_GET["cmd"];
//echo phpinfo();



// if xss sql add future
if($cmd) {
  $exe = new Exec;
  if ($exe->add($cmd) == 0) {
    $message = $cmd;
  } else {
    $message = "error";
  }
} else {
  $message = "error";
}
?>
