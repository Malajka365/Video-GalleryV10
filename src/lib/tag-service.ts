import { supabase } from './supabase';
import type { TagGroup } from './supabase-types';

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
    console.error('Error fetching tag groups:', error);
    throw error;
  }
}

export async function addTagGroup(
  category: string,
  name: string, 
  tags: string[] = []
): Promise<TagGroup> {
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
  return data;
}

export async function updateTagGroup(id: string, updates: Partial<TagGroup>): Promise<TagGroup> {
  const { data, error } = await supabase
    .from('tag_groups')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteTagGroup(id: string): Promise<void> {
  const { error } = await supabase
    .from('tag_groups')
    .delete()
    .eq('id', id);

  if (error) throw error;
}