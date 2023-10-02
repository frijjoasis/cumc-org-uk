const router = require('express').Router();
const members = require('../../database/controllers/members');
const {committeeAuth} = require('../middleware');

const oldCommittee = {
    head : ["Year","President","Secretary","Treasurer","Gear","Outdoor Meet","Indoor Meet","Alpine and Winter","Competition","Social","Journal","Librarian","Webmaster","Welfare"],
    body : [
        ["2022-2023", "Elizabeth Stephenson", "Eren Ozturk", "Holly Davis", "Ari Chan", "Eve Seymour & Joe McDermott", "Gabe Gentile & Leo Petchey", "Eren Ozturk", "Hannah Zia & Matthew Fall", "Tilly Corcoran & Noah Grodzinski", "Lily Olliver", "Lauren Charnley-Parr", "Jake Thakur", "Caitlin van Bommel"],
        ["2021-2022", "Bethan Davies-Williams", "Ilya Carey", "Edmund Ross", "Sidney Leedham", "Elizabeth Stephenson & Tom de Csilléry", "Humphrey Allen & Philip Sosnin", "Elizabeth Stephenson", "Matthew Fall", "Holly Davis & Arianna Chan", "Sam Reynolds", "Sam Reynolds", "Max Fryer", ""],
        ["2020-2021", "Sam Reynolds", "Ilya Carey", "Edmund Ross", "Harry Piercy", "Elizabeth Stephenson", "Anna Kelly & Alex Pantelides", "Jacob Rose", "Hugo Burgess", "Marcus Samuel & Isma'eel Zia", "Sophie Miocevich", "", "Humphrey Allen", ""],
        ["2019-2020","Timo Zheng","Robert Ryan","Ed Mabon","Sam Reynolds","Ollie Carr","Mikey Matthews & Alice Kirk","Igor Mazur","Ilya Carey","Anna Kelly","Sophie Miocevich & Nina","Nina","Mikey Matthews", ""],
        ["2018-2019","Holly Rowland","Izzy Bentley","Sophie Miocevich","Elin Falla","Omar Shah & Timo Zheng","Alex Nicol & Bethan Morris","Charlie Fraser","Ed Mabon","Joe Taylor & Sophia Georgescu","Sophie Miocevich","Francesca Rigg","Daniel Wainwright", ""],
        ["2017-2018","Ed Wheatcroft","Jemima Churchhouse","Gwilym Rowbottom","Sophie Miocevich","Ed Bray & Robert Morse","Holly Rowland & Alice Kirk","James Kent","Timo Zheng","Isabella Bentley & Joe Taylor","Jia Yuan Loke & Charlie Fraser","Jia Yuan Loke & Charlie Fraser","James Lomax", ""],
        ["2016-2017","Gwilym Rowbottom","Kris Cao","Liat Adler","George Harding-Perrott","Ed Wheatcroft & Alex Law","Ed Bray","Cameron Holloway","Isabella Bentley","Roberto Cecere & Jemima Churchhouse","none","Gwilym Rowbottom","", ""],
        ["2015-2016","Philip Glass","Daniel Zheng","Matthew Wong","Veronika Siska","Ed Wheatcroft & Andrew Cherenkov","Kris Cao","Will Kernick","Gwilym Rowbottom","Ed Bray","Daniel Zheng","Rose Pearson","", ""],
        ["2014-2015","Tom Hare","Laurent Michaux","Luke Bounds","Daniel Zheng","Alexander Law","Helen Fox & Liam Carter","Rose Pearson","Philip Glass","Lucy Sawyer","Cameron Holloway","Evan Miles","", ""],
        ["2013-2014","Liam Carter","Laurence Cowton","Luke Bounds","Philip Glass","Daniel Zheng and Thomas Geh","Daniel Zheng and Thomas Geh","Tom Hare","Amelia Fischer-Linnett","Nick Jarman and Laurence Orchard","Jack Ogden and Nick Jarman","Evan Miles","", ""],
        ["2012-2013","Laurence Cowton","Fabian Jakubczik","Ed Feldman","Vincent Lister","Liam Carter","Liam Carter","Tom Hare (Alpine) & Ivo Dawkins (Winter)","Amelia Fischer-Linnett","Jack Ogden","Nick Jarman","Dawn Hollis","", ""]
    ] // TODO: Maybe don't hardcode this?
}

router.get('/past', function(req, res, next) {
    res.json({
        head: oldCommittee.head,
        body: oldCommittee.body,
    });
});

router.get('/current', committeeAuth, async function(req, res) {
    return members.getCommittee().then(committee => {
        res.json(committee);
    });
});

module.exports = router;
