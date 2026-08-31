"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";

const COLORS = ['#3b82f6', '#8b5cf6', '#f97316', '#10b981', '#f43f5e', '#64748b'];

export default function AnalyticsDashboard({ chartData }: { chartData: { name: string, value: number }[] }) {
  
  // Basic 80/20 insight generation
  const sortedData = [...chartData].sort((a, b) => b.value - a.value);
  const totalTime = sortedData.reduce((acc, curr) => acc + curr.value, 0);
  
  let highImpactHTML = <p className="text-sm text-muted-foreground">Not enough data for 80/20 analysis.</p>;
  
  if (sortedData.length > 0 && totalTime > 0) {
    const topCategory = sortedData[0];
    const percentage = Math.round((topCategory.value / totalTime) * 100);
    
    if (percentage >= 50) {
      highImpactHTML = (
        <p className="text-sm">
          You are spending <span className="font-bold text-primary">{percentage}%</span> of your time on <strong>{topCategory.name}</strong>. 
          If this is a high-leverage activity, you are successfully applying the 80/20 rule!
        </p>
      );
    } else {
      highImpactHTML = (
        <p className="text-sm">
          Your time is highly fragmented across {sortedData.length} categories. 
          Consider consolidating your focus onto your top priority (currently {topCategory.name}).
        </p>
      )
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* Chart Section */}
      <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col h-[400px]">
        <h3 className="font-semibold mb-6">Time Distribution</h3>
        {chartData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            No time logged yet.
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} mins`, 'Duration']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* 80/20 Analysis Section */}
      <div className="rounded-xl border bg-card p-6 shadow-sm">
        <h3 className="font-semibold mb-4 text-xl">80/20 Analysis</h3>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <h4 className="font-medium text-primary mb-2">High Impact Insight</h4>
          {highImpactHTML}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-sm text-muted-foreground">Category Breakdown (Minutes)</h4>
          {sortedData.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span>{item.name}</span>
              </div>
              <span className="font-semibold">{item.value}m</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
