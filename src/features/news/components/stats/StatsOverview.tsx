import React from "react";
import { Row, Col } from "antd";
import { StatisticsCard } from "@/features/news/components/stats/StatisticsCard";
import { NewsCounters } from "../../types/newsTypes";

interface StatsOverviewProps {
  countersData: NewsCounters | undefined;
  isCountersLoading: boolean;
}

export default function StatsOverview({
  countersData,
  isCountersLoading,
}: StatsOverviewProps) {
  return (
    <>
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="Total"
            value={countersData?.total || 0}
            loading={isCountersLoading}
            color="#1890ff"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="Publicadas"
            value={countersData?.published || 0}
            loading={isCountersLoading}
            color="#52c41a"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="Preview"
            value={countersData?.preview || 0}
            loading={isCountersLoading}
            color="#faad14"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <StatisticsCard
            title="Borradores"
            value={countersData?.draft || 0}
            loading={isCountersLoading}
            color="#8c8c8c"
          />
        </Col>
      </Row>
    </>
  );
}
