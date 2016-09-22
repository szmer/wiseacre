function Distribution () {
    this.msgLength = 0 // all frequencies summed
    this.freqs = {}
}

function makeDistribution (tokens) {
    var d = new Distribution()
    d.msgLength = tokens.length
    for (var t in tokens) {
        //if (tokens[t] in d.freqs)
        //    d.freqs[tokens[t]] ++
        //else
            d.freqs[tokens[t]] = 1
    }
    return d
}

function crossEntropy (p, q) {
    var crEntropy = 0
    var unknownProb = 0 // count probability of words which doesn't appear in q
    var maxQCodeLength = -10 // multiplied by e will be assigned to the unknowns in q

    for (var word in p.freqs) {
        var wordPProb = p.freqs[word] / p.msgLength
        if (! q.freqs.hasOwnProperty(word))
            unknownProb += wordPProb
        else {
            // we use natural logarithm, not log 2, because of browser compatibility
            var qCodeLength = (- Math.log( q.freqs[word] / q.msgLength ))
            if (qCodeLength > maxQCodeLength)
                maxQCodeLength = qCodeLength
            crEntropy += wordPProb * qCodeLength
        }
    }

    crEntropy += unknownProb * maxQCodeLength * Math.E
    return crEntropy
}

function distrDifference (p, q) {
    var diff = 0

    var pExpectFreq = p.msgLength / Object.keys(p.freqs).length
    var qExpectFreq = q.msgLength / Object.keys(q.freqs).length

    for (var word in p.freqs) {
        var wordPFreq = p.freqs[word]
        var wordQFreq
        if (! q.freqs.hasOwnProperty(word))
            wordQFreq = 0
        else
            wordQFreq = q.freqs[word]
        var pDeviation = (wordPFreq - pExpectFreq) / p.msgLength
        var qDeviation = (wordQFreq - qExpectFreq) / q.msgLength
        diff += Math.pow(pDeviation-qDeviation, 2)
    }

    return (-diff) / p.msgLength
}
