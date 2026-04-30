"use client"
import React from 'react';
import { Clock, CheckCircle, PieChart, PlusCircle, Calendar, AlertTriangle } from 'lucide-react';

// Static data for now
const staticLeaveData = {
  balance: {
    totalAllowance: 24,
    usedDays: 8,
    pendingDays: 2,
    remainingDays: 14
  },
  pendingRequests: [
    { id: 1, type: 'Sick Leave', startDate: '2024-01-15', endDate: '2024-01-16', days: 2, status: 'Pending' },
  ],
  recentActivity: [
    { id: 1, type: 'Casual Leave', startDate: '2024-01-10', endDate: '2024-01-10', days: 1, status: 'Approved' },
    { id: 2, type: 'Sick Leave', startDate: '2024-01-05', endDate: '2024-01-07', days: 3, status: 'Approved' },
    { id: 3, type: 'Earned Leave', startDate: '2023-12-20', endDate: '2023-12-22', days: 3, status: 'Rejected' },
  ]
};

const LeaveStatusWidget: React.FC = () => {
  const { balance, pendingRequests, recentActivity } = staticLeaveData;
  const isLowBalance = balance.remainingDays < 3;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-green-600 bg-green-50';
      case 'Pending': return 'text-yellow-600 bg-yellow-50';
      case 'Rejected': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="w-full p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Leave Status</h2>
          <p className="text-gray-600">Your leave overview and recent activity</p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* Leave Balance Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <PieChart className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Leave Balance</h3>
                  <p className="text-sm text-gray-500">Days remaining</p>
                </div>
              </div>
              {isLowBalance && (
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              )}
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-900">
                  {balance.remainingDays}
                </span>
                <span className="text-sm text-gray-500">
                  of {balance.totalAllowance} days
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${isLowBalance ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${(balance.usedDays / balance.totalAllowance) * 100}%` }}
                ></div>
              </div>
              
              <div className="flex justify-between text-sm text-gray-600">
                <span>Used: {balance.usedDays}</span>
                <span>Pending: {balance.pendingDays}</span>
              </div>
              
              {isLowBalance && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm text-amber-700">Low balance warning</span>
                </div>
              )}
            </div>
          </div>

          {/* Pending Requests Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Pending Requests</h3>
                <p className="text-sm text-gray-500">Awaiting approval</p>
              </div>
            </div>
            
            {pendingRequests.length > 0 ? (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-yellow-600">
                    {pendingRequests.length}
                  </span>
                  <span className="text-sm text-gray-500">
                    {balance.pendingDays} days
                  </span>
                </div>
                
                <div className="space-y-2">
                  {pendingRequests.map((request) => (
                    <div key={request.id} className="p-3 bg-yellow-50 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-900">{request.type}</span>
                        <span className="text-sm text-gray-600">{request.days} days</span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
                
                <button className="w-full text-sm text-yellow-700 hover:text-yellow-800 font-medium">
                  View Details →
                </button>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">No pending requests</p>
              </div>
            )}
          </div>

          {/* Quick Apply Card */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <PlusCircle className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Apply</h3>
                <p className="text-sm text-gray-500">Apply for leave</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-lg font-medium transition-colors">
                Apply for Leave
              </button>
              
              <div className="grid grid-cols-2 gap-2 text-sm">
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded border">
                  Sick Leave
                </button>
                <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded border">
                  Casual Leave
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm border">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Recent Activity</h3>
                <p className="text-sm text-gray-500">Your latest leave transactions</p>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                        {activity.status}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{activity.type}</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(activity.startDate)} - {formatDate(activity.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{activity.days} days</p>
                    </div>
                  </div>
                ))}
                
                <button className="w-full text-sm text-gray-600 hover:text-gray-800 font-medium py-2">
                  View All Activity →
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No recent activity</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveStatusWidget;