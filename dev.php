<?php
function killit() {
	header('Location: /index.html',true,307);
	die();
}

$url = $_GET['page'] ?: '';
if (!$url) {
	killit();
}

$content = file_get_contents('template.html');
$matches=[];
$done = [];
if (preg_match_all('/{load([^}]+)}/',$content,$matches)) {
	foreach ($matches[0] as $k=>$v) {
		$block = '';
		if (!in_array($v, $done)) {
			$load = trim($matches[1][$k]);
			$fn = (($load == 'main') ? $url : $load) . ".part.html";
			if (!file_exists($fn)) {
				killit();
			}
			$block = file_get_contents($fn);
			$done[$v] = $block;
		}
	}
	$content = str_replace(array_keys($done), $done, $content);
}
echo $content;