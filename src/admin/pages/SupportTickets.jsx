import React, { useState } from 'react';
import {
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  User,
  Headphones,
  Search,
  Filter,
  ArrowRight,
  ExternalLink,
  Tag,
  X,
  ChevronDown,
} from 'lucide-react';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import { mockTickets } from '../mockData';

const statusVariants = {
  Open: 'warning',
  'In Progress': 'info',
  Resolved: 'success',
  Closed: 'neutral',
};

const priorityVariants = {
  High: 'danger',
  Medium: 'warning',
  Low: 'neutral',
};

export default function SupportTickets() {
  const [tickets, setTickets] = useState(mockTickets);
  const [activeTab, setActiveTab] = useState('open');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');

  // MOCK DATA - Canned responses
  const cannedResponses = [
    { id: 1, title: 'Welcome', text: 'Thank you for reaching out! I\'d be happy to help you with this.' },
    { id: 2, title: 'Need More Info', text: 'Could you please provide more details about the issue you\'re experiencing?' },
    { id: 3, title: 'Escalating', text: 'I\'m escalating this to our senior support team for further review.' },
    { id: 4, title: 'Resolution', text: 'I\'ve resolved the issue. Please let me know if you need any further assistance.' },
    { id: 5, title: 'Follow Up', text: 'Just checking in - were you able to resolve the issue with the steps provided?' },
  ];

  // MOCK DATA - Stats
  const stats = [
    { label: 'Open Tickets', value: tickets.filter(t => t.status === 'Open').length, icon: AlertCircle, color: 'amber' },
    { label: 'In Progress', value: tickets.filter(t => t.status === 'In Progress').length, icon: Clock, color: 'blue' },
    { label: 'Resolved Today', value: 8, icon: CheckCircle, color: 'emerald' },
    { label: 'Avg Response Time', value: '2.4h', icon: MessageSquare, color: 'indigo' },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'open' && ticket.status === 'Open') ||
      (activeTab === 'progress' && ticket.status === 'In Progress') ||
      (activeTab === 'resolved' && (ticket.status === 'Resolved' || ticket.status === 'Closed'));
    
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesTab && matchesSearch && matchesPriority;
  });

  const handleReply = () => {
    if (!replyText.trim() || !selectedTicket) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'admin',
      text: replyText,
      timestamp: new Date().toISOString(),
    };

    setTickets(prev => prev.map(t => 
      t.id === selectedTicket.id 
        ? { ...t, messages: [...t.messages, newMessage] } 
        : t
    ));

    setSelectedTicket(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));

    setReplyText('');
  };

  const handleStatusChange = (ticketId, newStatus) => {
    setTickets(prev => prev.map(t => 
      t.id === ticketId ? { ...t, status: newStatus } : t
    ));
    
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => ({ ...prev, status: newStatus }));
    }
  };

  const handleAssign = (ticketId) => {
    const assignee = prompt('Enter agent name:');
    if (assignee) {
      setTickets(prev => prev.map(t => 
        t.id === ticketId ? { ...t, assignee, status: 'In Progress' } : t
      ));
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111827] border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-${stat.color}-500/20 rounded-lg flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-400`} />
              </div>
              <div>
                <p className="text-xs text-gray-400">{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 bg-[#111827] border border-gray-800 rounded-xl overflow-hidden">
          {/* Tabs */}
          <div className="border-b border-gray-800">
            <div className="flex">
              {[
                { id: 'open', label: 'Open' },
                { id: 'progress', label: 'In Progress' },
                { id: 'resolved', label: 'Resolved' },
                { id: 'all', label: 'All' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-indigo-400 border-b-2 border-indigo-400'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search & Filter */}
          <div className="p-4 border-b border-gray-800 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets..."
                className="w-full pl-10 pr-4 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-3 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-gray-300 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {/* Tickets List */}
          <div className="max-h-[500px] overflow-y-auto">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No tickets found</p>
              </div>
            ) : (
              filteredTickets.map(ticket => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={`p-4 border-b border-gray-800/50 hover:bg-gray-800/30 cursor-pointer transition-colors ${
                    selectedTicket?.id === ticket.id ? 'bg-gray-800/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge label={ticket.priority} variant={priorityVariants[ticket.priority]} size="sm" />
                      <Badge label={ticket.status} variant={statusVariants[ticket.status]} size="sm" />
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(ticket.created).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-white font-medium mb-1">{ticket.subject}</h4>
                  <p className="text-sm text-gray-400 line-clamp-2">{ticket.messages[0]?.text}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">{ticket.user}</span>
                    {ticket.assignee && (
                      <span className="text-xs text-indigo-400">
                        <Headphones className="w-3 h-3 inline mr-1" />
                        {ticket.assignee}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Ticket Detail / Conversation Thread */}
        <div className="bg-[#111827] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          {selectedTicket ? (
            <>
              {/* Header */}
              <div className="p-4 border-b border-gray-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge label={selectedTicket.priority} variant={priorityVariants[selectedTicket.priority]} />
                    <Badge label={selectedTicket.status} variant={statusVariants[selectedTicket.status]} />
                  </div>
                  <button 
                    onClick={() => setSelectedTicket(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="text-white font-semibold mb-1">{selectedTicket.subject}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {selectedTicket.user}
                  </span>
                  <span>#{selectedTicket.id}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[300px]">
                {selectedTicket.messages.map(msg => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-lg p-3 ${
                      msg.sender === 'admin' 
                        ? 'bg-indigo-500/20 text-indigo-100' 
                        : 'bg-gray-800 text-gray-200'
                    }`}>
                      <p className="text-sm">{msg.text}</p>
                      <p className="text-xs mt-1 opacity-50">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-t border-gray-800 flex gap-2">
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                  className="px-2 py-1 bg-[#0A0E1A] border border-gray-700 rounded text-xs text-gray-300 focus:outline-none"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
                <button
                  onClick={() => handleAssign(selectedTicket.id)}
                  className="px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs hover:bg-gray-700"
                >
                  Assign
                </button>
              </div>

              {/* Reply Box */}
              <div className="p-4 border-t border-gray-800">
                {/* Canned Responses */}
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3 h-3 text-gray-500" />
                    <span className="text-xs text-gray-500">Quick Responses</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {cannedResponses.slice(0, 3).map(resp => (
                      <button
                        key={resp.id}
                        onClick={() => setReplyText(resp.text)}
                        className="px-2 py-1 bg-gray-800 text-gray-400 rounded text-xs hover:bg-gray-700 hover:text-white"
                      >
                        {resp.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    rows={2}
                    className="flex-1 px-3 py-2 bg-[#0A0E1A] border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm focus:outline-none focus:border-indigo-500 resize-none"
                  />
                  <button
                    onClick={handleReply}
                    disabled={!replyText.trim()}
                    className="px-4 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Select a ticket to view</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Canned Responses Table */}
      <div className="bg-[#111827] border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Canned Responses</h3>
          <button className="px-3 py-2 bg-indigo-500 text-white rounded-lg text-sm hover:bg-indigo-600">
            Add Response
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Title</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Response Text</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cannedResponses.map(resp => (
                <tr key={resp.id} className="border-b border-gray-800/50">
                  <td className="px-4 py-3 text-sm text-white font-medium">{resp.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-400 max-w-md truncate">{resp.text}</td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-white text-sm">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
