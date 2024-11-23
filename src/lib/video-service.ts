import { supabase } from './supabase';
import type { VideoData, TagGroup } from './supabase-types';

const handleError = (error: unknown, defaultMessage: string) => {
  console.error(defaultMessage, error);
  if (error instanceof Error) {
    throw new Error(`${defaultMessage}: ${error.message}`);
  }
  throw new Error(defaultMessage);
};

export async function getVideos(category: string): Promise<VideoData[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'Failed to fetch videos');
    return []; // TypeScript requires a return here even though handleError throws
  }
}

export async function addVideo(
  category: string,
  title: string, 
  description: string,
  youtubeId: string, 
  tags: { [key: string]: string[] },
  isPublic: boolean = true
): Promise<VideoData> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to add a video');

    const { data, error } = await supabase
      .from('videos')
      .insert([{ 
        user_id: user.id,
        title, 
        description,
        youtube_id: youtubeId, 
        tags,
        category,
        is_public: isPublic
      }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    return data;
  } catch (error) {
    handleError(error, 'Failed to add video');
    throw error; // TypeScript requires this even though handleError throws
  }
}

export async function updateVideo(id: string, updates: Partial<VideoData>): Promise<VideoData> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    return data;
  } catch (error) {
    handleError(error, 'Failed to update video');
    throw error;
  }
}

export async function deleteVideo(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleError(error, 'Failed to delete video');
  }
}

export async function getTagGroups(category: string): Promise<TagGroup[]> {
  try {
    const { data, error } = await supabase
      .from('tag_groups')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    handleError(error, 'Failed to fetch tag groups');
    return [];
  }
}

export async function addTagGroup(
  category: string,
  name: string, 
  tags: string[] = []
): Promise<TagGroup> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User must be logged in to create a tag group');

    const { data, error } = await supabase
      .from('tag_groups')
      .insert([{ 
        user_id: user.id,
        name, 
        tags, 
        category 
      }])
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from insert');
    return data;
  } catch (error) {
    handleError(error, 'Failed to add tag group');
    throw error;
  }
}

export async function updateTagGroup(id: string, updates: Partial<TagGroup>): Promise<TagGroup> {
  try {
    const { data, error } = await supabase
      .from('tag_groups')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from update');
    return data;
  } catch (error) {
    handleError(error, 'Failed to update tag group');
    throw error;
  }
}

export async function deleteTagGroup(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('tag_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    handleError(error, 'Failed to delete tag group');
  }
}