function makeRoom (match) { return ' '+match }
function movePunctuation (str) { return str.replace(/[,:;()]/g, makeRoom) }

function repeatStr(str, times) {
    var ret = str
    for(var i = 1; i < times; i++) ret += str
    return ret
}

function updFreqEntry (obj, key) {
    if (key in obj)
        obj[key] ++
    else
        obj[key] = 1
}

function nGramFreqs (textStr, n) {
    var freqs = Object()

    // replace !s and ?s with dots, then split by dots
    var sents = textStr.replace(/[!?]/g, '.').split('.')

    for (s in sents) {
        var sent = sents[s]
        var tokens = movePunctuation(sent).split(' ')

        // for each of the actual n-grams in the sentence, increment its entry:
        for (var i = 0; i < tokens.length-(n-1); i++)
            updFreqEntry(freqs, tokens.slice(i, i+n).join(' '))

        // for each of the remaining words, make for them fake n-grams with dots as dummy words
        // (note that we already removed the actual in-text dots)
        for (var i = tokens.length-(n-1); i < tokens.length; i++)
            updFreqEntry(freqs, tokens.slice(i).join(' ')+repeatStr(' .', tokens.length-i))
    }

    return freqs
}

