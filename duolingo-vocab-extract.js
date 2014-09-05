(function(console) {
	console.save = function(data, filename) {
		if (!data) {
			console.error('Console.save: No data')
			return;
		}
		if (!filename) filename = 'console.json'

		if (typeof data === "object") {
			data = JSON.stringify(data, undefined, 4)
		}

		var blob = new Blob([data], {
				type: 'text/json'
			}),
			e = document.createEvent('MouseEvents'),
			a = document.createElement('a')

		a.download = filename
		a.href = window.URL.createObjectURL(blob)
		a.dataset.downloadurl = ['text/json', a.download, a.href].join(':')
		e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
		a.dispatchEvent(e)
	}
})(console)

var vocabList = new duo.VocabList()
vocabList.fetch({
	data: {},
	success: function() {
		// console.save(vocabList, "vocabList.json")

		var vocabIndex = _.groupBy(vocabList.models, function(model) {
			return model.attributes.word_string
		})

		var words = _.map(vocabIndex, function(vocab) {
			return vocab[0].attributes.word_string
		})	

		var ready = _.after(Number.parseInt(words.length/10+1), function(){
			console.save(vocabList, "vocabList.json")
		});

		for (var i = 0; i < words.length; i += 10) {
			var wordSlice = words.slice(i, i + 10);
			var tokens = JSON.stringify(wordSlice)

			$.ajax({
				url: "https://d.duolingo.com/words/hints/de/en",
				dataType: "jsonp",
				data: {
					tokens: tokens
				},
				type: "GET",
				error: function(err) {
					console.error(err);
				},
				success: function(res) {
					for (var i in res) {
						var vInd = vocabIndex[i];
						for (var j in vInd) {
							var vocab = vInd[j];
							_.extend(vocab.attributes, {
								translation: res[i]
							});
						}
					}
					console.log(res);
					ready()
				}
			})
		}
	}
})
