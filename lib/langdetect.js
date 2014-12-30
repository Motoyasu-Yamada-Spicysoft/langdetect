var fs       = require('fs');
var Detector = require('./Detector');

module.exports.load_profiles = function(profileDirectory) {
    var profiles = { wordLangProbMap: {}, langlist: [], seed: null };
    var files = fs.readdirSync(profileDirectory).filter(filter);
    function filter(f) {
        return f.substr(0,1) !== '.' && fs.statSync(profileDirectory + "/" + f).isFile(); 
    }
    if (!files) {
        throw ("Not found profile: " + profileDirectory);
    }
    var langsize = files.length;
    var index    = 0;
    files.forEach(load_profile1);
    return profiles;

    function load_profile1(file) {
        var text = fs.readFileSync(profileDirectory + "/" + file, {encoding: 'utf8'});
        var profile = JSON.parse(text);
        add_profile(profiles, profile, index, langsize);
        index++;
    }
};

module.exports.add_profile = function (profiles, profile, index, langsize) {
    var lang = profile.name;
    if (!lang || lang in profiles.langlist) {
        throw "duplicate the same language profile";
    }
    profiles.langlist.push(lang);
    Object.keys(profile.freq).forEach(itr);

    function itr(word) {
        if (!(word in profiles.wordLangProbMap)) {
            profiles.wordLangProbMap[word] = new Array(langsize);
        }
        var length = word.length;
        if (1 <= length && length <= 3) {
            var prob = parseFloat(profile.freq[word]) / profile.n_words[length - 1];
            profiles.wordLangProbMap[word][index] = prob;
        }
    }
};

module.exports.create_detector = function(profiles, alpha) {
    if (!profiles || ! ("langlist" in profiles) || !profiles.langlist.length) {
        throw "need to load profiles";
    }
    return new Detector(profiles, alpha);
};

module.exports.detect =  function(text, profiles) {
    var detector = this.create_detector(profiles);
    detector.append_text(text);
    var p = detector.get_probabilities();
    return p;
};