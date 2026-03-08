CREATE INDEX idx_link_clicks_profile_id ON public.link_clicks (profile_id);
CREATE INDEX idx_link_clicks_link_id ON public.link_clicks (link_id);
CREATE INDEX idx_link_clicks_clicked_at ON public.link_clicks (clicked_at);