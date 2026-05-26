"use client";

import { useEffect, useState } from "react";
import { WeightCheckInModal } from "@/components/WeightCheckInModal";

interface DashboardCheckInProps {
  currentWeight: number;
  lastWeightCheckIn: string | null; // ISO string from server
  createdAt: string; // ISO string from server
}

export function DashboardCheckIn({
  currentWeight,
  lastWeightCheckIn,
  createdAt,
}: DashboardCheckInProps) {
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const now = new Date();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

    // Check if user dismissed it recently (within last 24h)
    const dismissedAt = localStorage.getItem("weightCheckInDismissed");
    if (dismissedAt) {
      const dismissedDate = new Date(dismissedAt);
      const hoursSinceDismiss = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
      if (hoursSinceDismiss < 24) {
        return; // Don't show again within 24h of dismissal
      }
    }

    // Determine if we should show the modal
    if (lastWeightCheckIn) {
      const lastCheckIn = new Date(lastWeightCheckIn);
      const msSinceCheckIn = now.getTime() - lastCheckIn.getTime();
      if (msSinceCheckIn >= SEVEN_DAYS_MS) {
        setShowModal(true);
      }
    } else {
      // Never done a check-in — show after 7 days since registration
      const registeredAt = new Date(createdAt);
      const msSinceRegistration = now.getTime() - registeredAt.getTime();
      if (msSinceRegistration >= SEVEN_DAYS_MS) {
        setShowModal(true);
      }
    }
  }, [lastWeightCheckIn, createdAt]);

  if (!showModal) return null;

  return (
    <WeightCheckInModal
      currentWeight={currentWeight}
      lastCheckInWeight={currentWeight}
    />
  );
}
