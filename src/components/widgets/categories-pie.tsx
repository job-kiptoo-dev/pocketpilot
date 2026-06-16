"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChartIcon } from "lucide-react";
import { useHealth } from "@/lib/store/selectors";
import { categoryColor, CATEGORY_META } from "@/lib/categories";
import { formatKes } from "@/lib/money";

export function CategoriesPie() {
  const health = useHealth();
  const data = health.byCategory.map((c) => ({
    name: c.category,
    value: c.amount,
    share: c.share,
    color: categoryColor(c.category),
  }));

  return (
    <Card className="h-full">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <PieChartIcon className="size-4" /> Spending by Category
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">No spending yet this month.</p>
        ) : (
          <div className="flex flex-col items-center gap-4 sm:flex-row">
            <div className="h-44 w-44 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} stroke="none">
                    {data.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatKes(Number(value))}
                    contentStyle={{
                      background: "var(--popover)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      color: "var(--popover-foreground)",
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="grid w-full grid-cols-1 gap-1.5 text-sm">
              {data.slice(0, 6).map((d) => (
                <li key={d.name} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 truncate">
                    <span className="inline-block size-2.5 rounded-full" style={{ background: d.color }} />
                    <span className="truncate">
                      {CATEGORY_META[d.name].emoji} {d.name}
                    </span>
                  </span>
                  <span className="shrink-0 font-medium tabular-nums text-muted-foreground">
                    {Math.round(d.share * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
