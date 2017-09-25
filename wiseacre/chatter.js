function emptyObj (obj) {
    for (var k in obj)
        return false
    return true
}

function makeRoom (match) { return ' '+match }
function strTrim (str) { return str.trim() }
function movePunctuation (str) { return str.replace(/[,.!?:;()]/g, makeRoom) }
function alignPunctuation (str) { return str.replace(/ [,.!?:;()]/g, strTrim)}

// repeat returns an array of the elem repeated times times.
function repeat (elem, times) {
    var ret = [ elem ]
    for(var i = 1; i < times; i++) ret.push( elem )
    return ret
}

function tokenize (str) {
    return movePunctuation(str).split(' ')
}

// updNGramEntry increases the probability of tokens[0] by addProb and passes the rest of the tokens
// array (if tokens.slice(1).length > 0) to the recursive calls of updNGramEntry, moving in the
// requested direction. Thus this function increases the probability of the main entry and frequen-
// cies of its descendants (which should be normalized later to obtain the actual probabilities).
// The tokens.length of the initial call should be equal n in your n-gram table.
function updNGramEntry (entry, tokens, direction, addProb) {
    entry.prob += addProb

    // Regardless of the requested addProb, pass down 1.0, indicating that downstream probabilities
    // have to be normalized later (for them we can't figure out the number of samples just yet).
    if (tokens.length > 1) {
        if (! entry[direction].hasOwnProperty(tokens[1]))
            entry[direction][tokens[1]] = new NGramNode
        updNGramEntry(entry[direction][tokens[1]], tokens.slice(1), direction, 1.0)
    }
}

// normalizeNGramEntry normalizes probabilities of the entry's descendants in the requested
// direction, and invokes normalizeNGramEntry function for each of them.
function normalizeNGramEntry (entry, direction) {
    var nextTotal = 0.0
    for (var k in entry[direction])
        nextTotal += entry[direction][k].prob
    for (var k in entry[direction]) {
        entry[direction][k].prob /= nextTotal
        normalizeNGramEntry(entry[direction][k], direction)
    }
}

function NGramNode (form) {
    // Our probability of being in this state, given the previous state.
    this.prob = 0.0

    // From each of the core nodes in a n-gram model we have paths of n-1 next/previous states. In
    // the end states these variables should remain empty objects.
    this.forw = Object() // possible next states (i.e. words)
    this.backw = Object() // possible previous states (i.e. words)
}

// nGrams return an object, where the labels are tokens which can be found in the textStr. To each
// token the function assigns a chain of NGramNode objects of length n (including the main node),
// leading forward and backward. The ?, !. . characters are treated as sentence delimeters and remo-
// ved. At the sentence boundaries the function inserts dummy . entries to make sure that n-length
// rule is preserved.
function nGrams (textStr, n) {
    var ngrams = Object()

    // replace !s and ?s with dots, then split by dots
    var sents = textStr.replace(/[!?]/g, '.').split('.')
    var sent_tokens = [] // list of tokens for each sentence

    var wordTotal = 0
    for (var s in sents) {
        sent_tokens[s] = tokenize(sents[s]) 

        wordTotal += sent_tokens[s].length

        // Ensure that each wprd has its NGramNode entry.
        for (var w in sent_tokens[s])
            if (! ngrams.hasOwnProperty(sent_tokens[s][w]))
                ngrams[sent_tokens[s][w]] = new NGramNode()
    }

    // This is a probability unit that each word will receive for its one occurrence.
    var probUnit =  1//.0 / wordTotal

    // Build the ngram chains from words of each sentence.
    for (var s in sent_tokens) {
        // Add dots at the sentence boundaries, so they will have some representation in our ngrams.
        // (note that we already removed the actual in-text dots)
        var tokens = repeat('.', n-1) .concat(sent_tokens[s], repeat('.', n-1))

        for (var i = n-1; i < tokens.length-(n-1); i++)
            updNGramEntry(ngrams[tokens[i]], tokens.slice(i, i+n), 'forw', probUnit)
        for (var i = tokens.length-n; i >= n-1; i--)
            // Here we don't want to increase the probability, since we've already made it above.
            updNGramEntry(ngrams[tokens[i]], tokens.slice(i-n+1, i+1).reverse(), 'backw', 0.0)
    }

    // Normalize the probabilities of the embedded paths.
    for (var k in ngrams) {
        normalizeNGramEntry(ngrams[k], 'forw')
        normalizeNGramEntry(ngrams[k], 'backw')
    }

    return ngrams
}

// randomWord returns a random word drawn from the ngrams table.
function randomWord(ngrams) {
    var len = Object.keys(ngrams).length
    var key = Object.keys(ngrams)[Math.round(Math.random() * len)]
    return key
}

// chooseNext returns a key (word form) of the node leading in the desired direction which has the
// highest value of the evaluateFunc (when applied to its prob property), The function returns an
// empty string if the ngramEntry has no descendants.
function chooseNext (ngramEntry, direction, evaluateFunc) {
    var best_score = -Infinity
    var winning_option = ''

    for (var k in ngramEntry[direction]) {
        // Keep the value of evaluateFunc, as it may change and/or be expensive.
        var e = evaluateFunc(ngramEntry[direction][k].prob)
        if (e > best_score) {
            best_score = e
            winning_option = k
        }
    }

    return winning_option
}

// generateChain builds a chain of words in the desired direction, and returns them as an array (the
// caller may want to reverse it if the direction is backwards), The chain is terminated if the
// ngrams dictate the end of a sentence, or when max_len words are generated.
function generateChain (ngrams, word, direction, max_len) {
    var chain = []
    var nextWord = word
    var nextEntry = ngrams[word]
    var counter = 0
    while (nextWord != '.' && counter < max_len) {
        counter ++
        chain.push(nextWord)

        if (emptyObj(nextEntry[direction]))
            nextEntry = ngrams[nextWord]

        nextWord = chooseNext(nextEntry, direction,
                              function(x){return x * Math.random()})
        nextEntry = nextEntry[direction][nextWord]
    }
    return chain
}

// cleanSentence throws away some incorrect punctuation from the beginning of the sentence string,
// and ensures that the first letter is lowercase. Leading and trailing spaces are also removed.
function cleanSentence(str) {
    for(var i = 0; i < str.length; i++) {
        var c = str.charAt(i)
        // Remove the punctuation that shouldn't appear at the beginning of a sentence.
        if(',:;.)'.indexOf(c) != -1) {
            str = str.substr(0, i) + str.substr(i+1)
            i --
        }
        // Change the first lowercase letter to uppercase.
        else if (c != c.toLocaleUpperCase()) {
            str = str.substr(0, i) + c.toLocaleUpperCase() + str.substr(i+1)
            break
        }
        // But break if the first letter is uppercase anyway.
        if (c != c.toLocaleLowerCase())
            break
    }
    return str.trim();
}

// generateSentence returns a sentence built around a word that is present in ngrams table.
function generateSentence(ngrams, stemWord) {
    var sent = generateChain(ngrams, stemWord, 'backw', 20).reverse()
    sent = sent.concat( generateChain(ngrams, stemWord, 'forw', 20).slice(1) )
    sent = alignPunctuation( sent.join(' ')+'.' )
    return cleanSentence(sent)
}

// generateResponse returns a response, given utterance, or false if it's unable to do so (i.e.
// there is no known words in the utterance)
function generateResponse(ngrams, utterance) {
    var tokens = tokenize(utterance)
    var stem_word = tokens[Math.floor(Math.random() * utterance.length)]

    if (stem_word && !(stem_word in ngr)) {
        if (stem_word.toLocaleLowerCase() in ngr)
            stem_word = stem_word.toLocaleLowerCase()
    }
    if (!stem_word || !(stem_word in ngr) || stem_word.length == 0) {
        if(Math.random() < 0.94)
            return false
        else
            stem_word = randomWord(ngr)
    }

    return generateSentence(ngrams, stem_word)
}

// Return an array with tokens replaced with their Markov model neighbors.
function invertTokens (ngrams, tokens) {
    result = []
    for (t in tokens) {
        token = tokens[t]
        entry = ngrams[token]
        if (entry)
            result = result.concat(Object.getOwnPropertyNames(entry.backw),
                                   Object.getOwnPropertyNames(entry.forw))
    }
    return result
}

function queryHandler (ngr, utterance, scoreFunc) {
    // we look for the lowest result of scoreFunc!
    var respCandidates = []
    for (var i = 0; i < 15; i++)
        respCandidates.push(generateResponse(ngr, utterance))
    var minScore = Infinity
    var winnerResponse = []
    var utteranceDist = makeDistribution(invertTokens(ngr, tokenize(utterance)))
    utteranceDist.msgLength += 1 // just in case it was zero
    for (var i = 0; i < respCandidates.length; i++) {
        if (!respCandidates[i]) continue
        var respTokens = tokenize(respCandidates[i])
        if (respTokens.length < 4) continue
        var respDist = makeDistribution(invertTokens(ngr, respTokens))
        var score = scoreFunc(utteranceDist, respDist)
        if (score < minScore) {
            winnerResponse = respCandidates[i]
            minScore = score
        }
    }

    return winnerResponse
}
