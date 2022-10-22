// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "President",
        name: "Elizabeth Stephenson",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president.jpg`).default,
        cover: require(`../../../../assets/img/committee/presidentCover.jpg`).default,
    },
    treasurer: {
        role: "Treasurer",
        name: "Holly Davis",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.jpg`).default,
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`).default,
    },
    secretary: {
        role: "Secretary",
        name: "Eren Ozturk",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`).default,
    },
    indoorMeets: [
        {
            role: "Indoor Meets Secretary",
            name: "Gabe Gentile",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets1Cover.jpg`).default,
        },
        {
            role: "Indoor Meets Secretary",
            name: "Leo Petchey",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets2.jpg`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets2Cover.jpg`).default,
        }
    ],
    outdoorMeets: [
        {
            role: "Outdoor Meets Secretary",
            name: "Eve Seymour",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/outdoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/outdoorMeets1Cover.jpg`).default,
        },
        {
            role: "Outdoor Meets Secretary",
            name: "Joe McDermott",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/outdoorMeets2.jpg`).default,
            cover: require(`../../../../assets/img/committee/outdoorMeets2Cover.jpg`).default,
        }
    ],
    gear: {
        role: "Gear Secretary",
        name: "Ari Chan",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.jpg`).default,
        cover: require(`../../../../assets/img/committee/gearCover.jpg`).default,
    },
    winterMeets: {
        role: "Alpine and Winter Secretary",
        name: "Eren Ozturk",
        social: "winter@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`).default,
    },
    competitions: [
		{
			role: "Competitions Secretary",
			name: "Hannah Zia",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions1.jpg`).default,
			cover: require(`../../../../assets/img/committee/competitions1Cover.jpg`).default,
		},
		{
			role: "Competitions Secretary",
			name: "Matthew Fall",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions2.jpg`).default,
			cover: require(`../../../../assets/img/committee/competitions2Cover.jpg`).default,
		}
	],
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Tilly Corcoran",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials1.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials1Cover.jpg`).default,
        },
        {
            role: "Social Secretary",
            name: "Noah Grodzinski",
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
        name: "Lily Olliver",
        social: "journal@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/journals.jpg`).default,
		cover: require(`../../../../assets/img/committee/journalsCover.jpg`).default,
    },
    librarian: {
        role: "Librarian",
        name: "Lauren Charnley-Parr",
        social: "librarian@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/librarian.jpg`).default,
		cover: require(`../../../../assets/img/committee/librarianCover.jpg`).default,
    },
    welfare: {
        role: "Access & Welfare",
        name: "Caitlin van Bommel",
        social: "welfare@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/access.jpg`).default,
		cover: require(`../../../../assets/img/committee/accessCover.jpg`).default,
    }
};

export {committee}