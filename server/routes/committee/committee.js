const router = require('express').Router();
const members = require('../../database/controllers/members');
const {committeeAuth} = require('../middleware');
const {sequelize} = require('../../database/database');


const oldCommittee = {
    head : ["Year","President","Secretary","Treasurer","Gear","Outdoor Meet","Indoor Meet","Alpine and Winter", "Competition","Social","Journal","Librarian","Webmaster","Welfare"],
    body : [
        ["2024-2025", "Jade Westfoot & Tessa Mullen", "Danylo Mankovsky", "Fin Chetham", "Inigo Holman", "Hermione Boyle & Isaac Miller", "Seb Gentile & Rebecca Jesson", "Alex Maltby", "Nat Tompkins", "Oliver Gaskell", "Anastasia Marine & Izzie Iveson"],
        ["2023-2024", "Noah Grodzinski & Eren Ozturk", "Alice Ward", "Jake Thakur", "Leo Ellis", "Tom de Csilléry", "Seb Gentile & Fin Chetham", "Lev Davies", "Jade Westfoot & Inigo Holman", "Tessa Mullen & Josh Davies", "Eren Ozturk", "Tessa Mullen", "Jake Thakur", "Keying Guao"],
        ["2022-2023", "Elizabeth Stephenson", "Eren Ozturk", "Holly Davis", "Ari Chan", "Eve Seymour & Joe McDermott", "Gabe Gentile & Leo Petchey", "Eren Ozturk", "Hannah Zia & Matthew Fall", "Tilly Corcoran & Noah Grodzinski", "Lily Olliver", "Lauren Charnley-Parr", "Jake Thakur", "Caitlin van Bommel"],
        ["2021-2022", "Bethan Davies-Williams", "Ilya Carey", "Edmund Ross", "Sidney Leedham", "Elizabeth Stephenson & Tom de Csilléry", "Humphrey Allen & Philip Sosnin", "Elizabeth Stephenson", "Matthew Fall", "Holly Davis & Arianna Chan", "Sam Reynolds", "Sam Reynolds", "Max Fryer", ""],
        ["2020-2021", "Sam Reynolds", "Ilya Carey", "Edmund Ross", "Harry Piercy", "Elizabeth Stephenson", "Anna Kelly & Alex Pantelides", "Jacob Rose", "Hugo Burgess", "Marcus Samuel & Isma'eel Zia", "Sophie Miocevich", "", "Humphrey Allen", ""],
        ["2019-2020","Timo Zheng","Robert Ryan","Ed Mabon","Sam Reynolds","Ollie Carr","Mikey Matthews & Alice Kirk","Igor Mazur","Ilya Carey","Anna Kelly","Sophie Miocevich & Nina","Nina","Mikey Matthews", ""],
        ["2018-2019","Holly Rowland","Izzy Bentley","Sophie Miocevich","Elin Falla","Omar Shah & Timo Zheng","Alex Nicol & Bethan Morris","Charlie Fraser","Ed Mabon","Joe Taylor & Sophia Georgescu","Sophie Miocevich","Francesca Rigg","Daniel Wainwright", ""],
        ["2017-2018","Ed Wheatcroft","Jemima Churchhouse","Gwilym Rowbottom","Sophie Miocevich","Ed Bray & Robert Morse","Holly Rowland & Alice Kirk","James Kent","Timo Zheng","Isabella Bentley & Joe Taylor","Jia Yuan Loke & Charlie Fraser","Jia Yuan Loke & Charlie Fraser","James Lomax", ""],
        ["2016-2017","Gwilym Rowbottom","Kris Cao","Liat Adler","George Harding-Perrott","Ed Wheatcroft & Alex Law","Ed Bray","Cameron Holloway","Isabella Bentley","Roberto Cecere & Jemima Churchhouse","none","Gwilym Rowbottom","", ""],
        ["2015-2016","Philip Glass","Daniel Zheng","Matthew Wong","Veronika Siska","Ed Wheatcroft & Andrew Cherenkov","Kris Cao","Will Kernick","Gwilym Rowbottom","Ed Bray","Daniel Zheng","Rose Pearson","", ""],
        ["2014-2015","Tom Hare","Laurent Michaux","Luke Bounds","Daniel Zheng","Alexander Law","Helen Fox & Liam Carter","Rose Pearson","Philip Glass","Lucy Sawyer","Cameron Holloway","Evan Miles","", ""],
        ["2013-2014","Liam Carter","Laurence Cowton","Luke Bounds","Philip Glass","Daniel Zheng and Thomas Geh","Daniel Zheng and Thomas Geh","Tom Hare","Amelia Fischer-Linnett","Nick Jarman and Laurence Orchard","Jack Ogden and Nick Jarman","Evan Miles","", ""],
        ["2012-2013","Laurence Cowton","Fabian Jakubczik","Ed Feldman","Vincent Lister","Liam Carter","Liam Carter","Tom Hare (Alpine) & Ivo Dawkins (Winter)","Amelia Fischer-Linnett","Jack Ogden","Nick Jarman","Dawn Hollis","", ""]
    ] // TODO: Maybe don't hardcode this?
}

// Get current committee with role information
router.get('/current', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT c.*, r.role_name, r.role_slug, r.email_alias, r.description as role_description
            FROM "Committee" c
            LEFT JOIN "CommitteeRoles" r ON c.role_id = r.id
            WHERE c.status = 'current' OR c.is_current = TRUE 
            ORDER BY COALESCE(r.sort_order, c.sort_order) ASC, c.sort_order ASC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching current committee:', error);
        res.status(500).json({ error: 'Failed to fetch current committee' });
    }
});

// Get staged committee (next year's committee being prepared)
router.get('/staged', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT c.*, r.role_name, r.role_slug, r.email_alias, r.description as role_description
            FROM "Committee" c
            LEFT JOIN "CommitteeRoles" r ON c.role_id = r.id
            WHERE c.status = 'staged'
            ORDER BY COALESCE(r.sort_order, c.sort_order) ASC, c.sort_order ASC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching staged committee:', error);
        res.status(500).json({ error: 'Failed to fetch staged committee' });
    }
});

// Get committee status overview
router.get('/status', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT * FROM committee_status_summary
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching committee status:', error);
        res.status(500).json({ error: 'Failed to fetch committee status' });
    }
});

// Get past committees (return legacy format for compatibility)
router.get('/past', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT c.year, c.role, c.person_name, r.role_name
            FROM "Committee" c
            LEFT JOIN "CommitteeRoles" r ON c.role_id = r.id
            WHERE c.status = 'past' OR (c.is_current = FALSE AND c.status IS NULL)
            ORDER BY c.year DESC, COALESCE(r.sort_order, c.sort_order) ASC
        `);
        
        // If no database results, return legacy data
        if (results.length === 0) {
            return res.json({
                head: oldCommittee.head,
                body: oldCommittee.body
            });
        }
        
        // Convert to legacy table format for frontend compatibility
        const yearMap = new Map();
        
        results.forEach(row => {
            if (!yearMap.has(row.year)) {
                yearMap.set(row.year, {});
            }
            const yearData = yearMap.get(row.year);
            const roleName = row.role_name || row.role;
            
            if (!yearData[roleName]) {
                yearData[roleName] = [];
            }
            yearData[roleName].push(row.person_name);
        });
        
        // Convert to legacy format: array of arrays
        const head = ["Year", "President", "Secretary", "Treasurer", "Gear", "Outdoor Meet", "Indoor Meet", "Alpine and Winter", "Competition", "Social", "Journal", "Librarian", "Webmaster", "Welfare"];
        const body = [];
        
        for (const [year, roles] of yearMap.entries()) {
            const row = [year];
            
            // Map each role column
            for (let i = 1; i < head.length; i++) {
                const roleName = head[i];
                const members = roles[roleName] || roles[getAlternativeRoleNames(roleName)] || [];
                row.push(members.join(' & ') || '');
            }
            
            body.push(row);
        }
        
        res.json({
            head: head,
            body: body
        });
    } catch (error) {
        console.error('Error fetching past committees:', error);
        // Fallback to legacy data
        res.json({
            head: oldCommittee.head,
            body: oldCommittee.body
        });
    }
});

// Helper function to map alternative role names
function getAlternativeRoleNames(roleName) {
    const alternativeNames = {
        'President': ['Co-President'],
        'Outdoor Meet': ['Trad/Alpine Meets Secretary', 'Sport/Boulder Meets Secretary'],
        'Indoor Meet': ['Indoor Meets Secretary'],
        'Alpine and Winter': ['Trad/Alpine Meets Secretary'],
        'Competition': ['Competitions Secretary'],
        'Social': ['Social Secretary', 'Postgrad Social Secretary'],
        'Journal': ['Journal Editor'],
        'Webmaster': ['Webmaster'],
        'Welfare': ['Access & Welfare Officer']
    };
    
    return alternativeNames[roleName] || [];
}

// Add new committee member
router.post('/members', committeeAuth, async function(req, res) {
    try {
        const { year, role, role_id, person_name, person_email, sort_order, is_current, status, staging_year } = req.body;
        
        // Set default status and handle backward compatibility
        let memberStatus = status || (is_current !== false ? 'current' : 'past');
        
        const [results] = await sequelize.query(`
            INSERT INTO "Committee" (year, role, role_id, person_name, person_email, sort_order, is_current, status, staging_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `, {
            replacements: [
                year, 
                role, 
                role_id || null, 
                person_name, 
                person_email || null, 
                sort_order || 0, 
                is_current !== false, 
                memberStatus,
                staging_year || null
            ]
        });
        
        res.json(results[0]);
    } catch (error) {
        console.error('Error adding committee member:', error);
        res.status(500).json({ error: 'Failed to add committee member' });
    }
});

// Update committee member
router.put('/members/:id', committeeAuth, async function(req, res) {
    try {
        const { id } = req.params;
        const { year, role, role_id, person_name, person_email, sort_order, is_current, status, staging_year } = req.body;
        
        const [results] = await sequelize.query(`
            UPDATE "Committee" 
            SET year = ?, role = ?, role_id = ?, person_name = ?, person_email = ?, sort_order = ?, is_current = ?, status = ?, staging_year = ?
            WHERE id = ?
            RETURNING *
        `, {
            replacements: [year, role, role_id || null, person_name, person_email, sort_order, is_current, status, staging_year, id]
        });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Committee member not found' });
        }
        
        res.json(results[0]);
    } catch (error) {
        console.error('Error updating committee member:', error);
        res.status(500).json({ error: 'Failed to update committee member' });
    }
});

// Delete committee member
router.delete('/members/:id', committeeAuth, async function(req, res) {
    try {
        const { id } = req.params;
        
        const [results] = await sequelize.query(`
            DELETE FROM "Committee" WHERE id = ? RETURNING *
        `, {
            replacements: [id]
        });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Committee member not found' });
        }
        
        res.json({ message: 'Committee member deleted successfully' });
    } catch (error) {
        console.error('Error deleting committee member:', error);
        res.status(500).json({ error: 'Failed to delete committee member' });
    }
});

// Archive current committee and promote staged committee
router.post('/transition-year', committeeAuth, async function(req, res) {
    try {
        // Start transaction
        await sequelize.query('BEGIN');
        
        // Check if there's a staged committee
        const [stagedCommittee] = await sequelize.query(`
            SELECT COUNT(*) as count FROM "Committee" WHERE status = 'staged'
        `);
        
        if (stagedCommittee[0].count === 0) {
            await sequelize.query('ROLLBACK');
            return res.status(400).json({ 
                error: 'No staged committee found. Please prepare the next committee before transitioning.' 
            });
        }
        
        // Archive current committee
        await sequelize.query(`
            UPDATE "Committee" 
            SET status = 'past', is_current = FALSE 
            WHERE status = 'current' OR is_current = TRUE
        `);
        
        // Promote staged committee to current
        await sequelize.query(`
            UPDATE "Committee" 
            SET status = 'current', is_current = TRUE 
            WHERE status = 'staged'
        `);
        
        await sequelize.query('COMMIT');
        
        res.json({ 
            success: true, 
            message: 'Committee year transitioned successfully. Staged committee is now current.' 
        });
    } catch (error) {
        await sequelize.query('ROLLBACK');
        console.error('Error transitioning committee year:', error);
        res.status(500).json({ error: 'Failed to transition committee year' });
    }
});

// Start staging next committee year
router.post('/start-staging', committeeAuth, async function(req, res) {
    try {
        const { year } = req.body;
        
        if (!year) {
            return res.status(400).json({ error: 'Year is required for staging' });
        }
        
        // Check if staging already in progress
        const [existingStaged] = await sequelize.query(`
            SELECT COUNT(*) as count FROM "Committee" WHERE status = 'staged'
        `);
        
        if (existingStaged[0].count > 0) {
            return res.status(400).json({ 
                error: 'Committee staging already in progress. Clear staged committee first.' 
            });
        }
        
        res.json({ 
            success: true, 
            message: `Ready to stage committee for ${year}. Add members with status 'staged'.`,
            staging_year: year
        });
    } catch (error) {
        console.error('Error starting committee staging:', error);
        res.status(500).json({ error: 'Failed to start committee staging' });
    }
});

// Clear staged committee (if you want to start over)
router.post('/clear-staged', committeeAuth, async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            DELETE FROM "Committee" WHERE status = 'staged' RETURNING *
        `);
        
        res.json({ 
            success: true, 
            message: `Cleared ${results.length} staged committee members.`,
            cleared_count: results.length
        });
    } catch (error) {
        console.error('Error clearing staged committee:', error);
        res.status(500).json({ error: 'Failed to clear staged committee' });
    }
});

// === COMMITTEE ROLES MANAGEMENT ===

// Get all committee roles
router.get('/roles', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT * FROM "CommitteeRoles" 
            ORDER BY sort_order ASC, role_name ASC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching committee roles:', error);
        res.status(500).json({ error: 'Failed to fetch committee roles' });
    }
});

// Get only active committee roles
router.get('/roles/active', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT * FROM "CommitteeRoles" 
            WHERE is_active = TRUE 
            ORDER BY sort_order ASC, role_name ASC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching active committee roles:', error);
        res.status(500).json({ error: 'Failed to fetch active committee roles' });
    }
});

// Get roles with current member counts
router.get('/roles/status', async function(req, res) {
    try {
        const [results] = await sequelize.query(`
            SELECT 
                r.*,
                COUNT(c.id) as current_members,
                (COUNT(c.id) >= r.max_positions) as is_full,
                (r.is_required AND COUNT(c.id) = 0) as needs_filling
            FROM "CommitteeRoles" r
            LEFT JOIN "Committee" c ON r.id = c.role_id AND c.is_current = TRUE
            WHERE r.is_active = TRUE
            GROUP BY r.id
            ORDER BY r.sort_order ASC, r.role_name ASC
        `);
        res.json(results);
    } catch (error) {
        console.error('Error fetching committee roles status:', error);
        res.status(500).json({ error: 'Failed to fetch committee roles status' });
    }
});

// Create new committee role
router.post('/roles', committeeAuth, async function(req, res) {
    try {
        const { 
            role_name, 
            role_slug, 
            description, 
            email_alias, 
            is_required, 
            max_positions, 
            sort_order, 
            is_active 
        } = req.body;
        
        const [results] = await sequelize.query(`
            INSERT INTO "CommitteeRoles" 
            (role_name, role_slug, description, email_alias, is_required, max_positions, sort_order, is_active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `, {
            replacements: [
                role_name, 
                role_slug, 
                description || null, 
                email_alias || null, 
                is_required || false, 
                max_positions || 1, 
                sort_order || 0, 
                is_active !== false
            ]
        });
        
        res.json(results[0]);
    } catch (error) {
        console.error('Error creating committee role:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'Role name or slug already exists' });
        } else {
            res.status(500).json({ error: 'Failed to create committee role' });
        }
    }
});

// Update committee role
router.put('/roles/:id', committeeAuth, async function(req, res) {
    try {
        const { id } = req.params;
        const { 
            role_name, 
            role_slug, 
            description, 
            email_alias, 
            is_required, 
            max_positions, 
            sort_order, 
            is_active 
        } = req.body;
        
        const [results] = await sequelize.query(`
            UPDATE "CommitteeRoles" 
            SET 
                role_name = ?, 
                role_slug = ?, 
                description = ?, 
                email_alias = ?, 
                is_required = ?, 
                max_positions = ?, 
                sort_order = ?, 
                is_active = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            RETURNING *
        `, {
            replacements: [
                role_name, 
                role_slug, 
                description, 
                email_alias, 
                is_required, 
                max_positions, 
                sort_order, 
                is_active, 
                id
            ]
        });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Committee role not found' });
        }
        
        res.json(results[0]);
    } catch (error) {
        console.error('Error updating committee role:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            res.status(400).json({ error: 'Role name or slug already exists' });
        } else {
            res.status(500).json({ error: 'Failed to update committee role' });
        }
    }
});

// Deactivate committee role (soft delete)
router.delete('/roles/:id', committeeAuth, async function(req, res) {
    try {
        const { id } = req.params;
        
        // Check if role is currently in use
        const [usageCheck] = await sequelize.query(`
            SELECT COUNT(*) as member_count FROM "Committee" 
            WHERE role_id = ? AND is_current = TRUE
        `, {
            replacements: [id]
        });
        
        if (usageCheck[0].member_count > 0) {
            return res.status(400).json({ 
                error: 'Cannot delete role that is currently assigned to committee members' 
            });
        }
        
        const [results] = await sequelize.query(`
            UPDATE "CommitteeRoles" 
            SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP
            WHERE id = ?
            RETURNING *
        `, {
            replacements: [id]
        });
        
        if (results.length === 0) {
            return res.status(404).json({ error: 'Committee role not found' });
        }
        
        res.json({ message: 'Committee role deactivated successfully' });
    } catch (error) {
        console.error('Error deleting committee role:', error);
        res.status(500).json({ error: 'Failed to delete committee role' });
    }
});

module.exports = router;
