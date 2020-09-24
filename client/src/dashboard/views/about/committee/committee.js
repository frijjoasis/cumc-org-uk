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
};

export {committee}