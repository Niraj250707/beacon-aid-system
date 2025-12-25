import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ProgramAnalytics, MerchantCategory } from '@/types';

interface AnalyticsChartsProps {
  analytics: ProgramAnalytics;
}

const CATEGORY_COLORS: Record<MerchantCategory, string> = {
  Food: '#22c55e',
  Health: '#3b82f6',
  Shelter: '#f59e0b',
  Fuel: '#ef4444',
  Other: '#8b5cf6',
};

const AnalyticsCharts: React.FC<AnalyticsChartsProps> = ({ analytics }) => {
  // Transform spending by category for pie chart
  const categoryData = Object.entries(analytics.spendingByCategory).map(([name, value]) => ({
    name,
    value,
    color: CATEGORY_COLORS[name as MerchantCategory],
  }));

  // Transform spending by region for bar chart
  const regionData = Object.entries(analytics.spendingByRegion).map(([name, value]) => ({
    name,
    amount: value / 100000, // Convert to lakhs
  }));

  // Daily transactions data
  const dailyData = analytics.dailyTransactions.map(d => ({
    date: new Date(d.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
    amount: d.amount / 100000, // Convert to lakhs
    count: d.count,
  }));

  const formatLakhs = (value: number) => `₹${value.toFixed(1)}L`;

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Spending by Category - Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending by Category</CardTitle>
          <CardDescription>Distribution of funds across merchant categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`₹${(value / 100000).toFixed(2)}L`, 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(222 47% 10%)',
                    border: '1px solid hsl(217 33% 17%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 96%)',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {categoryData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: item.color }} 
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Spending by Region - Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Spending by Region</CardTitle>
          <CardDescription>Fund distribution across districts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis 
                  type="number" 
                  tickFormatter={formatLakhs}
                  stroke="hsl(215 20% 55%)"
                  fontSize={12}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  width={80}
                  stroke="hsl(215 20% 55%)"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number) => [formatLakhs(value), 'Amount']}
                  contentStyle={{
                    backgroundColor: 'hsl(222 47% 10%)',
                    border: '1px solid hsl(217 33% 17%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 96%)',
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill="hsl(174 72% 46%)" 
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Transactions - Area Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Daily Transaction Volume</CardTitle>
          <CardDescription>Transaction amounts and counts over the past week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174 72% 46%)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(174 72% 46%)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(215 20% 55%)"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  tickFormatter={formatLakhs}
                  stroke="hsl(215 20% 55%)"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  stroke="hsl(215 20% 55%)"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(222 47% 10%)',
                    border: '1px solid hsl(217 33% 17%)',
                    borderRadius: '8px',
                    color: 'hsl(210 40% 96%)',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'amount' ? formatLakhs(value) : value,
                    name === 'amount' ? 'Amount' : 'Transactions'
                  ]}
                />
                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="amount"
                  stroke="hsl(174 72% 46%)"
                  strokeWidth={2}
                  fill="url(#colorAmount)"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="count"
                  stroke="hsl(199 89% 48%)"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(199 89% 48%)', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-sm text-muted-foreground">Amount (₹ Lakhs)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-info" />
              <span className="text-sm text-muted-foreground">Transaction Count</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsCharts;
