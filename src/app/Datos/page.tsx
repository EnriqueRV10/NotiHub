"use client";
import React from "react";
import { useNewsCounters } from "@/features/news/hooks";
import { StatsOverview } from "@/features/news/components";

export default function Datos() {
  // Hook para obtener contadores
  const {
    data: countersData,
    error: errorCounters,
    isLoading: isCountersLoading,
    refetch: countersRefetch,
  } = useNewsCounters({});

  return (
    <div>
      {/* Estadísticas */}
      <StatsOverview
        countersData={countersData}
        isCountersLoading={isCountersLoading}
      />
    </div>
  );
}
