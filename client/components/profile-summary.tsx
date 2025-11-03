'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { profileService, UserProfile } from '@/lib/profileService';
import { Settings, User, BookOpen } from 'lucide-react';

export function ProfileSummary() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return null;
  }

  const faithContextLabels = {
    christian: 'Christian',
    jewish: 'Jewish',
    muslim: 'Muslim',
    general: 'General/Interfaith',
  };

  const depthModeLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    scholar: 'Scholar',
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Profile</CardTitle>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/profile">
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <CardDescription>Your study preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">Name</p>
          <p className="text-base">
            {profile.first_name || profile.last_name
              ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim()
              : 'Not set'}
          </p>
        </div>
        
        <div>
          <p className="text-sm font-medium text-muted-foreground">Email</p>
          <p className="text-base">{profile.email}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            {faithContextLabels[profile.faith_context]}
          </Badge>
          <Badge variant="outline">
            {depthModeLabels[profile.preferred_depth_mode]}
          </Badge>
        </div>

        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href="/profile">
            <Settings className="h-4 w-4 mr-2" />
            Manage Profile
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
