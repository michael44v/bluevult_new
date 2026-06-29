<?php

class RiskManager {
    public function canTrade($userId, $amount, $settings, $walletBalance) {
        if (!$settings) return false;

        // Check if amount exceeds balance
        if ($amount > $walletBalance) return false;

        // Check max daily loss (not implemented fully here but placeholder)
        // Check risk percentage from settings
        $maxRisk = ($settings['risk_percentage'] / 100) * $walletBalance;
        if ($amount > $maxRisk) return false;

        return true;
    }
}
