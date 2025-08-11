import React from "react";
import { Card, Statistic } from "antd";

export interface StatisticsCardProps {
  title: string;
  value: number;
  color: string;
  loading: boolean;
}

export const StatisticsCard = ({ title, value, color, loading }: StatisticsCardProps) => (
  <Card bordered={false} size="small">
    <div className="flex flex-row justify-around items-center sm:flex-col">
      <p>{title}</p>
      <Statistic value={value} valueStyle={{ color }} loading={loading} />
    </div>
  </Card>
);