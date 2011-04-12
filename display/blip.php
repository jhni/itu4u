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



	// Debug
	//$contents = '[{"terminal-id":"000ea50050b0"},{"terminal-id":"000ea50050c0"},{"terminal-id":"000ea50050b8"},{"terminal-id":"000ea50050bc"}]';
	$contents = '[{"terminal-id":"000ea50050b0"},{"terminal-id":"000ea50050b8"},{"terminal-id":"000ea50050bc"}]';
	$contents = '[{}]';
		 
	
	
	// Actual 
	//$contents = curl_get_file_contents("http://pit.itu.dk:7331/terminals-in/itu.zone2.zone2e"); 	
	
	
	echo $_GET['jsoncallback'] . '(' . $contents . ');';

?>


