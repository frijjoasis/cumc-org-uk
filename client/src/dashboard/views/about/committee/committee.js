// Fun fact: require cannot be used dynamically!
// More info: https://stackoverflow.com/questions/42797313/webpack-dynamic-module-loader-by-require
// (Yes, that's webpack not node, but node is even more restrictive)
// const stub = `../../../assets/img/committee/`;

const committee = {
    president: {
        role: "President",
        name: "Sam Reynolds",
        social: "president@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/president.jpg`),
        cover: require(`../../../../assets/img/committee/presidentCover.jpg`),
    },
    treasurer: {
        role: "Treasurer",
        name: "Edmund Ross",
        social: "treasurer@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.jpg`),
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`),
    },
    secretary: {
        role: "Secretary",
        name: "Ilya Carey",
        social: "secretary@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/secretary.jpg`),
        cover: require(`../../../../assets/img/committee/secretaryCover.jpg`),
    },
    indoorMeets: [
        {
            role: "Indoor Meets Secretary",
            name: "Anna Kelly",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`),
            cover: require(`../../../../assets/img/committee/notFound.png`),
        },
        {
            role: "Indoor Meets Secretary",
            name: "Alex Pantelides",
            social: "indoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/indoorMeets1.jpg`),
            cover: require(`../../../../assets/img/committee/notFound.png`),
        }
    ],
    outdoorMeets: [
        {
            role: "Outdoor Meets Secretary",
            name: "Elizabeth Stephenson",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/outdoorMeets1.jpg`),
            cover: require(`../../../../assets/img/committee/notFound.png`),
        },
        {
            role: "Outdoor Meets Secretary",
            name: "Igor Mazur",
            social: "outdoor-meets@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`),
            cover: require(`../../../../assets/img/committee/notFound.png`),
        }
    ],
    gear: {
        role: "Gear Secretary",
        name: "Harry Piercy",
        social: "gear@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/gear.jpg`),
        cover: require(`../../../../assets/img/committee/gearCover.jpg`),
    },
    winterMeets: {
        role: "Alpine and Winter Secretary",
        name: "Jacob Rose",
        social: "winter@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/notFound.png`),
        cover: require(`../../../../assets/img/committee/notFound.png`),
    },
    competitions: {
        role: "Competitions Secretary",
        name: "Hugo Burgess",
        social: "competitions@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/competitions.jpg`),
        cover: require(`../../../../assets/img/committee/competitionsCover.jpg`),
    },
    socialMeets: [
        {
            role: "Social Secretary",
            name: "Marcus Samuel",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`),
            cover: require(`../../../../assets/img/committee/notFound.png`),
        },
        {
            role: "Social Secretary",
            name: "Isma'eel Zia",
            social: "socials@cumc.org.uk",
            profile: require(`../../../../assets/img/committee/notFound.png`),
            cover: require(`../../../../assets/img/committee/notFound.png`),
        }
    ],
    webmaster: {
        role: "Webmaster",
        name: "Edmund Ross",
        social: "webmaster@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/treasurer.jpg`),
        cover: require(`../../../../assets/img/committee/treasurerCover.jpg`),
    },
    journal: {
        role: "Journal Editor",
        name: "Sophie Miocevich",
        social: "journal@cumc.org.uk",
        profile: require(`../../../../assets/img/committee/notFound.png`),
        cover: require(`../../../../assets/img/committee/notFound.png`),
    }
};

export {committee}