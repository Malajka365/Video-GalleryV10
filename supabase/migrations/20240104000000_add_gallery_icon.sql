-- Add icon column to galleries table
alter table public.galleries 
add column icon text not null default 'video';

-- Update existing rows to have a default icon
update public.galleries
set icon = 'video'
where icon is null;