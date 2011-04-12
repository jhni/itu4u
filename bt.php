<?php
$platform='';
if (isset($_SERVER['HTTP_USER_AGENT']))
{
	if (stripos($_SERVER['HTTP_USER_AGENT'],'Android')!==false) $platform='apk';
	elseif ((stripos($_SERVER['HTTP_USER_AGENT'],'MIDP')!==false)||(stripos($_SERVER['HTTP_USER_AGENT'],'CLDC')!==false)) $platform='jar';
}
switch ($platform)
{
	case 'apk':
		header('Content-Type: application/vnd.android.package-archive');
		header('Content-Disposition: attachment; filename="GetMyBTMac.apk"');
		readfile('sites/default/files/detect.apk');
		exit;
	case 'jar':
		header('Content-Type: application/java-archive');
		header('Content-Disposition: attachment; filename="GetMyBTMac2.jar"');
		readfile('sites/default/files/detect.jar');
		exit;
}
header('Location: http://itu4u.com/user/register');
