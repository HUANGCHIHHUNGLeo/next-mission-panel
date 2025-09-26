'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/navigation';
import Topbar from '../components/Topbar';
import SkillPanel from '../components/SkillPanel';
import TaskList from '../components/TaskList';
import CharacterView from '../components/CharacterView';
import SettingsView from '../components/SettingsView';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session?.user || error) {
          router.push('/');
          return;
        }

        if (mounted) {
          setUser(session.user);
          await loadUserData(session.user.id);
        }
      } catch (error) {
        console.error('認證檢查錯誤:', error);
        if (mounted) {
          router.push('/');
        }
      }
    };

    checkAuth();

    return () => {
      mounted = false;
    };
  }, [router]);

  const loadUserData = async (userId) => {
    try {
      // 載入用戶檔案
      const { data: profile, error: profileError } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('載入用戶檔案錯誤:', profileError);
      }

      // 載入技能進度
      const { data: skillsData, error: skillsError } = await supabase
        .from('skill_progress')
        .select('*')
        .eq('user_id', userId);

      if (skillsError) {
        console.error('載入技能進度錯誤:', skillsError);
      }

      setUserProfile(profile || {
        display_name: user?.user_metadata?.display_name || '學生',
        grade: 1,
        level: 1,
        total_exp: 0,
        coins: 200,
        character_gender: 'male'
      });

      setSkills(skillsData || []);
      setLoading(false);
    } catch (error) {
      console.error('載入用戶資料錯誤:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('登出錯誤:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">載入中...</p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeView) {
      case 'character':
        return <CharacterView userProfile={userProfile} skills={skills} />;
      case 'settings':
        return <SettingsView userProfile={userProfile} onUpdate={loadUserData} />;
      default:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <SkillPanel skills={skills} />
              </div>
              <div>
                <TaskList userProfile={userProfile} onUpdate={loadUserData} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <Topbar 
        userProfile={userProfile}
        activeView={activeView}
        setActiveView={setActiveView}
        onLogout={handleLogout}
      />
      
      <main className="container mx-auto px-4 py-6">
        {renderContent()}
      </main>
    </div>
  );
}
