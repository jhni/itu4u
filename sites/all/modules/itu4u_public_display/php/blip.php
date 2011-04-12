<?php 
	function curl_get_file_contents($URL)
	{
        $c = curl_init();
        curl_setopt($c, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($c, CURLOPT_URL, $URL);
        $contents = curl_exec($c);
        curl_close($c);

        if ($contents) return $contents;
            else return FALSE;
	}


	// Actual 
	$contents = curl_get_file_contents("http://pit.itu.dk:7331/terminals-in/".$_GET['zone']);

	// Debug
	//$contents = '[{"terminal-id":"000ea50050e4"},{"terminal-id":"000ea50050c0"},{"terminal-id":"000ea50050b8"},{"terminal-id":"000ea50050bc"}]';
	//$contents = '[{"terminal-id":"000ea50050b0"},{"terminal-id":"000ea50050b8"},{"terminal-id":"000ea50050bc"}]';
	//$contents = '[{"terminal-id":"00236ca3b7be"},{"terminal-id":"000ea50050b8"},{"terminal-id":"000ea50050e4"}]';
	
	
	
	
	//$contents = '[{}]';

	echo $_GET['jsoncallback'] . '(' . $contents . ');';

?>


