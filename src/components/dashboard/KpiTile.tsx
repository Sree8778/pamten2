
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface KpiTileProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
}

const KpiTile: React.FC<KpiTileProps> = ({
  title,
  value,
  subtitle,
  icon
}) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon && <div className="text-gray-500">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
};

export default KpiTile;
