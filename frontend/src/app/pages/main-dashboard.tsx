import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
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
} from 'recharts';
import {
  MessageSquare,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Bot,
} from 'lucide-react';
import { Link, Navigate } from 'react-router';
import { useAuth } from '../../features/auth/AuthProvider';
import { useConversationsList } from '../../features/conversations/useConversations';
import {
  avatarUrl,
  formatRelativeTime,
  formatStatusLabel,
} from '../../features/conversations/utils';

const weeklyData = [
  { day: 'Mon', conversations: 45, resolved: 38 },
  { day: 'Tue', conversations: 52, resolved: 45 },
  { day: 'Wed', conversations: 48, resolved: 41 },
  { day: 'Thu', conversations: 61, resolved: 53 },
  { day: 'Fri', conversations: 55, resolved: 48 },
  { day: 'Sat', conversations: 28, resolved: 25 },
  { day: 'Sun', conversations: 22, resolved: 20 },
];

const satisfactionData = [
  { month: 'Jan', score: 4.2 },
  { month: 'Feb', score: 4.3 },
  { month: 'Mar', score: 4.5 },
  { month: 'Apr', score: 4.4 },
  { month: 'May', score: 4.6 },
  { month: 'Jun', score: 4.7 },
];

const categoryData = [
  { name: 'Registration', value: 35, color: '#3b82f6' },
  { name: 'Technical', value: 28, color: '#14b8a6' },
  { name: 'Financial', value: 20, color: '#8b5cf6' },
  { name: 'Academic', value: 17, color: '#f59e0b' },
];

export default function MainDashboard() {
  const { profile } = useAuth();
  const { data: conversations = [] } = useConversationsList();

  if (profile?.role === 'student') {
    return <Navigate to="/dashboard/conversations" replace />;
  }

  const openCount = conversations.filter((c) => c.status === 'open').length;
  const pendingCount = conversations.filter((c) => c.status === 'pending').length;
  const closedCount = conversations.filter((c) => c.status === 'closed').length;
  const recentConversations = conversations.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-500">Monitor support activities and performance metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Conversations</p>
                <p className="text-3xl font-semibold text-gray-900">{openCount}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">12% vs last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Pending Requests</p>
                <p className="text-3xl font-semibold text-gray-900">{pendingCount}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="w-4 h-4 text-red-600" />
                  <span className="text-sm text-red-600">5% vs last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Resolved Today</p>
                <p className="text-3xl font-semibold text-gray-900">{closedCount}</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowUpRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">18% vs last week</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Avg Response Time</p>
                <p className="text-3xl font-semibold text-gray-900">2.4m</p>
                <div className="flex items-center gap-1 mt-2">
                  <ArrowDownRight className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-600">8% faster</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-teal-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* Weekly Conversation Volume */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Weekly Conversation Volume</CardTitle>
            <CardDescription>Total and resolved conversations this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
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
                <Bar dataKey="conversations" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Breakdown */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Category Breakdown</CardTitle>
            <CardDescription>Support requests by category</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-3 mt-4">
              {categoryData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        {/* User Satisfaction Score */}
        <Card className="lg:col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>User Satisfaction Score</CardTitle>
            <CardDescription>Average satisfaction rating over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={satisfactionData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" stroke="#9ca3af" />
                <YAxis domain={[0, 5]} stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  fill="url(#colorScore)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="lg:col-span-3 border-0 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Conversations</CardTitle>
                <CardDescription>Latest support requests</CardDescription>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dashboard/conversations">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.map((conversation) => {
                const title =
                  profile?.role === 'student'
                    ? conversation.subject
                    : conversation.student.full_name;
                const avatarSeed =
                  profile?.role === 'student'
                    ? conversation.subject
                    : conversation.student.full_name;
                const statusLabel = formatStatusLabel(conversation.status);

                return (
                  <Link
                    key={conversation.id}
                    to="/dashboard/conversations"
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={avatarUrl(avatarSeed)} />
                      <AvatarFallback>{title[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-medium text-sm text-gray-900 truncate">{title}</p>
                        <Badge
                          variant="outline"
                          className={
                            statusLabel === 'Open'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : statusLabel === 'Pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-green-50 text-green-700 border-green-200'
                          }
                        >
                          {statusLabel}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 truncate mb-1">
                        {conversation.subject}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatRelativeTime(conversation.last_message_at)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
