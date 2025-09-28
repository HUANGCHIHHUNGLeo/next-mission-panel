-- ===== 數學學習平台 v2 - RLS 政策設定 =====

-- ===== 清除所有現有政策 =====
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

DROP POLICY IF EXISTS "Users can view own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users can insert own learning progress" ON public.learning_progress;
DROP POLICY IF EXISTS "Users can update own learning progress" ON public.learning_progress;

DROP POLICY IF EXISTS "Users can view own learning sessions" ON public.learning_sessions;
DROP POLICY IF EXISTS "Users can insert own learning sessions" ON public.learning_sessions;

-- ===== 用戶資料表政策 =====
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- ===== 學習進度表政策 =====
CREATE POLICY "Users can view own learning progress" ON public.learning_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning progress" ON public.learning_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own learning progress" ON public.learning_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== 學習記錄表政策 =====
CREATE POLICY "Users can view own learning sessions" ON public.learning_sessions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own learning sessions" ON public.learning_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== 驗證政策建立 =====
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('users', 'learning_progress', 'learning_sessions')
ORDER BY tablename, policyname;

-- ===== 成功訊息 =====
SELECT 'RLS policies created successfully!' as status;
