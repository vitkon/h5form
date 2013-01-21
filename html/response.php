<?php
	header("HTTP/1.0 500 Not Found");
	//header('Content-Type: application/json');

	$errors = array(
		array('message' => 'test message', 'field_name' => 'email1'),
		array('message' => 'test message 2', 'field_name' => 'email2')
	);

	echo json_encode(array('error_messages' => $errors));
?>