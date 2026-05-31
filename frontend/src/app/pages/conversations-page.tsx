import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
import {
  Search,
  Send,
  ArrowDown,
  MoreVertical,
  Info,
  Filter,
  Sparkles,
  UserPlus,
  Plus,
  X,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { useAuth } from '../../features/auth/AuthProvider';
import type { ConversationStatus } from '../../features/conversations/types';
import {
  avatarUrl,
  formatMessageTime,
  formatRelativeTime,
  formatStatusLabel,
} from '../../features/conversations/utils';
import {
  useAssignConversation,
  useConversation,
  useConversationsList,
  useCreateConversation,
  useSendMessage,
  useUpdateConversationStatus,
} from '../../features/conversations/useConversations';
import { useSalesAgents } from '../../features/users/useSalesAgents';
import { toast } from 'sonner';

const aiSuggestions = [
  'I understand your concern. Let me check your student record.',
  'The issue has been escalated to the appropriate department.',
  'Your request will be processed within 24-48 hours.',
];

function statusBadgeClass(status: string) {
  if (status === 'Open') return 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
  if (status === 'Pending') return 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
  return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
}

export default function ConversationsPage() {
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const agentId = searchParams.get('agentId') ?? undefined;
  const agentName = searchParams.get('agentName') ?? undefined;

  const isStudent = profile?.role === 'student';
  const isStaff = profile?.role === 'sales' || profile?.role === 'manager';

  const [statusFilter, setStatusFilter] = useState<ConversationStatus | undefined>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [showSidebar, setShowSidebar] = useState(isStaff);

  const [newOpen, setNewOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');

  const { data: conversations = [], isLoading, error } = useConversationsList({
    status: statusFilter,
    agentId: profile?.role === 'manager' ? agentId : undefined,
    q: searchQuery.trim() || undefined,
  });

  const { data: salesAgents = [] } = useSalesAgents(isStaff);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const { data: thread, isLoading: threadLoading } = useConversation(selectedId);
  const sendMessage = useSendMessage(selectedId);
  const assignConversation = useAssignConversation(selectedId);
  const updateStatus = useUpdateConversationStatus(selectedId);
  const createConversation = useCreateConversation();

  useEffect(() => {
    if (!selectedId && conversations.length > 0) {
      setSelectedId(conversations[0].id);
    }
  }, [conversations, selectedId]);

  const selectedSummary = useMemo(
    () => conversations.find((c) => c.id === selectedId),
    [conversations, selectedId],
  );



  const displayTitle = isStudent
    ? selectedSummary?.subject ?? 'Conversation'
    : selectedSummary?.student.full_name ?? 'Select a conversation';

  const handleSendMessage = async () => {
    const text = messageInput.trim();
    if (!text || !selectedId) return;
    try {
      await sendMessage.mutateAsync(text);
      setMessageInput('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    }
  };

  const handleAssignToMe = async () => {
    if (!profile || !selectedId) return;
    try {
      await assignConversation.mutateAsync(profile.id);
      toast.success('Conversation assigned to you');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not assign conversation');
    }
  };

  const handleAssignConversation = async (agentId: string | null) => {
    if (!selectedId) return;
    try {
      await assignConversation.mutateAsync(agentId);
      toast.success(agentId ? 'Conversation assigned successfully' : 'Conversation unassigned');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not assign conversation');
    }
  };

  const handleStatusChange = async (status: ConversationStatus) => {
    if (!selectedId || !profile || isStudent) return;
    try {
      if (
        profile.role === 'sales' &&
        selectedSummary?.assigned_to &&
        selectedSummary.assigned_to !== profile.id
      ) {
        toast.error('This conversation is assigned to another agent');
        return;
      }
      await updateStatus.mutateAsync(status);
      toast.success(`Status set to ${formatStatusLabel(status)}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not update status');
    }
  };

  const handleCreateConversation = async () => {
    const subject = newSubject.trim();
    const message = newMessage.trim();
    if (!subject || !message) {
      toast.error('Subject and message are required');
      return;
    }
    try {
      const created = await createConversation.mutateAsync({ subject, message });
      setNewOpen(false);
      setNewSubject('');
      setNewMessage('');
      setSelectedId(created.id);
      toast.success('Conversation started');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start conversation');
    }
  };

  const clearAgentFilter = () => {
    searchParams.delete('agentId');
    searchParams.delete('agentName');
    setSearchParams(searchParams);
  };

  const canChangeStatus =
    profile?.role === 'manager' ||
    (profile?.role === 'sales' &&
      selectedSummary &&
      (!selectedSummary.assigned_to || selectedSummary.assigned_to === profile.id));

  const chatColSpan = isStudent
    ? 'lg:col-span-8'
    : showSidebar
      ? 'lg:col-span-5'
      : 'lg:col-span-8';

  return (
    <div className="min-h-screen space-y-6 flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold text-foreground mb-2">Conversations</h1>
          <p className="text-muted-foreground">
            {isStudent
              ? 'Your support requests'
              : agentName
                ? `Assigned to ${agentName}`
                : 'Manage and respond to student support requests'}
          </p>
        </div>
        {isStudent && (
          <Dialog open={newOpen} onOpenChange={setNewOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-2" />
                Start a conversation
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card text-card-foreground border-border">
              <DialogHeader>
                <DialogTitle>New support request</DialogTitle>
                <DialogDescription>Describe your issue and we will help you.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="e.g. Course registration issue"
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="firstMessage">Message</Label>
                  <Textarea
                    id="firstMessage"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Describe your problem..."
                    className="bg-background min-h-[120px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setNewOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleCreateConversation()}
                  disabled={createConversation.isPending}
                  className="bg-primary text-primary-foreground"
                >
                  {createConversation.isPending ? 'Sending...' : 'Submit'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {agentId && agentName && profile?.role === 'manager' && (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2 text-sm">
          <span className="text-foreground">Showing conversations assigned to <strong>{agentName}</strong></span>
          <Button variant="ghost" size="sm" type="button" onClick={clearAgentFilter}>
            <X className="w-4 h-4 mr-1" />
            Show all
          </Button>
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
          Failed to load conversations. Is the API worker running?
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-4 border border-border bg-card shadow-sm min-w-0">
          <CardContent className="p-0">
            <div className="p-4 border-b border-border">
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search..."
                    className="pl-10 bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="sm" type="button">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              {!isStudent && (
                <div className="flex gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={`cursor-pointer ${!statusFilter ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
                    onClick={() => setStatusFilter(undefined)}
                  >
                    All ({conversations.length})
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`cursor-pointer ${statusFilter === 'open' ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
                    onClick={() => setStatusFilter('open')}
                  >
                    Open
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`cursor-pointer ${statusFilter === 'pending' ? 'bg-amber-500/10 border-amber-500/30' : ''}`}
                    onClick={() => setStatusFilter('pending')}
                  >
                    Pending
                  </Badge>
                </div>
              )}
            </div>

            <div className="h-[520px] overflow-y-auto">
              {isLoading ? (
                <p className="p-4 text-sm text-muted-foreground">Loading...</p>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground space-y-3">
                  <p>No conversations yet.</p>
                  {isStudent && (
                    <Button
                      size="sm"
                      className="bg-primary text-primary-foreground"
                      onClick={() => setNewOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Start a conversation
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations.map((conversation) => {
                    const title = isStudent
                      ? conversation.subject
                      : conversation.student.full_name;
                    const seed = isStudent ? conversation.subject : conversation.student.full_name;
                    const statusLabel = formatStatusLabel(conversation.status);

                    return (
                      <button
                        key={conversation.id}
                        type="button"
                        onClick={() => setSelectedId(conversation.id)}
                        className={`w-full text-left p-4 transition-colors ${
                          selectedId === conversation.id
                            ? 'bg-primary/10 border-l-4 border-l-primary'
                            : 'hover:bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <Avatar className="w-10 h-10 shrink-0">
                            <AvatarImage src={avatarUrl(seed)} />
                            <AvatarFallback>{title[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground truncate">{title}</p>
                            <p className="text-sm text-muted-foreground truncate">{conversation.subject}</p>
                            <div className="flex items-center justify-between mt-2 gap-2">
                              <Badge variant="outline" className={statusBadgeClass(statusLabel)}>
                                {statusLabel}
                              </Badge>
                              <span className="text-xs text-muted-foreground shrink-0">
                                {formatRelativeTime(conversation.last_message_at)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={`${chatColSpan} border border-border bg-card shadow-sm min-w-0 flex flex-col`}>
          {!selectedId ? (
            <CardContent className="flex-1 flex items-center justify-center text-muted-foreground p-8">
              {isStudent ? 'Start a conversation to get help' : 'Select a conversation'}
            </CardContent>
          ) : (
            <>
              <div className="shrink-0 p-4 border-b border-border flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={avatarUrl(displayTitle)} />
                    <AvatarFallback>{displayTitle[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{displayTitle}</h3>
                    <p className="text-sm text-muted-foreground truncate">{selectedSummary?.subject}</p>
                  </div>
                </div>
                {isStaff && (
                  <div className="flex items-center gap-1 shrink-0">
                    {profile?.role === 'sales' && !selectedSummary?.assigned_to && (
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={() => void handleAssignToMe()}
                        className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span className="hidden sm:inline">Assign to me</span>
                      </Button>
                    )}
                    {profile?.role === 'manager' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            type="button"
                            className="flex items-center gap-1.5 border-primary/30 text-primary hover:bg-primary/5"
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>{selectedSummary?.assigned_to ? 'Reassign' : 'Assign'}</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover text-popover-foreground max-h-[300px] overflow-y-auto w-56">
                          {selectedSummary?.assigned_to && (
                            <DropdownMenuItem
                              onSelect={(e) => {
                                e.preventDefault();
                                void handleAssignConversation(null);
                              }}
                              className="text-destructive focus:text-destructive font-medium"
                            >
                              Unassign
                            </DropdownMenuItem>
                          )}
                          {salesAgents.length === 0 ? (
                            <DropdownMenuItem disabled>No sales agents available</DropdownMenuItem>
                          ) : (
                            salesAgents.map((agent) => (
                              <DropdownMenuItem
                                key={agent.id}
                                onSelect={(e) => {
                                  e.preventDefault();
                                  void handleAssignConversation(agent.id);
                                }}
                                className={selectedSummary?.assigned_to === agent.id ? 'bg-primary/10 font-semibold' : ''}
                              >
                                {agent.full_name}
                              </DropdownMenuItem>
                            ))
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" type="button">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover text-popover-foreground">
                        {canChangeStatus &&
                          (['open', 'pending', 'closed'] as ConversationStatus[]).map((s) => (
                            <DropdownMenuItem
                              key={s}
                              onSelect={(e) => {
                                e.preventDefault();
                                void handleStatusChange(s);
                              }}
                            >
                              Mark {formatStatusLabel(s).toLowerCase()}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    <Button
                      variant="ghost"
                      size="sm"
                      type="button"
                      onClick={() => setShowSidebar((v) => !v)}
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>


              <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto p-4 bg-muted/20">
                {threadLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                ) : (
                  <div className="space-y-3">
                    {(thread?.conversation_messages ?? []).map((message) => {
                      const isTeam = message.sender_type === 'team';
                      const isMine = isStudent ? !isTeam : isTeam;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 break-words [overflow-wrap:anywhere] ${
                              isMine
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-card border border-border text-foreground'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{message.body}</p>
                            <p
                              className={`text-xs mt-1 ${isMine ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                            >
                              {formatMessageTime(message.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="shrink-0 p-4 border-t border-border bg-card">
                <div className="flex items-end gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        void handleSendMessage();
                      }
                    }}
                    placeholder="Type your message..."
                    className="flex-1 bg-background"
                    disabled={thread?.status === 'closed'}
                  />
                  <Button
                    type="button"
                    onClick={() => void handleSendMessage()}
                    className="bg-primary text-primary-foreground shrink-0"
                    disabled={sendMessage.isPending || thread?.status === 'closed'}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </Card>

        {isStaff && showSidebar && selectedSummary && (
          <Card className="lg:col-span-3 border border-border bg-card shadow-sm min-w-0">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-medium text-foreground">Details</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Subject</p>
                  <p className="text-foreground">{selectedSummary.subject}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Student</p>
                  <p className="text-foreground">{selectedSummary.student.full_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Status</p>
                  <Badge variant="outline" className={statusBadgeClass(formatStatusLabel(selectedSummary.status))}>
                    {formatStatusLabel(selectedSummary.status)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Assigned agent</p>
                  {profile?.role === 'manager' ? (
                    <select
                      value={selectedSummary.assigned_to ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        void handleAssignConversation(val || null);
                      }}
                      className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="">Unassigned</option>
                      {salesAgents.map((agent) => (
                        <option key={agent.id} value={agent.id}>
                          {agent.full_name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-foreground">{selectedSummary.assignee?.full_name ?? 'Unassigned'}</p>
                      {profile?.role === 'sales' && !selectedSummary.assigned_to && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => void handleAssignToMe()}
                          className="w-full border-primary/30 text-primary hover:bg-primary/5 flex items-center justify-center gap-1.5"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Assign to me</span>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              {canChangeStatus && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <p className="text-muted-foreground text-sm">Change status</p>
                  <div className="flex flex-wrap gap-2">
                    {(['open', 'pending', 'closed'] as ConversationStatus[]).map((s) => (
                      <Button
                        key={s}
                        type="button"
                        size="sm"
                        variant={selectedSummary.status === s ? 'default' : 'outline'}
                        className={selectedSummary.status === s ? 'bg-primary text-primary-foreground' : ''}
                        onClick={() => void handleStatusChange(s)}
                      >
                        {formatStatusLabel(s)}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <p className="text-sm font-medium text-foreground">Suggested replies</p>
                </div>
                {aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setMessageInput(suggestion)}
                    className="w-full text-left p-2 text-sm rounded-lg bg-muted hover:bg-muted/80 text-foreground"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
