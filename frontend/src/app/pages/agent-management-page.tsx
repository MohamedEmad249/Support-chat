import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { MessageSquare, Search, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { useConversationsList } from '../../features/conversations/useConversations';
import { avatarUrl } from '../../features/conversations/utils';
import { useSalesAgents } from '../../features/users/useSalesAgents';

const DEMO_AGENT_EMAILS: Record<string, string> = {
  'Sam Sales': 'sales1@demo.com',
  'Jordan Sales': 'sales2@demo.com',
};

function agentEmail(fullName: string): string {
  return DEMO_AGENT_EMAILS[fullName] ?? `${fullName.toLowerCase().replace(/\s+/g, '.')}@demo.com`;
}

export default function AgentManagementPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { data: agents = [], isLoading, error } = useSalesAgents();
  const { data: conversations = [] } = useConversationsList();

  const filteredAgents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return agents;
    return agents.filter(
      (a) =>
        a.full_name.toLowerCase().includes(q) ||
        agentEmail(a.full_name).toLowerCase().includes(q),
    );
  }, [agents, search]);

  const activeChatsByAgent = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of conversations) {
      if (c.assigned_to && c.status !== 'closed') {
        map.set(c.assigned_to, (map.get(c.assigned_to) ?? 0) + 1);
      }
    }
    return map;
  }, [conversations]);

  const onlineCount = filteredAgents.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
            Support Agents
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sales team from your database (sales1@demo.com, sales2@demo.com)
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/dashboard/conversations')}
        >
          View conversations
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
          Could not load agents. Ensure the API worker is running.
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Total Agents</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{agents.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Active team</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">{onlineCount}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <p className="text-sm text-gray-500 mb-1">Open assignments</p>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {conversations.filter((c) => c.assigned_to && c.status !== 'closed').length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="search"
              placeholder="Search agents..."
              className="pl-10 bg-gray-50 dark:bg-gray-900"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-gray-500">Loading agents...</p>
      ) : filteredAgents.length === 0 ? (
        <p className="text-gray-500">No sales agents found. Run sql/002_seed.sql in Supabase.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredAgents.map((agent) => {
            const email = agentEmail(agent.full_name);
            const activeChats = activeChatsByAgent.get(agent.id) ?? 0;
            return (
              <Card key={agent.id} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Avatar className="w-14 h-14">
                      <AvatarImage src={avatarUrl(agent.full_name)} />
                      <AvatarFallback>
                        {agent.full_name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">{agent.full_name}</CardTitle>
                      <CardDescription>{email}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Online
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Sales
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MessageSquare className="w-4 h-4" />
                    <span>{activeChats} active conversation{activeChats === 1 ? '' : 's'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Star className="w-4 h-4 text-amber-400" />
                    <span>Team member since {new Date(agent.created_at).toLocaleDateString()}</span>
                  </div>
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      navigate(
                        `/dashboard/conversations?agentId=${encodeURIComponent(agent.id)}&agentName=${encodeURIComponent(agent.full_name)}`,
                      );
                    }}
                  >
                    Open inbox
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
