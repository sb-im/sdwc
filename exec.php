<?php
/**
 *
 */
class Exec
{

  function __construct()
  {
    $this->filename = "exec.txt";
  }

  function add($txt = "")
  {
    $myfile = fopen($this->filename, "w") or die("Unable to open file!");

    fwrite($myfile, $txt);
    fclose($myfile);
    return 0;
  }
}
?>
