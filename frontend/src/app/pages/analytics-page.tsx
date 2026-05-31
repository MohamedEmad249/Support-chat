import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts';
import { Download, TrendingUp, TrendingDown, Minus } from 'lucide-react';

const conversationTrends = [
  { month: 'Jan', total: 234, resolved: 198, pending: 36 },
  { month: 'Feb', total: 287, resolved: 251, pending: 36 },
  { month: 'Mar', total: 312, resolved: 278, pending: 34 },
  { month: 'Apr', total: 298, resolved: 265, pending: 33 },
  { month: 'May', total: 356, resolved: 312, pending: 44 },
  { month: 'Jun', total: 389, resolved: 342, pending: 47 },
];

const responseTimeData = [
  { day: 'Mon', avgTime: 2.3, target: 3.0 },
  { day: 'Tue', avgTime: 2.1, target: 3.0 },
  { day: 'Wed', avgTime: 2.5, target: 3.0 },
  { day: 'Thu', avgTime: 2.8, target: 3.0 },
  { day: 'Fri', avgTime: 2.4, target: 3.0 },
  { day: 'Sat', avgTime: 1.9, target: 3.0 },
  { day: 'Sun', avgTime: 1.7, target: 3.0 },
];

const categoryBreakdown = [
  { category: 'Registration', count: 145, color: '#3b82f6' },
  { category: 'Technical', count: 98, color: '#14b8a6' },
  { category: 'Financial Aid', count: 76, color: '#8b5cf6' },
  { category: 'Academic', count: 54, color: '#f59e0b' },
  { category: 'Housing', count: 43, color: '#ec4899' },
  { category: 'Other', count: 32, color: '#6b7280' },
];

const hourlyVolume = [
  { hour: '12 AM', volume: 5 },
  { hour: '2 AM', volume: 2 },
  { hour: '4 AM', volume: 1 },
  { hour: '6 AM', volume: 8 },
  { hour: '8 AM', volume: 24 },
  { hour: '10 AM', volume: 42 },
  { hour: '12 PM', volume: 38 },
  { hour: '2 PM', volume: 45 },
  { hour: '4 PM', volume: 35 },
  { hour: '6 PM', volume: 28 },
  { hour: '8 PM', volume: 18 },
  { hour: '10 PM', volume: 12 },
];

const agentPerformance = [
  { metric: 'Response Time', score: 85 },
  { metric: 'Resolution Rate', score: 92 },
  { metric: 'Customer Satisfaction', score: 88 },
  { metric: 'Availability', score: 78 },
  { metric: 'Quality Score', score: 90 },
];

const satisfactionTrend = [
  { week: 'Week 1', score: 4.3 },
  { week: 'Week 2', score: 4.5 },
  { week: 'Week 3', score: 4.4 },
  { week: 'Week 4', score: 4.6 },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-500">Comprehensive insights into support performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 days</SelectItem>
              <SelectItem value="30days">Last 30 days</SelectItem>
              <SelectItem value="90days">Last 90 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total Conversations</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-2">1,876</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                +12.5%
              </Badge>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Resolution Rate</p>
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-2">87.8%</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                +3.2%
              </Badge>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Avg Response Time</p>
              <TrendingDown className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-2">2.3 min</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                -8.1%
              </Badge>
              <span className="text-sm text-gray-500">improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Satisfaction Score</p>
              <Minus className="w-4 h-4 text-gray-400" />
            </div>
            <p className="text-3xl font-semibold text-gray-900 mb-2">4.6/5.0</p>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Stable
              </Badge>
              <span className="text-sm text-gray-500">vs last period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Conversation Trends */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Conversation Trends</CardTitle>
            <CardDescription>Monthly conversation volume and resolution rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <AreaChart data={conversationTrends}>
                <defs>
                  <linearGradient id="totalGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="resolvedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#totalGradient)"
                  name="Total Conversations"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="url(#resolvedGradient)"
                  name="Resolved"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Support requests by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {categoryBreakdown.map((item) => (
                <div key={item.category} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">{item.category}</p>
                    <p className="text-xs text-gray-400">{item.count} requests</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Response Time Performance */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Response Time Performance</CardTitle>
            <CardDescription>Average response time vs target (in minutes)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={responseTimeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="avgTime"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Avg Response Time"
                />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                  name="Target"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Performance Radar */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Team Performance</CardTitle>
            <CardDescription>Overall performance metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={agentPerformance}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Hourly Volume Heatmap */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Hourly Request Volume</CardTitle>
            <CardDescription>Support requests distribution throughout the day</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyVolume}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="hour" stroke="#9ca3af" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="volume" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Satisfaction Trend */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Satisfaction</CardTitle>
            <CardDescription>Customer satisfaction trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={satisfactionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#9ca3af" />
                <YAxis domain={[0, 5]} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ fill: '#14b8a6', r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <p className="text-sm font-medium text-teal-900 mb-1">Current Score</p>
              <p className="text-2xl font-semibold text-teal-900">4.6 / 5.0</p>
              <p className="text-xs text-teal-700 mt-1">92% positive feedback rate</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
