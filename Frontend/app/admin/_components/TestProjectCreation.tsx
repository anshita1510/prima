'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TestProjectCreation() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('Testing connection...');

    try {
      // Test 1: Login
      const loginResponse = await fetch('http://localhost:5004/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@company.com',
          password: 'admin123'
        })
      });

      const loginData = await loginResponse.json();
      
      if (!loginData.success) {
        setResult(`❌ Login failed: ${loginData.message}`);
        return;
      }

      setResult(`✅ Login successful! User: ${loginData.user.name}`);

      // Test 2: Create Project
      const projectResponse = await fetch('http://localhost:5004/api/project-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${loginData.token}`
        },
        body: JSON.stringify({
          name: `Test Project ${Date.now()}`,
          description: 'Testing frontend-backend connection',
          companyId: 2,
          departmentId: 2,
          ownerId: loginData.user.employeeId,
          status: 'PLANNING'
        })
      });

      const projectData = await projectResponse.json();
      
      if (projectData.success) {
        setResult(prev => prev + `\n✅ Project created! ID: ${projectData.data.id}, Code: ${projectData.data.code}`);
      } else {
        setResult(prev => prev + `\n❌ Project creation failed: ${projectData.message}`);
      }

    } catch (error: any) {
      setResult(`❌ Connection error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorage = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    setResult(`Local Storage Check:
Token: ${token ? 'EXISTS' : 'NOT FOUND'}
User: ${user ? 'EXISTS' : 'NOT FOUND'}
API URL: ${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5004'}`);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🔧 Frontend-Backend Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={loading}>
            {loading ? 'Testing...' : 'Test Connection & Create Project'}
          </Button>
          <Button variant="outline" onClick={checkLocalStorage}>
            Check Local Storage
          </Button>
        </div>
        
        {result && (
          <div className="p-4 bg-gray-100 rounded-md">
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
        
        <div className="text-sm text-gray-600">
          <p><strong>Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Test Connection & Create Project" to test the API</li>
            <li>Check browser console (F12) for detailed logs</li>
            <li>If this works but your form doesn't, the issue is in the form component</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}