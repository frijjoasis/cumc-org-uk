// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "Co-President",
        name: "Noah Grodzinski",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president1.jpg`).default,
        cover: require(`../../../../assets/img/committee/president1Cover.jpg`).default,
    },
    vicePresident: {
        role: "Co-President",
        name: "Eren Ozturk",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president2.jpg`).default,
        cover: require(`../../../../assets/img/committee/president2Cover.jpg`).default,
    },
    treasurer: {
        role: "Treasurer",
        name: "Jake Thakur",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/webmaster.jpg`).default,
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`).default,
    },
    secretary: {
        role: "Secretary",
        name: "Alice Ward",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`).default,
    },
    indoorMeets: [
        {
            role: "Indoor Meets Secretary",
            name: "Seb Gentile",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets1Cover.jpg`).default,
        },
        {
            role: "Indoor Meets Secretary",
            name: "Fin Chetham",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets2.jpg`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets2Cover.jpg`).default,
        }
    ],
    outdoorMeets: [
        {
            role: "Outdoor Meets Secretary",
            name: "Tom de Csilléry",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/outdoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/outdoorMeets1Cover.jpg`).default,
        },
    ],
    gear: {
        role: "Gear Secretary",
        name: "Leo Ellis",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.jpg`).default,
        cover: require(`../../../../assets/img/committee/gearCover.jpg`).default,
    },
    winterMeets: {
        role: "Alpine and Winter Secretary",
        name: "Lev Davies",
        social: "winter@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`).default,
    },
    competitions: [
		{
			role: "Competitions Secretary",
			name: "Jade Westfoot",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions1.jpg`).default,
			cover: require(`../../../../assets/img/committee/competitions1Cover.jpg`).default,
		},
		{
			role: "Competitions Secretary",
			name: "Inigo Holman",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions2.jpg`).default,
			cover: require(`../../../../assets/img/committee/competitions2Cover.jpg`).default,
		}
	],
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Tessa Mullen",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials1.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials1Cover.jpg`).default,
        },
        {
            role: "Social Secretary",
            name: "Josh Davies",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials2.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials2Cover.jpg`).default,
        }
    ],
    webmaster: {
        role: "Webmaster",
        name: "Jake Thakur",
        social: "webmaster@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/webmaster.jpg`).default,
        cover: require(`../../../../assets/img/committee/webmasterCover.jpg`).default,
    },
    journal: {
        role: "Journals",
        name: "Eren Ozturk",
        social: "journal@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president2.jpg`).default,
        cover: require(`../../../../assets/img/committee/president2Cover.jpg`).default,
    },
    librarian: {
        role: "Librarian",
        name: "Tessa Mullen",
        social: "librarian@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/socials1.jpg`).default,
		cover: require(`../../../../assets/img/committee/socials1Cover.jpg`).default,
    },
    welfare: {
        role: "Access & Welfare",
        name: "Keying Guao",
        social: "welfare@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/access.jpg`).default,
		cover: require(`../../../../assets/img/committee/accessCover.jpg`).default,
    }
};

export {committee}