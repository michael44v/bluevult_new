<?php

class Logger {
    private $logFile;

    public function __construct($filename = "bot.log") {
        $this->logFile = __DIR__ . "/../../logs/" . $filename;
        if (!file_exists(dirname($this->logFile))) {
            mkdir(dirname($this->logFile), 0777, true);
        }
    }

    public function log($message, $userId = null) {
        $timestamp = date("Y-m-d H:i:s");
        $userPrefix = $userId ? "[User #$userId] " : "[System] ";
        $formattedMessage = "$timestamp $userPrefix$message\n";
        file_put_contents($this->logFile, $formattedMessage, FILE_APPEND);
        // Also log to error_log for visibility in some environments
        error_log($formattedMessage);
    }
}
