// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "President",
        name: "Bethan Davies-Williams",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president.jpg`).default,
        cover: require(`../../../../assets/img/committee/presidentCover.jpg`).default,
    },
    treasurer: {
        role: "Treasurer",
        name: "Edmund Ross",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.jpg`).default,
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`).default,
    },
    secretary: {
        role: "Secretary",
        name: "Ilya Carey",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`).default,
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`).default,
    },
    indoorMeets: [
        {
            role: "Indoor Meets Secretary",
            name: "Humphrey Allen",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`).default,
            cover: require(`../../../../assets/img/committee/background.jpg`).default,
        },
        {
            role: "Indoor Meets Secretary",
            name: "Philip Sosnin",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/background.jpg`).default,
        }
    ],
    outdoorMeets: [
        {
            role: "Outdoor Meets Secretary",
            name: "Elizabeth Stephenson",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/outdoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/outdoorMeets1Cover.jpg`).default,
        },
        {
            role: "Outdoor Meets Secretary",
            name: "Tom de Csilléry",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`).default,
            cover: require(`../../../../assets/img/committee/background.jpg`).default,
        }
    ],
    gear: {
        role: "Gear Secretary",
        name: "Sidney Leedham",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.jpg`).default,
        cover: require(`../../../../assets/img/committee/gearCover.jpg`).default,
    },
    winterMeets: {
        role: "Alpine and Winter Secretary",
        name: "Elizabeth Stephenson",
        social: "winter@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/outdoorMeets1.jpg`).default,
        cover: require(`../../../../assets/img/committee/outdoorMeets1Cover.jpg`).default,
    },
    competitions: {
        role: "Competitions Secretary",
        name: "Matthew Fall",
        social: "competitions@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/competitions.jpg`).default,
        cover: require(`../../../../assets/img/committee/background.jpg`).default,
    },
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Holly Davis",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials1.png`).default,
            cover: require(`../../../../assets/img/committee/socials1Cover.jpg`).default,
        },
        {
            role: "Social Secretary",
            name: "Arianna Chan",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials2.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials2Cover.jpg`).default,
        }
    ],
    webmaster: {
        role: "Webmaster",
        name: "Max Fryer",
        social: "webmaster@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/notFound.png`).default,
        cover: require(`../../../../assets/img/committee/background.jpg`).default,
    },
    journal: {
        role: "Journals & Librarian",
        name: "Sam Reynolds",
        social: "journal@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/journals.jpg`).default,
        cover: require(`../../../../assets/img/committee/journalsCover.jpg`).default,
    },
    diversity: {
        role: "Diversity Officer",
        name: "Isma'eel Zia",
        social: "diversity@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/notFound.png`).default,
        cover: require(`../../../../assets/img/committee/background.jpg`).default,
    }
};

export {committee}