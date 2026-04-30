'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Inbox, 
  Mail, 
  Star, 
  Archive, 
  Trash2,
  Search,
  Filter,
  Clock,
  User,
  Paperclip
} from 'lucide-react';

interface Message {
  id: string;
  from: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  hasAttachment: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  type: 'EMAIL' | 'NOTIFICATION' | 'TASK_UPDATE' | 'SYSTEM';
}

export default function InboxPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  useEffect(() => {
    // Mock data - replace with actual API call
    setTimeout(() => {
      setMessages([
        {
          id: '1',
          from: 'John Doe',
          subject: 'Project Update: Mobile App Development',
          preview: 'Hi team, I wanted to share the latest progress on our mobile app project. We have completed the authentication module and are now working on...',
          timestamp: '2024-12-18T10:30:00Z',
          isRead: false,
          isStarred: true,
          hasAttachment: true,
          priority: 'HIGH',
          type: 'EMAIL'
        },
        {
          id: '2',
          from: 'System',
          subject: 'Task Assigned: Database Schema Review',
          preview: 'A new task has been assigned to you: Database Schema Review. Please review the proposed changes to the user authentication schema...',
          timestamp: '2024-12-18T09:15:00Z',
          isRead: false,
          isStarred: false,
          hasAttachment: false,
          priority: 'MEDIUM',
          type: 'TASK_UPDATE'
        },
        {
          id: '3',
          from: 'Jane Smith',
          subject: 'Meeting Reminder: Sprint Planning',
          preview: 'This is a reminder for our sprint planning meeting scheduled for tomorrow at 10:00 AM. Please come prepared with your task estimates...',
          timestamp: '2024-12-17T16:45:00Z',
          isRead: true,
          isStarred: false,
          hasAttachment: false,
          priority: 'MEDIUM',
          type: 'NOTIFICATION'
        },
        {
          id: '4',
          from: 'Mike Johnson',
          subject: 'Code Review Request',
          preview: 'Could you please review my pull request for the user authentication feature? I have implemented the JWT token validation and...',
          timestamp: '2024-12-17T14:20:00Z',
          isRead: true,
          isStarred: false,
          hasAttachment: true,
          priority: 'LOW',
          type: 'EMAIL'
        },
        {
          id: '5',
          from: 'System',
          subject: 'Weekly Report: Team Performance',
          preview: 'Your weekly team performance report is ready. This week your team completed 23 tasks with an average completion time of 2.5 days...',
          timestamp: '2024-12-16T08:00:00Z',
          isRead: true,
          isStarred: true,
          hasAttachment: true,
          priority: 'LOW',
          type: 'SYSTEM'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const getPriorityColor = (priority: Message['priority']) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800';
      case 'LOW':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: Message['type']) => {
    switch (type) {
      case 'EMAIL':
        return <Mail className="w-4 h-4" />;
      case 'NOTIFICATION':
        return <Clock className="w-4 h-4" />;
      case 'TASK_UPDATE':
        return <User className="w-4 h-4" />;
      case 'SYSTEM':
        return <Inbox className="w-4 h-4" />;
      default:
        return <Mail className="w-4 h-4" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const toggleStar = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isStarred: !msg.isStarred } : msg
    ));
  };

  const markAsRead = (messageId: string) => {
    setMessages(messages.map(msg => 
      msg.id === messageId ? { ...msg, isRead: true } : msg
    ));
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         message.preview.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    switch (filter) {
      case 'UNREAD':
        matchesFilter = !message.isRead;
        break;
      case 'STARRED':
        matchesFilter = message.isStarred;
        break;
      case 'ATTACHMENTS':
        matchesFilter = message.hasAttachment;
        break;
      default:
        matchesFilter = true;
    }
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(msg => !msg.isRead).length;
  const starredCount = messages.filter(msg => msg.isStarred).length;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] w-full flex-1 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-PRIMAry" />
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Enhanced Inbox</h1>
                <p className="text-gray-600 mt-1">Manage your messages and notifications</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {unreadCount} unread
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {starredCount} starred
                </Badge>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="ALL">All Messages</option>
            <option value="UNREAD">Unread</option>
            <option value="STARRED">Starred</option>
            <option value="ATTACHMENTS">With Attachments</option>
          </select>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            More Filters
          </Button>
            </div>

            {/* Messages List */}
            <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-200">
              {filteredMessages.map((message, index) => (
                <div
                  key={message.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors animate-scale-in ${
                    !message.isRead ? 'bg-blue-50/50' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => markAsRead(message.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Message Type Icon */}
                    <div className="mt-1 text-gray-400">
                      {getTypeIcon(message.type)}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${!message.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {message.from}
                        </span>
                        <Badge className={getPriorityColor(message.priority)}>
                          {message.priority}
                        </Badge>
                        {message.hasAttachment && (
                          <Paperclip className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                      
                      <h3 className={`text-sm mb-1 ${!message.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {message.subject}
                      </h3>
                      
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {message.preview}
                      </p>
                    </div>

                    {/* Actions and Timestamp */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatTimestamp(message.timestamp)}
                      </span>
                      
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(message.id);
                          }}
                          className="p-1"
                        >
                          <Star 
                            className={`w-4 h-4 ${
                              message.isStarred ? 'text-yellow-500 fill-current' : 'text-gray-400'
                            }`} 
                          />
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="p-1">
                          <Archive className="w-4 h-4 text-gray-400" />
                        </Button>
                        
                        <Button variant="ghost" size="sm" className="p-1">
                          <Trash2 className="w-4 h-4 text-gray-400" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
            </Card>

            {/* Empty State */}
            {filteredMessages.length === 0 && (
          <div className="text-center py-12">
            <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">
              {searchTerm || filter !== 'ALL' 
                ? 'Try adjusting your search or filter criteria' 
                : 'Your inbox is empty'
              }
            </p>
          </div>
        )}
      </div>
    </>
  );
}