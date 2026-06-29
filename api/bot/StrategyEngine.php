<?php

class StrategyEngine {

    /**
     * RSI, Moving Averages based strategy
     * Returns 'up', 'down', or null
     */
    public function analyze($klines) {
        if (count($klines) < 20) return null;

        $closes = array_map(function($k) { return (float)$k[4]; }, $klines);

        $rsi = $this->calculateRSI($closes);
        $smaFast = $this->calculateSMA($closes, 7);
        $smaSlow = $this->calculateSMA($closes, 25);

        $lastClose = end($closes);
        $lastRsi = end($rsi);

        // Strategy: Buy if RSI < 30 (Oversold) OR SMA Crossover (Fast > Slow)
        // Sell if RSI > 70 (Overbought) OR SMA Crossover (Fast < Slow)

        if ($lastRsi < 35 && $smaFast > $smaSlow) {
            return 'up';
        }

        if ($lastRsi > 65 && $smaFast < $smaSlow) {
            return 'down';
        }

        return null;
    }

    private function calculateSMA($data, $period) {
        $sma = [];
        for ($i = $period - 1; $i < count($data); $i++) {
            $slice = array_slice($data, $i - $period + 1, $period);
            $sma[] = array_sum($slice) / $period;
        }
        return $sma;
    }

    private function calculateRSI($data, $period = 14) {
        $gains = [];
        $losses = [];

        for ($i = 1; $i < count($data); $i++) {
            $diff = $data[$i] - $data[$i-1];
            $gains[] = max(0, $diff);
            $losses[] = max(0, -$diff);
        }

        $rsi = array_fill(0, $period, 50); // initial padding

        $avgGain = array_sum(array_slice($gains, 0, $period)) / $period;
        $avgLoss = array_sum(array_slice($losses, 0, $period)) / $period;

        for ($i = $period; $i < count($gains); $i++) {
            $avgGain = ($avgGain * ($period - 1) + $gains[$i]) / $period;
            $avgLoss = ($avgLoss * ($period - 1) + $losses[$i]) / $period;

            if ($avgLoss == 0) {
                $rsi[] = 100;
            } else {
                $rs = $avgGain / $avgLoss;
                $rsi[] = 100 - (100 / (1 + $rs));
            }
        }

        return $rsi;
    }
}
