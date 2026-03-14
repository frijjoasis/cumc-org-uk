// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "Co-President",
        name: "Tessa Mullen",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president1.webp`).default,
        cover: require(`../../../../assets/img/committee/president1Cover.webp`).default,
    },
    vicePresident: {
        role: "Co-President",
        name: "Jade Westfoot",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president2.webp`).default,
        cover: require(`../../../../assets/img/committee/president2Cover.webp`).default,
    },
    treasurer: {
        role: "Treasurer",
        name: "Fin Chetham",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.webp`).default,
        cover: require(`../../../../assets/img/committee/treasurerCover.webp`).default,
    },
    secretary: {
        role: "Secretary",
        name: "Danylo Mankovsky",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.webp`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.webp`).default,
    },
    indoorMeets: [
        {
            role: "Indoor Meets Secretary",
            name: "Rosa Mueller",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.webp`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets1Cover.webp`).default,
        },
        {
            role: "Indoor Meets Secretary",
            name: "Belle Sow",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets2.webp`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets2Cover.webp`).default,
        }
    ],
    outdoorMeets: [
        {
            role: "Trad/Alpine Meets Secretary",
            name: "Ria Bacharach",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/tradAlpine1.webp`).default,
            cover: require(`../../../../assets/img/committee/tradAlpine1Cover.webp`).default,
        },
        {
            role: "Trad/Alpine Meets Secretary",
            name: "Ben Taylor",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/tradAlpine2.webp`).default,
            cover: require(`../../../../assets/img/committee/tradAlpine2Cover.webp`).default,
        },
        {
            role: "Sport/Boulder Meets Secretary",
            name: "Inigo Holman",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/sportBoulder1.webp`).default,
            cover: require(`../../../../assets/img/committee/sportBoulder1Cover.webp`).default,
        },
        {
            role: "Sport/Boulder Meets Secretary",
            name: "Oliver Marx",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/sportBoulder2.webp`).default,
            cover: require(`../../../../assets/img/committee/sportBoulder2Cover.webp`).default,
        },
    ],
    gear: {
        role: "Gear Secretary",
        name: "Inigo Holman",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.webp`).default,
        cover: require(`../../../../assets/img/committee/gearCover.webp`).default,
    },
    competitions: [
		{
			role: "Competitions Secretary",
			name: "Hermione Boyle",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions1.webp`).default,
			cover: require(`../../../../assets/img/committee/competitions1Cover.webp`).default,
		},
		{
			role: "Competitions Secretary",
			name: "Isaac Miller",
			social: "competitions@cumc.org.uk",
			profile: require(`../../../../assets/img/committee/competitions2.webp`).default,
			cover: require(`../../../../assets/img/committee/competitions2Cover.webp`).default,
		}
	],
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Seb Gentile",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials1.webp`).default,
            cover: require(`../../../../assets/img/committee/socials1Cover.webp`).default,
        },
        {
            role: "Social Secretary",
            name: "Rebecca Jesson",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials2.webp`).default,
            cover: require(`../../../../assets/img/committee/socials2Cover.webp`).default,
        },
        {
            role: "Postgrad Social Secretary",
            name: "Noah Grodzinski",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/postgradSocials.webp`).default,
            cover: require(`../../../../assets/img/committee/postgradSocialsCover.webp`).default,
        },
    ],
    webmaster: {
        role: "Webmaster",
        name: "Oliver Gaskell",
        social: "webmaster@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/webmaster.webp`).default,
        cover: require(`../../../../assets/img/committee/webmasterCover.webp`).default,
    },
    journal: {
        role: "Journals",
        name: "Alex Maltby",
        social: "journal@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/journals.webp`).default,
        cover: require(`../../../../assets/img/committee/journalsCover.webp`).default,
    },
    librarian: {
        role: "Librarian",
        name: "Nat Tompkins",
        social: "librarian@cumc.org.uk",
		profile: require(`../../../../assets/img/committee/librarian.webp`).default,
		cover: require(`../../../../assets/img/committee/librarianCover.webp`).default,
    },
    welfare: [
        {
            role: "Access & Welfare",
            name: "Izzie Iveson",
            social: "welfare@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/access1.webp`).default,
            cover: require(`../../../../assets/img/committee/access1Cover.webp`).default,
        },
        {
            role: "Access & Welfare",
            name: "Anastasia Marine",
            social: "welfare@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/access2.webp`).default,
            cover: require(`../../../../assets/img/committee/access2Cover.webp`).default,
        },
    ],
};

export {committee}
