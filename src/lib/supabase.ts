import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_STORAGE_KEYS = {
  URL: 'soul_supabase_url',
  KEY: 'soul_supabase_key',
};

let clientInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseCredentials(): { url: string; key: string } {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  let customUrl = '';
  let customKey = '';
  try {
    customUrl = localStorage.getItem(SUPABASE_STORAGE_KEYS.URL) || '';
    customKey = localStorage.getItem(SUPABASE_STORAGE_KEYS.KEY) || '';
  } catch {}

  const defaultUrl = 'https://tpstlqalinybpmtsmfhf.supabase.co';

  return {
    url: (customUrl || envUrl || defaultUrl).trim(),
    key: (customKey || envKey).trim(),
  };
}

export function isSupabaseConfigured(): boolean {
  const { url, key } = getSupabaseCredentials();
  return Boolean(url && key && url.startsWith('http'));
}

export function getSupabaseClient(): SupabaseClient | null {
  const { url, key } = getSupabaseCredentials();
  if (!url || !key) {
    clientInstance = null;
    return null;
  }

  const keyFingerprint = `${url}_${key}`;
  if (clientInstance && currentConfigKey === keyFingerprint) {
    return clientInstance;
  }

  try {
    clientInstance = createClient(url, key, {
      auth: {
        persistSession: false,
      },
    });
    currentConfigKey = keyFingerprint;
    return clientInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    clientInstance = null;
    return null;
  }
}

export function saveSupabaseCredentials(url: string, key: string): void {
  localStorage.setItem(SUPABASE_STORAGE_KEYS.URL, url.trim());
  localStorage.setItem(SUPABASE_STORAGE_KEYS.KEY, key.trim());
  clientInstance = null;
  currentConfigKey = '';
  window.dispatchEvent(new Event('soul_supabase_config_changed'));
}

export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase URL and API Key are missing or incomplete.',
    };
  }

  try {
    const { data, error } = await client
      .from('soul_state')
      .select('id, updated_at')
      .eq('id', 'default')
      .limit(1);

    if (error) {
      // If soul_state table not created yet, inform user to run SQL schema
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but "soul_state" table is missing. Please execute the SQL schema queries in Supabase SQL Editor.',
        };
      }
      return { success: false, message: `Database error: ${error.message}` };
    }

    return {
      success: true,
      message: 'Successfully connected and authenticated with Supabase!',
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Connection failed: ${err?.message || String(err)}`,
    };
  }
}

// Debounce timer for pushing full state to Supabase
let syncTimeout: any = null;

export function triggerSupabaseSync(state: {
  preferences?: any;
  timetable?: any;
  subjects?: any;
  tasks?: any;
  habits?: any;
  history?: any;
  postGymRoutine?: any;
  msbteCalendar?: any;
  performance?: any;
  roastSettings?: any;
  masterGoals?: any;
  weeklyTargets?: any;
  dailyRoutine?: any;
  technicalTopics?: any;
  weeklyProjects?: any;
  skillOfTheWeek?: any;
  learningGames?: any;
  communicationActivities?: any;
  confidenceChallenges?: any;
  dailyReviews?: any;
}) {
  if (!isSupabaseConfigured()) return;

  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  syncTimeout = setTimeout(async () => {
    try {
      const client = getSupabaseClient();
      if (!client) return;

      const payload = {
        id: 'default',
        preferences: state.preferences,
        timetable: state.timetable,
        subjects: state.subjects,
        tasks: state.tasks,
        habits: state.habits,
        history: state.history,
        post_gym_routine: state.postGymRoutine,
        updated_at: new Date().toISOString(),
      };

      const { error } = await client
        .from('soul_state')
        .upsert(payload, { onConflict: 'id' });

      if (error) {
        console.warn('Supabase cloud sync failed:', error.message);
      } else {
        window.dispatchEvent(new CustomEvent('soul_cloud_synced', { detail: { timestamp: new Date() } }));
      }
    } catch (e) {
      console.warn('Supabase sync error:', e);
    }
  }, 1000);
}

export async function fetchStateFromSupabase(): Promise<{
  preferences?: any;
  timetable?: any;
  subjects?: any;
  tasks?: any;
  habits?: any;
  history?: any;
  postGymRoutine?: any;
} | null> {
  if (!isSupabaseConfigured()) return null;

  try {
    const client = getSupabaseClient();
    if (!client) return null;

    const { data, error } = await client
      .from('soul_state')
      .select('*')
      .eq('id', 'default')
      .single();

    if (error || !data) {
      return null;
    }

    return {
      preferences: data.preferences,
      timetable: data.timetable,
      subjects: data.subjects,
      tasks: data.tasks,
      habits: data.habits,
      history: data.history,
      postGymRoutine: data.post_gym_routine,
    };
  } catch (err) {
    console.error('Failed to fetch state from Supabase:', err);
    return null;
  }
}
