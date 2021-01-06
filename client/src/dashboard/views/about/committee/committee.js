// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "President",
        name: "Sam Reynolds",
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
            name: "Anna Kelly",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets2.png`).default,
            cover: require(`../../../../assets/img/committee/indoorMeets2Cover.jpg`).default,
        },
        {
            role: "Indoor Meets Secretary",
            name: "Alex Pantelides",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/notFound.png`).default,
        }
    ],
    outdoorMeets: [
        {
            role: "Outdoor Meets Secretary",
            name: "Elizabeth Stephenson",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/outdoorMeets1.jpg`).default,
            cover: require(`../../../../assets/img/committee/outdoorMeets1Cover.jpg`).default,
        }
    ],
    gear: {
        role: "Gear Secretary",
        name: "Harry Piercy",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.jpg`).default,
        cover: require(`../../../../assets/img/committee/gearCover.jpg`).default,
    },
    winterMeets: {
        role: "Alpine and Winter Secretary",
        name: "Jacob Rose",
        social: "winter@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/notFound.png`).default,
        cover: require(`../../../../assets/img/committee/notFound.png`).default,
    },
    competitions: {
        role: "Competitions Secretary",
        name: "Hugo Burgess",
        social: "competitions@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/competitions.jpg`).default,
        cover: require(`../../../../assets/img/committee/competitionsCover.jpg`).default,
    },
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Marcus Samuel",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/socials1.jpg`).default,
            cover: require(`../../../../assets/img/committee/socials1Cover.jpg`).default,
        },
        {
            role: "Social Secretary",
            name: "Isma'eel Zia",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`).default,
            cover: require(`../../../../assets/img/committee/notFound.png`).default,
        }
    ],
    webmaster: {
        role: "Webmaster",
        name: "Edmund Ross",
        social: "webmaster@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.jpg`).default,
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`).default,
    },
    journal: {
        role: "Journal Editor",
        name: "Sophie Miocevich",
        social: "journal@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/notFound.png`).default,
        cover: require(`../../../../assets/img/committee/notFound.png`).default,
    }
};

export {committee}