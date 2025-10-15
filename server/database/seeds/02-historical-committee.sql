-- Insert all historical committee data into the database
-- This script processes the hardcoded committee data and inserts it properly

-- Historical committee data with proper role mapping
-- Based on the header: ["Year","President","Secretary","Treasurer","Gear","Outdoor Meet","Indoor Meet","Alpine and Winter", "Competition","Social","Journal","Librarian","Webmaster","Welfare"]

DO $$
DECLARE
    president_role_id INTEGER;
    secretary_role_id INTEGER;
    treasurer_role_id INTEGER;
    gear_role_id INTEGER;
    outdoor_meet_role_id INTEGER;
    indoor_meet_role_id INTEGER;
    alpine_winter_role_id INTEGER;
    competition_role_id INTEGER;
    social_role_id INTEGER;
    journal_role_id INTEGER;
    librarian_role_id INTEGER;
    webmaster_role_id INTEGER;
    welfare_role_id INTEGER;
BEGIN
    -- Get role IDs for mapping
    SELECT id INTO president_role_id FROM "CommitteeRoles" WHERE role_slug = 'president' LIMIT 1;
    SELECT id INTO secretary_role_id FROM "CommitteeRoles" WHERE role_slug = 'secretary' LIMIT 1;
    SELECT id INTO treasurer_role_id FROM "CommitteeRoles" WHERE role_slug = 'treasurer' LIMIT 1;
    SELECT id INTO gear_role_id FROM "CommitteeRoles" WHERE role_slug = 'gear' LIMIT 1;
    SELECT id INTO outdoor_meet_role_id FROM "CommitteeRoles" WHERE role_slug = 'trad-alpine' LIMIT 1;
    SELECT id INTO indoor_meet_role_id FROM "CommitteeRoles" WHERE role_slug = 'indoor-meets' LIMIT 1;
    SELECT id INTO alpine_winter_role_id FROM "CommitteeRoles" WHERE role_slug = 'trad-alpine' LIMIT 1; -- Map Alpine/Winter to Trad/Alpine
    SELECT id INTO competition_role_id FROM "CommitteeRoles" WHERE role_slug = 'competitions' LIMIT 1;
    SELECT id INTO social_role_id FROM "CommitteeRoles" WHERE role_slug = 'social' LIMIT 1;
    SELECT id INTO journal_role_id FROM "CommitteeRoles" WHERE role_slug = 'journal' LIMIT 1;
    SELECT id INTO librarian_role_id FROM "CommitteeRoles" WHERE role_slug = 'librarian' LIMIT 1;
    SELECT id INTO webmaster_role_id FROM "CommitteeRoles" WHERE role_slug = 'webmaster' LIMIT 1;
    SELECT id INTO welfare_role_id FROM "CommitteeRoles" WHERE role_slug = 'welfare' LIMIT 1;

    -- Insert 2024-2025 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2024-2025', 'President', president_role_id, 'Jade Westfoot', 'past', FALSE, 1),
    ('2024-2025', 'President', president_role_id, 'Tessa Mullen', 'past', FALSE, 2),
    ('2024-2025', 'Secretary', secretary_role_id, 'Danylo Mankovsky', 'past', FALSE, 3),
    ('2024-2025', 'Treasurer', treasurer_role_id, 'Fin Chetham', 'past', FALSE, 4),
    ('2024-2025', 'Gear', gear_role_id, 'Inigo Holman', 'past', FALSE, 5),
    ('2024-2025', 'Outdoor Meet', outdoor_meet_role_id, 'Hermione Boyle', 'past', FALSE, 6),
    ('2024-2025', 'Outdoor Meet', outdoor_meet_role_id, 'Isaac Miller', 'past', FALSE, 7),
    ('2024-2025', 'Indoor Meet', indoor_meet_role_id, 'Seb Gentile', 'past', FALSE, 8),
    ('2024-2025', 'Indoor Meet', indoor_meet_role_id, 'Rebecca Jesson', 'past', FALSE, 9),
    ('2024-2025', 'Alpine and Winter', alpine_winter_role_id, 'Alex Maltby', 'past', FALSE, 10),
    ('2024-2025', 'Competition', competition_role_id, 'Nat Tompkins', 'past', FALSE, 11),
    ('2024-2025', 'Social', social_role_id, 'Oliver Gaskell', 'past', FALSE, 12),
    ('2024-2025', 'Welfare', welfare_role_id, 'Anastasia Marine', 'past', FALSE, 13),
    ('2024-2025', 'Welfare', welfare_role_id, 'Izzie Iveson', 'past', FALSE, 14)
    ON CONFLICT DO NOTHING;

    -- Insert 2023-2024 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2023-2024', 'President', president_role_id, 'Noah Grodzinski', 'past', FALSE, 1),
    ('2023-2024', 'President', president_role_id, 'Eren Ozturk', 'past', FALSE, 2),
    ('2023-2024', 'Secretary', secretary_role_id, 'Alice Ward', 'past', FALSE, 3),
    ('2023-2024', 'Treasurer', treasurer_role_id, 'Jake Thakur', 'past', FALSE, 4),
    ('2023-2024', 'Gear', gear_role_id, 'Leo Ellis', 'past', FALSE, 5),
    ('2023-2024', 'Outdoor Meet', outdoor_meet_role_id, 'Tom de Csilléry', 'past', FALSE, 6),
    ('2023-2024', 'Indoor Meet', indoor_meet_role_id, 'Seb Gentile', 'past', FALSE, 7),
    ('2023-2024', 'Indoor Meet', indoor_meet_role_id, 'Fin Chetham', 'past', FALSE, 8),
    ('2023-2024', 'Alpine and Winter', alpine_winter_role_id, 'Lev Davies', 'past', FALSE, 9),
    ('2023-2024', 'Competition', competition_role_id, 'Jade Westfoot', 'past', FALSE, 10),
    ('2023-2024', 'Competition', competition_role_id, 'Inigo Holman', 'past', FALSE, 11),
    ('2023-2024', 'Social', social_role_id, 'Tessa Mullen', 'past', FALSE, 12),
    ('2023-2024', 'Social', social_role_id, 'Josh Davies', 'past', FALSE, 13),
    ('2023-2024', 'Journal', journal_role_id, 'Eren Ozturk', 'past', FALSE, 14),
    ('2023-2024', 'Librarian', librarian_role_id, 'Tessa Mullen', 'past', FALSE, 15),
    ('2023-2024', 'Webmaster', webmaster_role_id, 'Jake Thakur', 'past', FALSE, 16),
    ('2023-2024', 'Welfare', welfare_role_id, 'Keying Guao', 'past', FALSE, 17)
    ON CONFLICT DO NOTHING;

    -- Insert 2022-2023 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2022-2023', 'President', president_role_id, 'Elizabeth Stephenson', 'past', FALSE, 1),
    ('2022-2023', 'Secretary', secretary_role_id, 'Eren Ozturk', 'past', FALSE, 2),
    ('2022-2023', 'Treasurer', treasurer_role_id, 'Holly Davis', 'past', FALSE, 3),
    ('2022-2023', 'Gear', gear_role_id, 'Ari Chan', 'past', FALSE, 4),
    ('2022-2023', 'Outdoor Meet', outdoor_meet_role_id, 'Eve Seymour', 'past', FALSE, 5),
    ('2022-2023', 'Outdoor Meet', outdoor_meet_role_id, 'Joe McDermott', 'past', FALSE, 6),
    ('2022-2023', 'Indoor Meet', indoor_meet_role_id, 'Gabe Gentile', 'past', FALSE, 7),
    ('2022-2023', 'Indoor Meet', indoor_meet_role_id, 'Leo Petchey', 'past', FALSE, 8),
    ('2022-2023', 'Alpine and Winter', alpine_winter_role_id, 'Eren Ozturk', 'past', FALSE, 9),
    ('2022-2023', 'Competition', competition_role_id, 'Hannah Zia', 'past', FALSE, 10),
    ('2022-2023', 'Competition', competition_role_id, 'Matthew Fall', 'past', FALSE, 11),
    ('2022-2023', 'Social', social_role_id, 'Tilly Corcoran', 'past', FALSE, 12),
    ('2022-2023', 'Social', social_role_id, 'Noah Grodzinski', 'past', FALSE, 13),
    ('2022-2023', 'Journal', journal_role_id, 'Lily Olliver', 'past', FALSE, 14),
    ('2022-2023', 'Librarian', librarian_role_id, 'Lauren Charnley-Parr', 'past', FALSE, 15),
    ('2022-2023', 'Webmaster', webmaster_role_id, 'Jake Thakur', 'past', FALSE, 16),
    ('2022-2023', 'Welfare', welfare_role_id, 'Caitlin van Bommel', 'past', FALSE, 17)
    ON CONFLICT DO NOTHING;

    -- Insert 2021-2022 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2021-2022', 'President', president_role_id, 'Bethan Davies-Williams', 'past', FALSE, 1),
    ('2021-2022', 'Secretary', secretary_role_id, 'Ilya Carey', 'past', FALSE, 2),
    ('2021-2022', 'Treasurer', treasurer_role_id, 'Edmund Ross', 'past', FALSE, 3),
    ('2021-2022', 'Gear', gear_role_id, 'Sidney Leedham', 'past', FALSE, 4),
    ('2021-2022', 'Outdoor Meet', outdoor_meet_role_id, 'Elizabeth Stephenson', 'past', FALSE, 5),
    ('2021-2022', 'Outdoor Meet', outdoor_meet_role_id, 'Tom de Csilléry', 'past', FALSE, 6),
    ('2021-2022', 'Indoor Meet', indoor_meet_role_id, 'Humphrey Allen', 'past', FALSE, 7),
    ('2021-2022', 'Indoor Meet', indoor_meet_role_id, 'Philip Sosnin', 'past', FALSE, 8),
    ('2021-2022', 'Alpine and Winter', alpine_winter_role_id, 'Elizabeth Stephenson', 'past', FALSE, 9),
    ('2021-2022', 'Competition', competition_role_id, 'Matthew Fall', 'past', FALSE, 10),
    ('2021-2022', 'Social', social_role_id, 'Holly Davis', 'past', FALSE, 11),
    ('2021-2022', 'Social', social_role_id, 'Arianna Chan', 'past', FALSE, 12),
    ('2021-2022', 'Journal', journal_role_id, 'Sam Reynolds', 'past', FALSE, 13),
    ('2021-2022', 'Librarian', librarian_role_id, 'Sam Reynolds', 'past', FALSE, 14),
    ('2021-2022', 'Webmaster', webmaster_role_id, 'Max Fryer', 'past', FALSE, 15)
    ON CONFLICT DO NOTHING;

    -- Insert 2020-2021 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2020-2021', 'President', president_role_id, 'Sam Reynolds', 'past', FALSE, 1),
    ('2020-2021', 'Secretary', secretary_role_id, 'Ilya Carey', 'past', FALSE, 2),
    ('2020-2021', 'Treasurer', treasurer_role_id, 'Edmund Ross', 'past', FALSE, 3),
    ('2020-2021', 'Gear', gear_role_id, 'Harry Piercy', 'past', FALSE, 4),
    ('2020-2021', 'Outdoor Meet', outdoor_meet_role_id, 'Elizabeth Stephenson', 'past', FALSE, 5),
    ('2020-2021', 'Indoor Meet', indoor_meet_role_id, 'Anna Kelly', 'past', FALSE, 6),
    ('2020-2021', 'Indoor Meet', indoor_meet_role_id, 'Alex Pantelides', 'past', FALSE, 7),
    ('2020-2021', 'Alpine and Winter', alpine_winter_role_id, 'Jacob Rose', 'past', FALSE, 8),
    ('2020-2021', 'Competition', competition_role_id, 'Hugo Burgess', 'past', FALSE, 9),
    ('2020-2021', 'Social', social_role_id, 'Marcus Samuel', 'past', FALSE, 10),
    ('2020-2021', 'Social', social_role_id, 'Isma''eel Zia', 'past', FALSE, 11),
    ('2020-2021', 'Journal', journal_role_id, 'Sophie Miocevich', 'past', FALSE, 12),
    ('2020-2021', 'Webmaster', webmaster_role_id, 'Humphrey Allen', 'past', FALSE, 13)
    ON CONFLICT DO NOTHING;

    -- Insert 2019-2020 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2019-2020', 'President', president_role_id, 'Timo Zheng', 'past', FALSE, 1),
    ('2019-2020', 'Secretary', secretary_role_id, 'Robert Ryan', 'past', FALSE, 2),
    ('2019-2020', 'Treasurer', treasurer_role_id, 'Ed Mabon', 'past', FALSE, 3),
    ('2019-2020', 'Gear', gear_role_id, 'Sam Reynolds', 'past', FALSE, 4),
    ('2019-2020', 'Outdoor Meet', outdoor_meet_role_id, 'Ollie Carr', 'past', FALSE, 5),
    ('2019-2020', 'Indoor Meet', indoor_meet_role_id, 'Mikey Matthews', 'past', FALSE, 6),
    ('2019-2020', 'Indoor Meet', indoor_meet_role_id, 'Alice Kirk', 'past', FALSE, 7),
    ('2019-2020', 'Alpine and Winter', alpine_winter_role_id, 'Igor Mazur', 'past', FALSE, 8),
    ('2019-2020', 'Competition', competition_role_id, 'Ilya Carey', 'past', FALSE, 9),
    ('2019-2020', 'Social', social_role_id, 'Anna Kelly', 'past', FALSE, 10),
    ('2019-2020', 'Journal', journal_role_id, 'Sophie Miocevich', 'past', FALSE, 11),
    ('2019-2020', 'Journal', journal_role_id, 'Nina', 'past', FALSE, 12),
    ('2019-2020', 'Librarian', librarian_role_id, 'Nina', 'past', FALSE, 13),
    ('2019-2020', 'Webmaster', webmaster_role_id, 'Mikey Matthews', 'past', FALSE, 14)
    ON CONFLICT DO NOTHING;

    -- Insert 2018-2019 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2018-2019', 'President', president_role_id, 'Holly Rowland', 'past', FALSE, 1),
    ('2018-2019', 'Secretary', secretary_role_id, 'Izzy Bentley', 'past', FALSE, 2),
    ('2018-2019', 'Treasurer', treasurer_role_id, 'Sophie Miocevich', 'past', FALSE, 3),
    ('2018-2019', 'Gear', gear_role_id, 'Elin Falla', 'past', FALSE, 4),
    ('2018-2019', 'Outdoor Meet', outdoor_meet_role_id, 'Omar Shah', 'past', FALSE, 5),
    ('2018-2019', 'Outdoor Meet', outdoor_meet_role_id, 'Timo Zheng', 'past', FALSE, 6),
    ('2018-2019', 'Indoor Meet', indoor_meet_role_id, 'Alex Nicol', 'past', FALSE, 7),
    ('2018-2019', 'Indoor Meet', indoor_meet_role_id, 'Bethan Morris', 'past', FALSE, 8),
    ('2018-2019', 'Alpine and Winter', alpine_winter_role_id, 'Charlie Fraser', 'past', FALSE, 9),
    ('2018-2019', 'Competition', competition_role_id, 'Ed Mabon', 'past', FALSE, 10),
    ('2018-2019', 'Social', social_role_id, 'Joe Taylor', 'past', FALSE, 11),
    ('2018-2019', 'Social', social_role_id, 'Sophia Georgescu', 'past', FALSE, 12),
    ('2018-2019', 'Journal', journal_role_id, 'Sophie Miocevich', 'past', FALSE, 13),
    ('2018-2019', 'Librarian', librarian_role_id, 'Francesca Rigg', 'past', FALSE, 14),
    ('2018-2019', 'Webmaster', webmaster_role_id, 'Daniel Wainwright', 'past', FALSE, 15)
    ON CONFLICT DO NOTHING;

    -- Insert 2017-2018 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2017-2018', 'President', president_role_id, 'Ed Wheatcroft', 'past', FALSE, 1),
    ('2017-2018', 'Secretary', secretary_role_id, 'Jemima Churchhouse', 'past', FALSE, 2),
    ('2017-2018', 'Treasurer', treasurer_role_id, 'Gwilym Rowbottom', 'past', FALSE, 3),
    ('2017-2018', 'Gear', gear_role_id, 'Sophie Miocevich', 'past', FALSE, 4),
    ('2017-2018', 'Outdoor Meet', outdoor_meet_role_id, 'Ed Bray', 'past', FALSE, 5),
    ('2017-2018', 'Outdoor Meet', outdoor_meet_role_id, 'Robert Morse', 'past', FALSE, 6),
    ('2017-2018', 'Indoor Meet', indoor_meet_role_id, 'Holly Rowland', 'past', FALSE, 7),
    ('2017-2018', 'Indoor Meet', indoor_meet_role_id, 'Alice Kirk', 'past', FALSE, 8),
    ('2017-2018', 'Alpine and Winter', alpine_winter_role_id, 'James Kent', 'past', FALSE, 9),
    ('2017-2018', 'Competition', competition_role_id, 'Timo Zheng', 'past', FALSE, 10),
    ('2017-2018', 'Social', social_role_id, 'Isabella Bentley', 'past', FALSE, 11),
    ('2017-2018', 'Social', social_role_id, 'Joe Taylor', 'past', FALSE, 12),
    ('2017-2018', 'Journal', journal_role_id, 'Jia Yuan Loke', 'past', FALSE, 13),
    ('2017-2018', 'Journal', journal_role_id, 'Charlie Fraser', 'past', FALSE, 14),
    ('2017-2018', 'Librarian', librarian_role_id, 'Jia Yuan Loke', 'past', FALSE, 15),
    ('2017-2018', 'Librarian', librarian_role_id, 'Charlie Fraser', 'past', FALSE, 16),
    ('2017-2018', 'Webmaster', webmaster_role_id, 'James Lomax', 'past', FALSE, 17)
    ON CONFLICT DO NOTHING;

    -- Insert 2016-2017 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2016-2017', 'President', president_role_id, 'Gwilym Rowbottom', 'past', FALSE, 1),
    ('2016-2017', 'Secretary', secretary_role_id, 'Kris Cao', 'past', FALSE, 2),
    ('2016-2017', 'Treasurer', treasurer_role_id, 'Liat Adler', 'past', FALSE, 3),
    ('2016-2017', 'Gear', gear_role_id, 'George Harding-Perrott', 'past', FALSE, 4),
    ('2016-2017', 'Outdoor Meet', outdoor_meet_role_id, 'Ed Wheatcroft', 'past', FALSE, 5),
    ('2016-2017', 'Outdoor Meet', outdoor_meet_role_id, 'Alex Law', 'past', FALSE, 6),
    ('2016-2017', 'Indoor Meet', indoor_meet_role_id, 'Ed Bray', 'past', FALSE, 7),
    ('2016-2017', 'Alpine and Winter', alpine_winter_role_id, 'Cameron Holloway', 'past', FALSE, 8),
    ('2016-2017', 'Competition', competition_role_id, 'Isabella Bentley', 'past', FALSE, 9),
    ('2016-2017', 'Social', social_role_id, 'Roberto Cecere', 'past', FALSE, 10),
    ('2016-2017', 'Social', social_role_id, 'Jemima Churchhouse', 'past', FALSE, 11),
    ('2016-2017', 'Librarian', librarian_role_id, 'Gwilym Rowbottom', 'past', FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- Insert 2015-2016 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2015-2016', 'President', president_role_id, 'Philip Glass', 'past', FALSE, 1),
    ('2015-2016', 'Secretary', secretary_role_id, 'Daniel Zheng', 'past', FALSE, 2),
    ('2015-2016', 'Treasurer', treasurer_role_id, 'Matthew Wong', 'past', FALSE, 3),
    ('2015-2016', 'Gear', gear_role_id, 'Veronika Siska', 'past', FALSE, 4),
    ('2015-2016', 'Outdoor Meet', outdoor_meet_role_id, 'Ed Wheatcroft', 'past', FALSE, 5),
    ('2015-2016', 'Outdoor Meet', outdoor_meet_role_id, 'Andrew Cherenkov', 'past', FALSE, 6),
    ('2015-2016', 'Indoor Meet', indoor_meet_role_id, 'Kris Cao', 'past', FALSE, 7),
    ('2015-2016', 'Alpine and Winter', alpine_winter_role_id, 'Will Kernick', 'past', FALSE, 8),
    ('2015-2016', 'Competition', competition_role_id, 'Gwilym Rowbottom', 'past', FALSE, 9),
    ('2015-2016', 'Social', social_role_id, 'Ed Bray', 'past', FALSE, 10),
    ('2015-2016', 'Journal', journal_role_id, 'Daniel Zheng', 'past', FALSE, 11),
    ('2015-2016', 'Librarian', librarian_role_id, 'Rose Pearson', 'past', FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- Insert 2014-2015 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2014-2015', 'President', president_role_id, 'Tom Hare', 'past', FALSE, 1),
    ('2014-2015', 'Secretary', secretary_role_id, 'Laurent Michaux', 'past', FALSE, 2),
    ('2014-2015', 'Treasurer', treasurer_role_id, 'Luke Bounds', 'past', FALSE, 3),
    ('2014-2015', 'Gear', gear_role_id, 'Daniel Zheng', 'past', FALSE, 4),
    ('2014-2015', 'Outdoor Meet', outdoor_meet_role_id, 'Alexander Law', 'past', FALSE, 5),
    ('2014-2015', 'Indoor Meet', indoor_meet_role_id, 'Helen Fox', 'past', FALSE, 6),
    ('2014-2015', 'Indoor Meet', indoor_meet_role_id, 'Liam Carter', 'past', FALSE, 7),
    ('2014-2015', 'Alpine and Winter', alpine_winter_role_id, 'Rose Pearson', 'past', FALSE, 8),
    ('2014-2015', 'Competition', competition_role_id, 'Philip Glass', 'past', FALSE, 9),
    ('2014-2015', 'Social', social_role_id, 'Lucy Sawyer', 'past', FALSE, 10),
    ('2014-2015', 'Journal', journal_role_id, 'Cameron Holloway', 'past', FALSE, 11),
    ('2014-2015', 'Librarian', librarian_role_id, 'Evan Miles', 'past', FALSE, 12)
    ON CONFLICT DO NOTHING;

    -- Insert 2013-2014 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2013-2014', 'President', president_role_id, 'Liam Carter', 'past', FALSE, 1),
    ('2013-2014', 'Secretary', secretary_role_id, 'Laurence Cowton', 'past', FALSE, 2),
    ('2013-2014', 'Treasurer', treasurer_role_id, 'Luke Bounds', 'past', FALSE, 3),
    ('2013-2014', 'Gear', gear_role_id, 'Philip Glass', 'past', FALSE, 4),
    ('2013-2014', 'Outdoor Meet', outdoor_meet_role_id, 'Daniel Zheng', 'past', FALSE, 5),
    ('2013-2014', 'Outdoor Meet', outdoor_meet_role_id, 'Thomas Geh', 'past', FALSE, 6),
    ('2013-2014', 'Indoor Meet', indoor_meet_role_id, 'Daniel Zheng', 'past', FALSE, 7),
    ('2013-2014', 'Indoor Meet', indoor_meet_role_id, 'Thomas Geh', 'past', FALSE, 8),
    ('2013-2014', 'Alpine and Winter', alpine_winter_role_id, 'Tom Hare', 'past', FALSE, 9),
    ('2013-2014', 'Competition', competition_role_id, 'Amelia Fischer-Linnett', 'past', FALSE, 10),
    ('2013-2014', 'Social', social_role_id, 'Nick Jarman', 'past', FALSE, 11),
    ('2013-2014', 'Social', social_role_id, 'Laurence Orchard', 'past', FALSE, 12),
    ('2013-2014', 'Journal', journal_role_id, 'Jack Ogden', 'past', FALSE, 13),
    ('2013-2014', 'Journal', journal_role_id, 'Nick Jarman', 'past', FALSE, 14),
    ('2013-2014', 'Librarian', librarian_role_id, 'Evan Miles', 'past', FALSE, 15)
    ON CONFLICT DO NOTHING;

    -- Insert 2012-2013 data
    INSERT INTO "Committee" (year, role, role_id, person_name, status, is_current, sort_order) VALUES
    ('2012-2013', 'President', president_role_id, 'Laurence Cowton', 'past', FALSE, 1),
    ('2012-2013', 'Secretary', secretary_role_id, 'Fabian Jakubczik', 'past', FALSE, 2),
    ('2012-2013', 'Treasurer', treasurer_role_id, 'Ed Feldman', 'past', FALSE, 3),
    ('2012-2013', 'Gear', gear_role_id, 'Vincent Lister', 'past', FALSE, 4),
    ('2012-2013', 'Outdoor Meet', outdoor_meet_role_id, 'Liam Carter', 'past', FALSE, 5),
    ('2012-2013', 'Indoor Meet', indoor_meet_role_id, 'Liam Carter', 'past', FALSE, 6),
    ('2012-2013', 'Alpine and Winter', alpine_winter_role_id, 'Tom Hare', 'past', FALSE, 7),
    ('2012-2013', 'Alpine and Winter', alpine_winter_role_id, 'Ivo Dawkins', 'past', FALSE, 8),
    ('2012-2013', 'Competition', competition_role_id, 'Amelia Fischer-Linnett', 'past', FALSE, 9),
    ('2012-2013', 'Social', social_role_id, 'Jack Ogden', 'past', FALSE, 10),
    ('2012-2013', 'Journal', journal_role_id, 'Nick Jarman', 'past', FALSE, 11),
    ('2012-2013', 'Librarian', librarian_role_id, 'Dawn Hollis', 'past', FALSE, 12)
    ON CONFLICT DO NOTHING;

END $$;

-- Show summary of inserted data
SELECT
    year,
    COUNT(*) as member_count,
    status
FROM "Committee"
WHERE status = 'past'
GROUP BY year, status
ORDER BY year DESC;
