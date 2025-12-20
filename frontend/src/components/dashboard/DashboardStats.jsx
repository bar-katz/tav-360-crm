import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";

export default function DashboardStats({ stats, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="relative overflow-hidden">
            <CardHeader className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
            <div className={`absolute top-0 left-0 w-1 h-full ${stat.color}`} />
            <CardHeader className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">{stat.title}</p>
                  <CardTitle className="text-3xl font-bold text-slate-900">
                    {stat.value.toLocaleString()}
                  </CardTitle>
                </div>
                <div className={`p-3 rounded-xl ${stat.color} bg-opacity-10`}>
                  <stat.icon className={`w-6 h-6 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
              {stat.change && (
                <div className="flex items-center mt-4 text-sm">
                  <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
                  <span className="text-green-600 font-medium">{stat.change}</span>
                </div>
              )}
            </CardHeader>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}