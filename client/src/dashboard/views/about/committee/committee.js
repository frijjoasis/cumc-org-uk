// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "Co-President",
        name: "Tessa Mullen",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president1.jpg`).default,
        cover: require(`../../../../assets/img/committee/president1Cover.jpg`).default,
    },
    vicePresident: {
        role: "Co-President",
        name: "Jade Westfoot",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president2.jpg`).default,
        cover: require(`../../../../assets/img/committee/president2Cover.jpg`).default,
    },
    treasurer: {
        role: "Treasurer",
        name: "Fin Chetham",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.jpg`).default,
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`).default,
    },
    secretary: {
        role: "Secretary",
        name: "Danylo Mankovsky",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`).default,
    },
    indoorMeets: [
        {
            role: "Indoor Meets Secretary",
            name: "Rosa Mueller",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets1Cover.jpg`).default,
        },
        {
            role: "Indoor Meets Secretary",
            name: "Belle Sow",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets2.jpg`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets2Cover.jpg`).default,
        }
    ],
    outdoorMeets: [
        {
            role: "Trad/Alpine Meets Secretary",
            name: "Ria Bacharach",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/tradAlpine1.jpg`).default,
            cover: require(`../../../../assets/img/committee/tradAlpine1Cover.jpg`).default,
        },
        {
            role: "Trad/Alpine Meets Secretary",
            name: "Ben Taylor",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/tradAlpine2.jpg`).default,
            cover: require(`../../../../assets/img/committee/tradAlpine2Cover.jpg`).default,
        },
        {
            role: "Sport/Boulder Meets Secretary",
            name: "Inigo Holman",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/sportBoulder1.jpg`).default,
            cover: require(`../../../../assets/img/committee/sportBoulder1Cover.jpg`).default,
        },
        {
            role: "Sport/Boulder Meets Secretary",
            name: "Oliver Marx",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/sportBoulder2.jpg`).default,
            cover: require(`../../../../assets/img/committee/sportBoulder2Cover.jpg`).default,
        },
    ],
    gear: {
        role: "Gear Secretary",
        name: "Inigo Holman",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.jpg`).default,
        cover: require(`../../../../assets/img/committee/gearCover.jpg`).default,
    },
    competitions: [
		{
			role: "Competitions Secretary",
			name: "Hermione Boyle",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions1.jpg`).default,
			cover: require(`../../../../assets/img/committee/competitions1Cover.jpg`).default,
		},
		{
			role: "Competitions Secretary",
			name: "Isaac Miller",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions2.jpg`).default,
			cover: require(`../../../../assets/img/committee/competitions2Cover.jpg`).default,
		}
	],
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Seb Gentile",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials1.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials1Cover.jpg`).default,
        },
        {
            role: "Social Secretary",
            name: "Rebecca Jesson",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials2.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials2Cover.jpg`).default,
        },
        {
            role: "Postgrad Social Secretary",
            name: "Noah Grodzinski",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/postgradSocials.jpg`).default,
            cover: require(`../../../../assets/img/committee/postgradSocialsCover.jpg`).default,
        },
    ],
    webmaster: {
        role: "Webmaster",
        name: "Oliver Gaskell",
        social: "webmaster@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/webmaster.jpg`).default,
        cover: require(`../../../../assets/img/committee/webmasterCover.jpg`).default,
    },
    journal: {
        role: "Journals",
        name: "Alex Maltby",
        social: "journal@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/journals.jpg`).default,
        cover: require(`../../../../assets/img/committee/journalsCover.jpg`).default,
    },
    librarian: {
        role: "Librarian",
        name: "Nat Tompkins",
        social: "librarian@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/librarian.jpg`).default,
		cover: require(`../../../../assets/img/committee/librarianCover.jpg`).default,
    },
    welfare: [
        {
            role: "Access & Welfare",
            name: "Isobelle Oppon",
            social: "welfare@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/access1.jpg`).default,
            cover: require(`../../../../assets/img/committee/access1Cover.jpg`).default,
        },
        {
            role: "Access & Welfare",
            name: "Anastasia Marine",
            social: "welfare@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/access2.jpg`).default,
            cover: require(`../../../../assets/img/committee/access2Cover.jpg`).default,
        },
    ],
};

export {committee}
