'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AddManagerTeamMemberModal } from '../../../components/team/AddManagerTeamMemberModal';
import { teamService } from '@/app/services/teamService';
import {
  Users,
  Plus,
  Mail,
  Phone,
  MapPin,
  Search,
  MoreVertical,
  CheckSquare,
  Clock
} from 'lucide-react';

interface TeamMember {
  id: string | number;
  name: string;
  email: string;
  role: string;
  designation: string;
  avatar: string;
  status: 'ACTIVE' | 'AWAY' | 'BUSY' | 'OFFLINE';
  activeTasks: number;
  completedTasks: number;
  location: string;
  phone: string;
  isActive?: boolean;
}

export default function ManagerTeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    // Get user role from localStorage
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    setUserRole(user?.role || '');

    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    setLoading(true);
    setDebugInfo('Loading team members...');
    try {
      console.log('🔍 Fetching manager team members...');
      
      const result = await teamService.getManagerTeamMembers();
      console.log('📊 Team members result:', result);

      if (result.success && result.data && Array.isArray(result.data)) {
        console.log('✅ Found team members:', result.data.length);
        
        // Transform employees to team members
        const members: TeamMember[] = result.data.map((emp: any) => ({
          id: emp.id || emp.employeeId,
          name: emp.name,
          email: emp.email || emp.user?.email || '',
          role: emp.role || emp.user?.role || 'EMPLOYEE',
          designation: emp.designation || 'Employee',
          avatar: teamService.generateAvatarInitials(emp.name),
          status: emp.status || 'ACTIVE',
          activeTasks: emp.activeTasks || 0,
          completedTasks: emp.completedTasks || 0,
          location: emp.location || 'Not specified',
          phone: emp.phone || emp.user?.phone || 'N/A',
          isActive: emp.isActive !== false,
        }));

        setTeamMembers(members);
        setDebugInfo(`✅ Loaded ${members.length} team members`);
        console.log('✅ Team members loaded:', members.length);
      } else {
        console.warn('⚠️ No team members found or API error');
        setDebugInfo('No team members assigned yet. Add one to get started.');
        setTeamMembers([]);
      }
    } catch (error) {
      console.error('❌ Error loading team members:', error);
      setDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemberSuccess = (newMember: TeamMember) => {
    console.log('✅ New member added:', newMember);
    // Add the new member to the list
    setTeamMembers(prev => [newMember, ...prev]);
    setDebugInfo(`✅ Team member "${newMember.name}" added successfully!`);
  };

  const getStatusColor = (status: TeamMember['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'AWAY':
        return 'bg-yellow-100 text-yellow-800';
      case 'BUSY':
        return 'bg-red-100 text-red-800';
      case 'OFFLINE':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusDot = (status: TeamMember['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-500';
      case 'AWAY':
        return 'bg-yellow-500';
      case 'BUSY':
        return 'bg-red-500';
      case 'OFFLINE':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isManager = userRole === 'MANAGER';

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
                <h1 className="text-3xl font-bold text-gray-900">My Team</h1>
                <p className="text-gray-600 mt-1">Manage your team members and their activities</p>
              </div>
              {isManager && (
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setIsAddMemberOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                  Add Team Member
                </Button>
              )}
            </div>

            {/* Debug Info */}
            {debugInfo && (
              <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
                <p className="text-sm">{debugInfo}</p>
              </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold">{teamMembers.length}</p>
                      <p className="text-sm text-gray-600">Total Members</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div>
                      <p className="text-2xl font-bold">
                        {teamMembers.filter(m => m.status === 'ACTIVE').length}
                      </p>
                      <p className="text-sm text-gray-600">Active Now</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckSquare className="w-8 h-8 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {teamMembers.reduce((sum, m) => sum + m.completedTasks, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Tasks Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-orange-600" />
                    <div>
                      <p className="text-2xl font-bold">
                        {teamMembers.reduce((sum, m) => sum + m.activeTasks, 0)}
                      </p>
                      <p className="text-sm text-gray-600">Active Tasks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Team Members Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map((member, index) => (
                <Card
                  key={member.id}
                  className="card-hover animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {member.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 ${getStatusDot(member.status)} rounded-full border-2 border-white`}></div>
                        </div>
                        <div>
                          <CardTitle className="text-lg">{member.name}</CardTitle>
                          <CardDescription>{member.designation}</CardDescription>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Status */}
                    <Badge className={getStatusColor(member.status)}>
                      {member.status}
                    </Badge>

                    {/* Contact Info */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{member.phone}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span>{member.location}</span>
                      </div>
                    </div>

                    {/* Task Stats */}
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{member.activeTasks}</p>
                        <p className="text-xs text-gray-600">Active Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{member.completedTasks}</p>
                        <p className="text-xs text-gray-600">Completed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredMembers.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first team member'}
                </p>
                {isManager && (
                  <Button 
                    className="flex items-center gap-2 mx-auto"
                    onClick={() => setIsAddMemberOpen(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Team Member
                  </Button>
                )}
              </div>
            )}
          </div>

      {/* Add Team Member Modal */}
      {isManager && (
        <AddManagerTeamMemberModal
          isOpen={isAddMemberOpen}
          onClose={() => setIsAddMemberOpen(false)}
          onSuccess={handleAddMemberSuccess}
        />
      )}
    </>
  );
}
