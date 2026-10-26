const defaults = {
    car: [
        {title: "Do you have a car you can use for this meet?", required: true},
        {title: "Can you hire a car if necessary?", required: false},
        {title: "If so, how many passengers can you take?", required: false},
    ],
    indoor: [
        {title: "Do you need to be taught to tie in and lead belay?", required: true},
        {title: "If you do need to be taught, please tell us what you already know", required: false},
        {title: "Do you have a harness/shoes/belay device?", required: true, text: "You may be able to hire at the wall, or you can borrow from the club"},
        {title: "Do you have a rope?", required: true}
    ],
    outdoor: [
        {title: "Can you tie in and LEAD belay?", required: true, text: "If you don't know what it is, the answer is probably no."},
        {title: "If you can lead trad, what grade?", required: true},
        {title: "Do you have a rack? (Give details if incomplete)", required: true},
        {title: "Do you have a rope?", required: true},
        {title: "Do you have a guidebook?", required: true},
        {title: "Do you have a First Aid kit?", required: true},
        {title: "Do you prefer Saturday or Sunday?", required: true, text: "Answer 'Sat,' 'Sun,' or 'Either'"},
    ],
    social: [

    ],
    // IDs are assigned when a template is applied (see EditQuestions).
}

export default defaults;