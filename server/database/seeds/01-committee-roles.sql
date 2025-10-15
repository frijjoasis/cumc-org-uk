-- Populate CommitteeRoles table with standard CUMC committee roles
-- This file seeds the committee role definitions

INSERT INTO "CommitteeRoles" (role_name, role_slug, description, email_alias, is_required, max_positions, sort_order, is_active) VALUES

-- Core executive roles (required each year)
('President', 'president', 'Lead the club and represent CUMC to the university and external organizations', 'president@cumc.org.uk', TRUE, 2, 1, TRUE),
('Secretary', 'secretary', 'Handle club correspondence, meeting minutes, and administrative duties', 'secretary@cumc.org.uk', TRUE, 1, 2, TRUE),
('Treasurer', 'treasurer', 'Manage club finances, budgets, and payment processing', 'treasurer@cumc.org.uk', TRUE, 1, 3, TRUE),

-- Essential operational roles
('Gear Secretary', 'gear', 'Maintain and manage club climbing equipment and gear library', 'gear@cumc.org.uk', TRUE, 1, 4, TRUE),
('Indoor Meets Secretary', 'indoor-meets', 'Organize and run weekly indoor climbing sessions', 'indoor-meets@cumc.org.uk', TRUE, 2, 5, TRUE),

-- Outdoor activity coordination
('Trad/Alpine Meets Secretary', 'trad-alpine', 'Organize traditional and alpine climbing trips and instruction', 'outdoor-meets@cumc.org.uk', TRUE, 2, 6, TRUE),
('Sport/Boulder Meets Secretary', 'sport-boulder', 'Organize sport climbing and bouldering trips and activities', 'outdoor-meets@cumc.org.uk', FALSE, 2, 7, TRUE),

-- Specialized roles
('Competitions Secretary', 'competitions', 'Coordinate club participation in climbing competitions and organize internal competitions', 'competitions@cumc.org.uk', FALSE, 2, 8, TRUE),
('Social Secretary', 'social', 'Organize social events, pub trips, and non-climbing club activities', 'socials@cumc.org.uk', TRUE, 2, 9, TRUE),
('Postgrad Social Secretary', 'postgrad-social', 'Organize events specifically for postgraduate members', 'socials@cumc.org.uk', FALSE, 1, 10, TRUE),

-- Information and documentation
('Webmaster', 'webmaster', 'Maintain club website, online presence, and digital infrastructure', 'webmaster@cumc.org.uk', TRUE, 1, 11, TRUE),
('Journal Editor', 'journal', 'Edit and publish the annual club journal', 'journal@cumc.org.uk', FALSE, 1, 12, TRUE),
('Librarian', 'librarian', 'Maintain club library of climbing books, guides, and resources', 'librarian@cumc.org.uk', FALSE, 1, 13, TRUE),

-- Welfare and inclusion
('Access & Welfare Officer', 'welfare', 'Ensure club accessibility and member welfare, handle safety concerns', 'welfare@cumc.org.uk', TRUE, 2, 14, TRUE)

ON CONFLICT (role_slug) DO NOTHING;
