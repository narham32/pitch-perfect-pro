alter view public.standings_view set (security_invoker = on);
alter view public.top_scorers_view set (security_invoker = on);
revoke all on function public.handle_new_user() from public, anon, authenticated;