-- Enable RLS but allow all access for this demo
alter table presentations enable row level security;
create policy "Allow all access" on presentations for all using (true) with check (true);

alter table slides enable row level security;
create policy "Allow all access" on slides for all using (true) with check (true);

alter table active_sessions enable row level security;
create policy "Allow all access" on active_sessions for all using (true) with check (true);

alter table votes enable row level security;
create policy "Allow all access" on votes for all using (true) with check (true);
