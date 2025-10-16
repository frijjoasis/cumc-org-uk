const defaults = {
    car: [
        {title: "Do you have a car you can use for this meet?", id: '101', required: true},
        {title: "Can you hire a car if necessary?", id: '102', required: false},
        {title: "If so, how many passengers can you take?", id: '103', required: false},
    ],
    indoor: [
        {title: "Do you need to be taught to tie in and lead belay?", id: '1', required: true},
        {title: "If you do need to be taught, please tell us what you already know", id: '2', required: false},
        {title: "Do you have a harness/shoes/belay device?", id: '3', required: true, text: "You may be able to hire at the wall, or you can borrow from the club"},
        {title: "Do you have a rope?", id: '4', required: true}
    ],
    outdoor: [
        {title: "Can you tie in and LEAD belay?", id: '1', required: true, text: "If you don't know what it is, the answer is probably no."},
        {title: "If you can lead trad, what grade?", id: '2', required: true},
        {title: "Do you have a rack? (Give details if incomplete)", id: '3', required: true},
        {title: "Do you have a rope?", id: '4', required: true},
        {title: "Do you have a guidebook?", id: '5', required: true},
        {title: "Do you have a First Aid kit?", id: '6', required: true},
        {title: "Do you prefer Saturday or Sunday?", id: '7', required: true, text: "Answer 'Sat,' 'Sun,' or 'Either'"},
    ],
    social: [

    ],
    // Question IDs are used for ordering. Remember: In JavaScript, 11 > 9 true; '11' > '9' false.
}

export default defaults;