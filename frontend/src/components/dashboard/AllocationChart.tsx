import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

const data = [
  { name: "Stocks", value: 65, color: "hsl(189, 100%, 44%)" },
  { name: "Crypto", value: 25, color: "hsl(270, 91%, 65%)" },
  { name: "Cash", value: 10, color: "hsl(215, 20%, 55%)" },
];

export function AllocationChart() {
  return (
    <div className="terminal-card p-4">
      <h3 className="font-semibold text-sm text-foreground mb-4">Asset Allocation</h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(222, 47%, 8%)",
                border: "1px solid hsl(222, 30%, 18%)",
                borderRadius: "4px",
                fontSize: "12px",
              }}
              formatter={(value: number) => [`${value}%`, ""]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-sm"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-muted-foreground">{item.name}</span>
            <span className="text-xs font-mono text-foreground">{item.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
