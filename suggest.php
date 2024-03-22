<html>
	<body>
		<?php
		$message = $_POST["message"];
		$append = "$message ~";

		file_put_contents('messages.txt', $append, FILE_APPEND | LOCK_EX);
		echo "Succesfully submitted code\nMessages so far since launch (first to last):\n";
		
		$file = fopen("messages.txt", "r") or die("Unable to open messages!");
		echo fread($file, filesize("messages.txt"));
		fclose($file);
		?>
	</body>
</html>