<?php

class BinanceClient {
    private $baseUrl = "https://api.binance.com/api/v3/";

    public function getLatestCandle($symbol) {
        $url = $this->baseUrl . "klines?symbol=" . strtoupper($symbol) . "USDT&interval=1m&limit=2";
        $response = $this->request($url);
        if (!$response) return null;

        $data = json_decode($response, true);
        if (empty($data)) return null;

        $closedCandle = $data[0];

        return [
            'timestamp' => $closedCandle[0],
            'open'      => (float)$closedCandle[1],
            'high'      => (float)$closedCandle[2],
            'low'       => (float)$closedCandle[3],
            'close'     => (float)$closedCandle[4],
            'volume'    => (float)$closedCandle[5]
        ];
    }

    public function getKlines($symbol, $interval = '1m', $limit = 100) {
        $url = $this->baseUrl . "klines?symbol=" . strtoupper($symbol) . "USDT&interval=$interval&limit=$limit";
        $response = $this->request($url);
        if (!$response) return [];
        return json_decode($response, true);
    }

    public function placeOrder($apiKey, $apiSecret, $symbol, $side, $type, $quantity) {
        if (!$apiKey || !$apiSecret) return ['success' => false, 'message' => 'API credentials missing'];

        $endpoint = "order";
        $params = [
            'symbol' => strtoupper($symbol) . "USDT",
            'side' => strtoupper($side), // BUY or SELL
            'type' => strtoupper($type), // MARKET
            'quantity' => $quantity,
            'timestamp' => round(microtime(true) * 1000)
        ];

        $query = http_build_query($params);
        $signature = hash_hmac('sha256', $query, $apiSecret);
        $url = $this->baseUrl . $endpoint . "?" . $query . "&signature=" . $signature;

        $response = $this->request($url, 'POST', [
            'X-MBX-APIKEY: ' . $apiKey
        ]);

        return json_decode($response, true);
    }

    private function request($url, $method = 'GET', $headers = []) {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        if (!empty($headers)) {
            curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        }
        $response = curl_exec($ch);
        curl_close($ch);
        return $response;
    }
}
