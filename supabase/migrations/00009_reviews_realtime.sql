-- Doctor Hub: Review rating trigger + Realtime

create or replace function public.update_doctor_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.doctors
  set
    rating_avg = coalesce((
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where doctor_id = coalesce(new.doctor_id, old.doctor_id)
    ), 0),
    rating_count = (
      select count(*)::int
      from public.reviews
      where doctor_id = coalesce(new.doctor_id, old.doctor_id)
    )
  where id = coalesce(new.doctor_id, old.doctor_id);

  return coalesce(new, old);
end;
$$;

drop trigger if exists reviews_update_doctor_rating on public.reviews;
create trigger reviews_update_doctor_rating
after insert or delete on public.reviews
for each row execute function public.update_doctor_rating();

-- Enable Realtime for live review feeds and doctor rating updates
alter publication supabase_realtime add table public.reviews;
alter publication supabase_realtime add table public.doctors;
