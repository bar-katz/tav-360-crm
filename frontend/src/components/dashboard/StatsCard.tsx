import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp } from "lucide-react";
import { LucideIcon } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  change?: string;
  isLoading?: boolean;
  index?: number;
}

export default function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  change,
  isLoading = false,
  index = 0
}: StatsCardProps) {
  if (isLoading) {
    return (
      <Card className="relative overflow-hidden">
        <CardHeader className="p-6">
          <Skeleton className="h-4 w-24 mb-2" />
          <Skeleton className="h-8 w-16" />
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-0 shadow-md">
        <div className={`absolute top-0 left-0 w-1 h-full ${color}`} />
        <CardHeader className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-slate-600 mb-2">{title}</p>
              <CardTitle className="text-3xl font-bold text-slate-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </CardTitle>
            </div>
            <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
              <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
          </div>
          {change && (
            <div className="flex items-center mt-4 text-sm">
              <TrendingUp className="w-4 h-4 ml-1 text-green-500" />
              <span className="text-green-600 font-medium">{change}</span>
            </div>
          )}
        </CardHeader>
      </Card>
    </motion.div>
  );
}

